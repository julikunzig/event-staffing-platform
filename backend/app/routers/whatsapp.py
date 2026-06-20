"""
WhatsApp webhook router.
Receives messages from Twilio, processes them with AI, and creates events.
"""

from fastapi import APIRouter, Request, Form, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Annotated
from app.core.database import get_db
from app.core.config import settings
from app.services.whatsapp_service import (
    send_whatsapp,
    extract_event_from_message,
    format_event_confirmation,
    HELP_ES,
    HELP_EN,
)

router = APIRouter(prefix="/whatsapp", tags=["whatsapp"])


def twiml_response(message: str) -> PlainTextResponse:
    """Return a TwiML response that Twilio will send back as WhatsApp message."""
    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>{message}</Message>
</Response>"""
    return PlainTextResponse(content=xml, media_type="application/xml")


@router.post("/webhook")
async def whatsapp_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    From: str = Form(...),
    Body: str = Form(...),
    ProfileName: str = Form(default=""),
):
    """
    Twilio WhatsApp webhook.
    Receives a message, verifies the sender is an admin, extracts event data with AI,
    creates the event, and replies with confirmation.
    """
    from app.models import User, UserCompanyMembership, Profile, JobRole, Event, EventJobRole
    from app.services.geocoding import geocode_address

    # Normalize phone number (remove whatsapp: prefix and + sign)
    phone_raw = From.replace("whatsapp:", "").strip()
    phone_digits = phone_raw.lstrip("+")

    message = Body.strip()
    msg_lower = message.lower().strip()
    print(f"[WhatsApp] Message from {phone_raw}: '{message}' | msg_lower='{msg_lower}'")

    # Detect language from message (simple heuristic)
    language = "en" if any(w in message.lower() for w in ["create", "event", "wedding", "party", "the", "and"]) else "es"

    # ── ACCEPT / REJECT invitation via WhatsApp ──────────────────────────────
    # Employee replies "1" to accept or "2" to reject
    # Message format: "1" or "2" (optionally with assignment ID in previous message context)
    # We detect by looking for "1" or "2" as the entire message, or "aceptar"/"rechazar"
    import re as _re
    accept_keywords = {"1", "aceptar", "accept", "si", "sí", "yes", "ok", "confirmar", "confirm"}
    reject_keywords = {"2", "rechazar", "reject", "no", "cancelar", "cancel", "declinar", "decline"}

    # Check if message contains assignment ID pattern: "1 123" or "2 123"
    assignment_id_match = _re.match(r'^([12])\s+(\d+)$', msg_lower)

    if msg_lower in accept_keywords or msg_lower in reject_keywords or assignment_id_match:
        from app.models import EventAssignment, Event as EventModel
        # Find the user by phone - try multiple formats
        from sqlalchemy import or_
        user_result = await db.execute(
            select(User).where(
                User.is_active == True,
                or_(
                    User.phone == phone_raw,
                    User.phone == phone_digits,
                    User.phone == f"+{phone_digits}",
                    User.phone.like(f"%{phone_digits[-10:]}"),  # Last 10 digits
                )
            ).limit(1)
        )
        emp = user_result.scalar_one_or_none()

        if not emp:
            return twiml_response("❌ Tu número no está registrado en EventsControl." if language == "es" else "❌ Your number is not registered in EventsControl.")

        # Find their pending invitation
        if assignment_id_match:
            action = "accept" if assignment_id_match.group(1) == "1" else "reject"
            assignment_id = int(assignment_id_match.group(2))
            assignment_result = await db.execute(
                select(EventAssignment).where(
                    EventAssignment.id == assignment_id,
                    EventAssignment.user_id == emp.id,
                    EventAssignment.status == "invited",
                )
            )
        else:
            action = "accept" if msg_lower in accept_keywords else "reject"
            # Find the most recent pending invitation
            assignment_result = await db.execute(
                select(EventAssignment).where(
                    EventAssignment.user_id == emp.id,
                    EventAssignment.status == "invited",
                ).order_by(EventAssignment.created_at.desc()).limit(1)
            )

        assignment = assignment_result.scalar_one_or_none()

        if not assignment:
            msg = "No tienes invitaciones pendientes." if language == "es" else "You have no pending invitations."
            return twiml_response(msg)

        event_obj = await db.get(EventModel, assignment.event_id)
        event_name = event_obj.name if event_obj else f"Evento #{assignment.event_id}"
        first_name = emp.name.split()[0].capitalize() if emp.name else ""

        if action == "accept":
            assignment.status = "approved"
            await db.flush()
            # Update event status (will set to "filled" if all slots are filled)
            from app.services.event_status import check_and_update_event_status
            await check_and_update_event_status(assignment.event_id, db)
            await db.commit()
            msg = (
                f"✅ ¡Perfecto {first_name}! Has *aceptado* la invitación para el evento *{event_name}*.\n"
                f"Te esperamos. ¡Hasta pronto! 🎉"
                if language == "es" else
                f"✅ Great {first_name}! You have *accepted* the invitation for *{event_name}*.\n"
                f"See you there! 🎉"
            )
        else:
            assignment.status = "rejected"
            await db.commit()
            msg = (
                f"❌ Has *rechazado* la invitación para el evento *{event_name}*, {first_name}.\n"
                f"Si cambias de opinión, contáctanos."
                if language == "es" else
                f"❌ You have *declined* the invitation for *{event_name}*, {first_name}.\n"
                f"If you change your mind, please contact us."
            )

        # ── Notify admin: email + push (no WhatsApp) ────────────────────────
        try:
            from app.models import UserCompanyMembership, Profile, JobRole as JR
            from app.services.email_service import send_invitation_response_email

            if event_obj:
                admin_result = await db.execute(
                    select(User)
                    .join(UserCompanyMembership, UserCompanyMembership.user_id == User.id)
                    .join(Profile, Profile.id == UserCompanyMembership.profile_id)
                    .where(
                        UserCompanyMembership.company_id == event_obj.company_id,
                        UserCompanyMembership.is_active == True,
                        User.is_active == True,
                        Profile.code.in_(["admin", "super_admin"]),
                    )
                )
                admins = admin_result.scalars().all()
                job_role = await db.get(JR, assignment.job_role_id)
                role_name = job_role.name if job_role else f"Rol #{assignment.job_role_id}"
                event_date_str = str(event_obj.event_date) if event_obj else ""

                for admin in admins:
                    # Email al admin
                    if admin.email:
                        await send_invitation_response_email(
                            admin_email=admin.email,
                            employee_name=emp.name,
                            event_name=event_name,
                            role_name=role_name,
                            event_date=event_date_str,
                            accepted=(action == "accept"),
                        )
                        print(f"[WhatsApp] Admin email sent: {admin.email} — {emp.name} {'accepted' if action == 'accept' else 'rejected'} {event_name}")
                    # WhatsApp al admin
                    if admin.phone and admin.id != emp.id:
                        from app.services.whatsapp_service import send_whatsapp
                        if action == "accept":
                            wa_msg = f"✅ *{emp.name}* aceptó la invitación para *{event_name}* ({event_date_str}) como {role_name}."
                        else:
                            wa_msg = f"❌ *{emp.name}* rechazó la invitación para *{event_name}* ({event_date_str}) como {role_name}."
                        send_whatsapp(admin.phone, wa_msg)
                        print(f"[WhatsApp] Admin WhatsApp sent: {admin.phone} — {emp.name} {'accepted' if action == 'accept' else 'rejected'} {event_name}")
                    # Push al admin
                    try:
                        from app.services.push_service import send_push_to_user
                        icon = "✅" if action == "accept" else "❌"
                        verb = "aceptó" if action == "accept" else "rechazó"
                        await send_push_to_user(
                            admin.id,
                            f"{icon} {emp.name} {verb} la invitación",
                            f"Evento: {event_name}",
                            "/events",
                            db,
                        )
                    except Exception as pe:
                        print(f"[WhatsApp] Push error for admin {admin.id}: {pe}")
        except Exception as e:
            print(f"[WhatsApp] Error notifying admin: {e}")

        return twiml_response(msg)

    # Help command
    if message.lower() in ["help", "ayuda", "hola", "hi", "hello", "/start"]:
        return twiml_response(HELP_EN if language == "en" else HELP_ES)

    # ── CLOCK IN / CLOCK OUT via WhatsApp ────────────────────────────────────
    clock_in_keywords = {"inicio", "iniciar", "start", "clock in", "clockin", "entrada"}
    clock_out_keywords = {"finalizar", "finish", "terminar", "clock out", "clockout", "fin", "salida", "end"}

    if msg_lower in clock_in_keywords or msg_lower in clock_out_keywords:
        print(f"[WhatsApp] CLOCK command detected: '{msg_lower}'")
        from app.models import EventAssignment, Shift, Event as EventModel
        from app.models import EventJobRole as EJR, JobRole as JR
        from decimal import Decimal
        from datetime import datetime as dt_class

        # Find employee by phone
        emp_result = await db.execute(
            select(User).where(
                User.is_active == True,
                User.phone.in_([phone_raw, phone_digits, f"+{phone_digits}"])
            ).limit(1)
        )
        emp = emp_result.scalar_one_or_none()
        if not emp:
            return twiml_response("❌ Tu número no está registrado." if language == "es" else "❌ Your number is not registered.")

        first_name = emp.name.split()[0].capitalize() if emp.name else ""
        # Use UTC for storage (consistent with rest of app), local time for display
        from datetime import timedelta
        now = dt_class.utcnow()
        # Display time in EDT (UTC-4) for WhatsApp messages
        display_time = (now - timedelta(hours=4)).strftime("%I:%M %p")

        if msg_lower in clock_in_keywords:
            # Find approved assignment for today without a shift
            from datetime import date as date_type
            today = (dt_class.utcnow() - timedelta(hours=4)).date()  # Local date (EDT)
            assignments_result = await db.execute(
                select(EventAssignment, EventModel)
                .join(EventModel, EventAssignment.event_id == EventModel.id)
                .where(
                    EventAssignment.user_id == emp.id,
                    EventAssignment.status == "approved",
                    EventModel.event_date == today,
                )
            )
            assignments = assignments_result.all()

            # Find one without a shift
            target_assignment = None
            for assignment, event_obj in assignments:
                shift_check = await db.execute(select(Shift).where(Shift.assignment_id == assignment.id))
                if not shift_check.scalar_one_or_none():
                    target_assignment = assignment
                    break

            if not target_assignment:
                return twiml_response(
                    f"⚠️ {first_name}, no tienes turnos pendientes de iniciar hoy." if language == "es"
                    else f"⚠️ {first_name}, you have no shifts to start today."
                )

            # Get hourly rate
            role = await db.get(JR, target_assignment.job_role_id)
            hourly_rate = role.hourly_rate if role else Decimal("0")
            if target_assignment.event_job_role_id:
                ejr = await db.get(EJR, target_assignment.event_job_role_id)
                if ejr and ejr.hourly_rate_override:
                    hourly_rate = ejr.hourly_rate_override

            # Create shift
            shift = Shift(
                assignment_id=target_assignment.id,
                clock_in=now,
                clock_in_lat=Decimal("0"),
                clock_in_lng=Decimal("0"),
                hourly_rate_snapshot=hourly_rate,
                is_paused=False,
                total_pause_minutes=Decimal("0"),
            )
            db.add(shift)
            await db.flush()

            # Update event status to started
            ev = await db.get(EventModel, target_assignment.event_id)
            if ev and ev.status in ("published", "filled", "filled_pending"):
                ev.status = "started"
                await db.flush()

            await db.commit()
            return twiml_response(
                f"✅ *Turno iniciado*, {first_name}!\n🕐 Hora: {display_time}\n\nCuando termines, envía *finalizar*."
                if language == "es" else
                f"✅ *Shift started*, {first_name}!\n🕐 Time: {display_time}\n\nWhen done, send *finish*."
            )

        else:
            # Clock out - find active shift (has clock_in but no clock_out)
            active_shift_result = await db.execute(
                select(Shift, EventAssignment)
                .join(EventAssignment, Shift.assignment_id == EventAssignment.id)
                .where(
                    EventAssignment.user_id == emp.id,
                    Shift.clock_in.isnot(None),
                    Shift.clock_out.is_(None),
                )
                .order_by(Shift.clock_in.desc())
                .limit(1)
            )
            row = active_shift_result.first()
            if not row:
                return twiml_response(
                    f"⚠️ {first_name}, no tienes un turno activo para finalizar." if language == "es"
                    else f"⚠️ {first_name}, you don't have an active shift to finish."
                )

            shift, assignment = row

            # Get company config for min_shift_hours
            from app.models import WeeklyHoursConfig
            ev_for_config = await db.get(EventModel, assignment.event_id)
            company_id_emp = assignment.company_id
            config_r = await db.execute(select(WeeklyHoursConfig).where(WeeklyHoursConfig.company_id == company_id_emp))
            config_obj = config_r.scalar_one_or_none()
            min_shift = float(config_obj.min_shift_hours) if config_obj else 0.0

            # Calculate hours - ensure both are naive local time
            clock_in_naive = shift.clock_in.replace(tzinfo=None) if shift.clock_in and shift.clock_in.tzinfo else shift.clock_in
            gross_seconds = (now - clock_in_naive).total_seconds()
            hours_worked = Decimal(str(round(max(gross_seconds / 3600, 0), 2)))
            pause_hours = Decimal(str(round(float(shift.total_pause_minutes or 0) / 60, 4)))
            net_hours = max(Decimal("0"), hours_worked - pause_hours)

            # Apply minimum shift hours
            if float(net_hours) < min_shift and min_shift > 0:
                net_hours = Decimal(str(min_shift))

            total_pay = (net_hours * shift.hourly_rate_snapshot).quantize(Decimal("0.01"))

            shift.clock_out = now
            shift.hours_worked = net_hours
            shift.total_pay = total_pay
            shift.regular_pay = total_pay
            shift.overtime_pay = Decimal("0")
            await db.flush()
            await db.commit()

            min_msg = f"\n📋 Mínimo aplicado: {min_shift}h" if float(net_hours) == min_shift and min_shift > 0 and float(hours_worked - pause_hours) < min_shift else ""
            return twiml_response(
                f"✅ *Turno finalizado*, {first_name}!\n🕐 Hora: {display_time}\n⏱ Horas: {net_hours:.2f}h\n💰 Pago: ${total_pay}{min_msg}\n\n¡Gracias por tu trabajo!"
                if language == "es" else
                f"✅ *Shift ended*, {first_name}!\n🕐 Time: {display_time}\n⏱ Hours: {net_hours:.2f}h\n💰 Pay: ${total_pay}{min_msg}\n\nThank you for your work!"
            )

    # Find user by phone number — try multiple formats
    user_result = await db.execute(
        select(User).where(
            User.is_active == True,
            User.phone.in_([
                phone_raw,
                phone_digits,
                f"+{phone_digits}",
                f"({phone_digits[:3]}) {phone_digits[3:6]}-{phone_digits[6:]}" if len(phone_digits) == 10 else phone_digits,
            ])
        ).limit(1)
    )
    user = user_result.scalar_one_or_none()

    if not user:
        msg = (
            "❌ Your phone number is not registered in EventsControl. "
            "Please contact your administrator."
            if language == "en" else
            "❌ Tu número de teléfono no está registrado en EventsControl. "
            "Contacta a tu administrador."
        )
        return twiml_response(msg)

    # Check if user is admin in any company
    admin_membership = await db.execute(
        select(UserCompanyMembership, Profile)
        .join(Profile, Profile.id == UserCompanyMembership.profile_id)
        .where(
            UserCompanyMembership.user_id == user.id,
            UserCompanyMembership.is_active == True,
            Profile.code.in_(["admin", "super_admin"]),
        )
        .limit(1)
    )
    membership_row = admin_membership.first()

    if not membership_row:
        msg = (
            "❌ You don't have admin permissions to create events."
            if language == "en" else
            "❌ No tienes permisos de administrador para crear eventos."
        )
        return twiml_response(msg)

    membership, profile = membership_row
    company_id = membership.company_id

    # Extract event data from message using AI
    thinking_msg = "⏳ Processing your message..." if language == "en" else "⏳ Procesando tu mensaje..."
    # Note: We can't send intermediate messages with TwiML, so we process synchronously

    event_data = await extract_event_from_message(message, language)

    if not event_data or not event_data.get("name") or not event_data.get("event_date") or not event_data.get("start_time"):
        msg = (
            "❌ I couldn't understand the event details. Please try again with:\n\n"
            "_\"Create event: Name, date, time, address, dress code, staff needed\"_"
            if language == "en" else
            "❌ No pude entender los detalles del evento. Intenta de nuevo con:\n\n"
            "_\"Crear evento: Nombre, fecha, hora, dirección, dress code, personal necesario\"_"
        )
        return twiml_response(msg)

    # Validate and get job roles
    roles_data = event_data.get("roles") or []
    event_job_roles = []

    for role_info in roles_data:
        role_name = role_info.get("name", "").strip().upper()
        slots = int(role_info.get("slots", 1))

        # Find matching job role in company
        role_result = await db.execute(
            select(JobRole).where(
                JobRole.company_id == company_id,
                JobRole.is_active == True,
                JobRole.name.ilike(f"%{role_name}%"),
            ).limit(1)
        )
        job_role = role_result.scalar_one_or_none()

        if job_role:
            event_job_roles.append({"job_role_id": job_role.id, "slots_required": slots})

    if not event_job_roles:
        # If no roles matched, get the first available role as default
        default_role = await db.execute(
            select(JobRole).where(
                JobRole.company_id == company_id,
                JobRole.is_active == True,
            ).limit(1)
        )
        dr = default_role.scalar_one_or_none()
        if dr:
            event_job_roles = [{"job_role_id": dr.id, "slots_required": 1}]
        else:
            msg = (
                "❌ No job roles found in your company. Please create roles in the app first."
                if language == "en" else
                "❌ No se encontraron roles laborales en tu empresa. Crea roles en la app primero."
            )
            return twiml_response(msg)

    # Geocode address
    address = event_data.get("address", "")
    city = event_data.get("city") or ""
    state = event_data.get("state") or ""
    zip_code = event_data.get("zip_code") or ""

    lat, lng = await geocode_address(address, city, state, zip_code)

    # Create the event
    from datetime import datetime, date, time as time_type

    try:
        event_date_obj = datetime.strptime(event_data["event_date"], "%Y-%m-%d").date()
        start_time_obj = datetime.strptime(event_data["start_time"], "%H:%M").time()
        end_time_obj = None
        if event_data.get("end_time"):
            try:
                end_time_obj = datetime.strptime(event_data["end_time"], "%H:%M").time()
            except Exception:
                pass
    except Exception as e:
        msg = (
            f"❌ Invalid date or time format: {e}"
            if language == "en" else
            f"❌ Formato de fecha u hora inválido: {e}"
        )
        return twiml_response(msg)

    event = Event(
        company_id=company_id,
        name=event_data["name"].strip().upper(),
        event_date=event_date_obj,
        start_time=start_time_obj,
        end_time=end_time_obj,
        address=address.strip().upper() if address else address,
        city=city.strip().upper() if city else None,
        state=state.strip().upper() if state else None,
        zip_code=zip_code.strip() if zip_code else None,
        latitude=lat,
        longitude=lng,
        dress_code=event_data.get("dress_code", "").strip().upper() if event_data.get("dress_code") else None,
        is_public=True,
        status="created",
        created_by=user.id,
    )
    db.add(event)
    await db.flush()

    # Generate event_code: {company_id}-{consecutive}
    existing_codes_result = await db.execute(
        select(Event.event_code).where(
            Event.company_id == company_id,
            Event.event_code.isnot(None),
        )
    )
    max_consecutive = 0
    for (code,) in existing_codes_result.all():
        try:
            num = int(code.split("-")[-1])
            if num > max_consecutive:
                max_consecutive = num
        except (ValueError, IndexError):
            pass
    event.event_code = f"{company_id}-{max_consecutive + 1}"
    await db.flush()

    for jr in event_job_roles:
        ejr = EventJobRole(
            event_id=event.id,
            job_role_id=jr["job_role_id"],
            slots_required=jr["slots_required"],
            slots_filled=0,
        )
        db.add(ejr)

    await db.commit()
    await db.refresh(event)

    # Build confirmation message
    confirmation = format_event_confirmation(event_data, event.id, language)
    return twiml_response(confirmation)


@router.get("/webhook")
async def whatsapp_verify(request: Request):
    """Health check endpoint for Twilio webhook verification."""
    return PlainTextResponse("EventsControl WhatsApp Bot is running ✅")

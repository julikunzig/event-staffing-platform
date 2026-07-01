"""
WhatsApp webhook router — multitenant.

Twilio envía el campo `To` con el número que recibió el mensaje.
Ese número se usa para resolver qué empresa es la dueña del chatbot,
y todo el contexto (company_id, from_number) se maneja a partir de ahí.
"""

from fastapi import APIRouter, Request, Form, Depends
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.core.database import get_db
from app.models import CompanyWhatsAppSettings
from app.services.whatsapp_service import (
    send_whatsapp,
    extract_event_from_message,
    format_event_confirmation,
    HELP_ES,
    HELP_EN,
)

router = APIRouter(prefix="/whatsapp", tags=["whatsapp"])


def twiml_response(message: str) -> PlainTextResponse:
    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>{message}</Message>
</Response>"""
    return PlainTextResponse(content=xml, media_type="application/xml")


async def _resolve_company(to_number: str, db: AsyncSession) -> tuple[int | None, str | None]:
    """
    Resuelve company_id y whatsapp_number a partir del campo To de Twilio.
    Devuelve (None, None) si el número no está registrado o está inactivo.
    """
    normalized = to_number.strip()
    if not normalized.startswith("whatsapp:"):
        normalized = f"whatsapp:{normalized}"

    result = await db.execute(
        select(CompanyWhatsAppSettings).where(
            CompanyWhatsAppSettings.whatsapp_number == normalized,
            CompanyWhatsAppSettings.is_active == True,
        )
    )
    cfg = result.scalar_one_or_none()
    if cfg:
        return cfg.company_id, cfg.whatsapp_number
    return None, None


@router.post("/webhook")
async def whatsapp_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    From: str = Form(...),
    To: str = Form(...),
    Body: str = Form(...),
    ProfileName: str = Form(default=""),
):
    """
    Twilio WhatsApp webhook — multitenant.
    El campo `To` identifica la empresa; `From` identifica al usuario.
    """
    from app.models import User, UserCompanyMembership, Profile, JobRole, Event, EventJobRole

    # ── Resolver empresa por número destino ──────────────────────────────────
    company_id, from_number = await _resolve_company(To, db)
    if not company_id:
        # Número no configurado: responde sin enviar desde un número de empresa
        return twiml_response(
            "❌ Este número no está configurado como chatbot de ninguna empresa."
        )

    # Normalize sender phone
    phone_raw = From.replace("whatsapp:", "").strip()
    phone_digits = phone_raw.lstrip("+")

    message = Body.strip()
    msg_lower = message.lower().strip()
    print(f"[WhatsApp] company={company_id} | from={phone_raw} | msg='{message}'")

    language = "en" if any(
        w in message.lower()
        for w in ["create", "event", "wedding", "party", "the", "and"]
    ) else "es"

    def wa_send(to_phone: str, body: str) -> bool:
        return send_whatsapp(to_phone, body, from_number=from_number)

    # ── ACCEPT / REJECT invitation ────────────────────────────────────────────
    import re as _re
    accept_kw = {"1", "aceptar", "accept", "si", "sí", "yes", "ok", "confirmar", "confirm"}
    reject_kw = {"2", "rechazar", "reject", "no", "cancelar", "cancel", "declinar", "decline"}
    assignment_id_match = _re.match(r'^([12])\s+(\d+)$', msg_lower)

    if msg_lower in accept_kw or msg_lower in reject_kw or assignment_id_match:
        from app.models import EventAssignment, Event as EventModel

        user_result = await db.execute(
            select(User).where(
                User.is_active == True,
                or_(
                    User.phone == phone_raw,
                    User.phone == phone_digits,
                    User.phone == f"+{phone_digits}",
                    User.phone.like(f"%{phone_digits[-10:]}"),
                )
            ).limit(1)
        )
        emp = user_result.scalar_one_or_none()
        if not emp:
            return twiml_response(
                "❌ Tu número no está registrado." if language == "es"
                else "❌ Your number is not registered."
            )

        if assignment_id_match:
            action = "accept" if assignment_id_match.group(1) == "1" else "reject"
            assignment_id = int(assignment_id_match.group(2))
            assignment_result = await db.execute(
                select(EventAssignment).where(
                    EventAssignment.id == assignment_id,
                    EventAssignment.user_id == emp.id,
                    EventAssignment.status == "invited",
                    EventAssignment.company_id == company_id,
                )
            )
        else:
            action = "accept" if msg_lower in accept_kw else "reject"
            assignment_result = await db.execute(
                select(EventAssignment).where(
                    EventAssignment.user_id == emp.id,
                    EventAssignment.status == "invited",
                    EventAssignment.company_id == company_id,
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
            from app.services.event_status import check_and_update_event_status
            await check_and_update_event_status(assignment.event_id, db)
            await db.commit()
            msg = (
                f"✅ ¡Perfecto {first_name}! Has *aceptado* la invitación para *{event_name}*.\n¡Hasta pronto! 🎉"
                if language == "es" else
                f"✅ Great {first_name}! You *accepted* the invitation for *{event_name}*. See you there! 🎉"
            )
        else:
            assignment.status = "rejected"
            await db.commit()
            msg = (
                f"❌ Has *rechazado* la invitación para *{event_name}*, {first_name}."
                if language == "es" else
                f"❌ You *declined* the invitation for *{event_name}*, {first_name}."
            )

        # Notificar admins de la empresa
        try:
            from app.services.email_service import send_invitation_response_email
            if event_obj:
                admin_result = await db.execute(
                    select(User)
                    .join(UserCompanyMembership, UserCompanyMembership.user_id == User.id)
                    .join(Profile, Profile.id == UserCompanyMembership.profile_id)
                    .where(
                        UserCompanyMembership.company_id == company_id,
                        UserCompanyMembership.is_active == True,
                        User.is_active == True,
                        Profile.code.in_(["admin", "super_admin"]),
                    )
                )
                admins = admin_result.scalars().all()
                job_role = await db.get(JobRole, assignment.job_role_id)
                role_name = job_role.name if job_role else f"Rol #{assignment.job_role_id}"
                event_date_str = str(event_obj.event_date) if event_obj else ""

                for admin in admins:
                    if admin.email:
                        await send_invitation_response_email(
                            admin_email=admin.email,
                            employee_name=emp.name,
                            event_name=event_name,
                            role_name=role_name,
                            event_date=event_date_str,
                            accepted=(action == "accept"),
                        )
                    if admin.phone and admin.id != emp.id:
                        wa_msg = (
                            f"✅ *{emp.name}* aceptó la invitación para *{event_name}* ({event_date_str}) como {role_name}."
                            if action == "accept" else
                            f"❌ *{emp.name}* rechazó la invitación para *{event_name}* ({event_date_str}) como {role_name}."
                        )
                        wa_send(admin.phone, wa_msg)
                    try:
                        from app.services.push_service import send_push_to_user
                        icon = "✅" if action == "accept" else "❌"
                        verb = "aceptó" if action == "accept" else "rechazó"
                        await send_push_to_user(
                            admin.id, f"{icon} {emp.name} {verb} la invitación",
                            f"Evento: {event_name}", "/events", db,
                        )
                    except Exception as pe:
                        print(f"[WhatsApp] Push error: {pe}")
        except Exception as e:
            print(f"[WhatsApp] Error notifying admin: {e}")

        return twiml_response(msg)

    # ── Help ─────────────────────────────────────────────────────────────────
    if msg_lower in {"help", "ayuda", "hola", "hi", "hello", "/start"}:
        return twiml_response(HELP_EN if language == "en" else HELP_ES)

    # ── CLOCK IN / CLOCK OUT ─────────────────────────────────────────────────
    clock_in_kw = {"inicio", "iniciar", "start", "clock in", "clockin", "entrada"}
    clock_out_kw = {"finalizar", "finish", "terminar", "clock out", "clockout", "fin", "salida", "end"}

    if msg_lower in clock_in_kw or msg_lower in clock_out_kw:
        from app.models import EventAssignment, Shift, Event as EventModel
        from app.models import EventJobRole as EJR, JobRole as JR
        from decimal import Decimal
        from datetime import datetime as dt_class, timedelta

        emp_result = await db.execute(
            select(User).where(
                User.is_active == True,
                or_(
                    User.phone == phone_raw,
                    User.phone == phone_digits,
                    User.phone == f"+{phone_digits}",
                )
            ).limit(1)
        )
        emp = emp_result.scalar_one_or_none()
        if not emp:
            return twiml_response(
                "❌ Tu número no está registrado." if language == "es"
                else "❌ Your number is not registered."
            )

        first_name = emp.name.split()[0].capitalize() if emp.name else ""
        now = dt_class.utcnow()
        display_time = (now - timedelta(hours=4)).strftime("%I:%M %p")

        if msg_lower in clock_in_kw:
            from datetime import date as date_type
            today = (now - timedelta(hours=4)).date()
            assignments_result = await db.execute(
                select(EventAssignment, EventModel)
                .join(EventModel, EventAssignment.event_id == EventModel.id)
                .where(
                    EventAssignment.user_id == emp.id,
                    EventAssignment.status == "approved",
                    EventAssignment.company_id == company_id,
                    EventModel.event_date == today,
                )
            )
            assignments = assignments_result.all()

            target_assignment = None
            for assignment, event_obj in assignments:
                shift_check = await db.execute(
                    select(Shift).where(Shift.assignment_id == assignment.id)
                )
                if not shift_check.scalar_one_or_none():
                    target_assignment = assignment
                    break

            if not target_assignment:
                return twiml_response(
                    f"⚠️ {first_name}, no tienes turnos pendientes hoy." if language == "es"
                    else f"⚠️ {first_name}, you have no shifts to start today."
                )

            role = await db.get(JR, target_assignment.job_role_id)
            hourly_rate = role.hourly_rate if role else Decimal("0")
            if target_assignment.event_job_role_id:
                ejr = await db.get(EJR, target_assignment.event_job_role_id)
                if ejr and ejr.hourly_rate_override:
                    hourly_rate = ejr.hourly_rate_override

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

        else:  # clock out
            from app.models import WeeklyHoursConfig
            active_shift_result = await db.execute(
                select(Shift, EventAssignment)
                .join(EventAssignment, Shift.assignment_id == EventAssignment.id)
                .where(
                    EventAssignment.user_id == emp.id,
                    EventAssignment.company_id == company_id,
                    Shift.clock_in.isnot(None),
                    Shift.clock_out.is_(None),
                )
                .order_by(Shift.clock_in.desc())
                .limit(1)
            )
            row = active_shift_result.first()
            if not row:
                return twiml_response(
                    f"⚠️ {first_name}, no tienes un turno activo." if language == "es"
                    else f"⚠️ {first_name}, you don't have an active shift."
                )

            shift, assignment = row
            config_r = await db.execute(
                select(WeeklyHoursConfig).where(WeeklyHoursConfig.company_id == company_id)
            )
            config_obj = config_r.scalar_one_or_none()
            min_shift = float(config_obj.min_shift_hours) if config_obj else 0.0

            clock_in_naive = (
                shift.clock_in.replace(tzinfo=None) if shift.clock_in and shift.clock_in.tzinfo
                else shift.clock_in
            )
            gross_seconds = (now - clock_in_naive).total_seconds()
            hours_worked = Decimal(str(round(max(gross_seconds / 3600, 0), 2)))
            pause_hours = Decimal(str(round(float(shift.total_pause_minutes or 0) / 60, 4)))
            net_hours = max(Decimal("0"), hours_worked - pause_hours)

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

            min_msg = (
                f"\n📋 Mínimo aplicado: {min_shift}h"
                if float(net_hours) == min_shift and min_shift > 0
                and float(hours_worked - pause_hours) < min_shift else ""
            )
            return twiml_response(
                f"✅ *Turno finalizado*, {first_name}!\n🕐 Hora: {display_time}\n⏱ Horas: {net_hours:.2f}h\n💰 Pago: ${total_pay}{min_msg}\n\n¡Gracias!"
                if language == "es" else
                f"✅ *Shift ended*, {first_name}!\n🕐 Time: {display_time}\n⏱ Hours: {net_hours:.2f}h\n💰 Pay: ${total_pay}{min_msg}\n\nThank you!"
            )

    # ── Crear evento (admin) ──────────────────────────────────────────────────
    user_result = await db.execute(
        select(User).where(
            User.is_active == True,
            or_(
                User.phone == phone_raw,
                User.phone == phone_digits,
                User.phone == f"+{phone_digits}",
                User.phone.like(
                    f"%{phone_digits[-10:]}"
                ) if len(phone_digits) >= 10 else User.phone == phone_digits,
            )
        ).limit(1)
    )
    user = user_result.scalar_one_or_none()

    if not user:
        return twiml_response(
            "❌ Tu número no está registrado. Contacta a tu administrador."
            if language == "es" else
            "❌ Your number is not registered. Please contact your administrator."
        )

    # Verificar que el usuario es admin de ESTA empresa
    admin_membership = await db.execute(
        select(UserCompanyMembership, Profile)
        .join(Profile, Profile.id == UserCompanyMembership.profile_id)
        .where(
            UserCompanyMembership.user_id == user.id,
            UserCompanyMembership.company_id == company_id,
            UserCompanyMembership.is_active == True,
            Profile.code.in_(["admin", "super_admin"]),
        )
        .limit(1)
    )
    if not admin_membership.first():
        return twiml_response(
            "❌ No tienes permisos de administrador en esta empresa."
            if language == "es" else
            "❌ You don't have admin permissions in this company."
        )

    event_data = await extract_event_from_message(message, language)

    if not event_data or not event_data.get("name") or not event_data.get("event_date") or not event_data.get("start_time"):
        return twiml_response(
            "❌ No pude entender el evento. Intenta:\n_\"Crear evento: Nombre, fecha, hora, dirección, dress code, personal\"_"
            if language == "es" else
            "❌ I couldn't understand the event. Try:\n_\"Create event: Name, date, time, address, dress code, staff\"_"
        )

    roles_data = event_data.get("roles") or []
    event_job_roles = []

    for role_info in roles_data:
        role_name = role_info.get("name", "").strip().upper()
        slots = int(role_info.get("slots", 1))
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
            return twiml_response(
                "❌ No hay roles laborales en tu empresa. Créalos en la app primero."
                if language == "es" else
                "❌ No job roles found. Please create roles in the app first."
            )

    address = event_data.get("address", "")
    city = event_data.get("city") or ""
    state = event_data.get("state") or ""
    zip_code = event_data.get("zip_code") or ""

    from app.services.geocoding import geocode_address
    lat, lng = await geocode_address(address, city, state, zip_code)

    from datetime import datetime
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
        return twiml_response(
            f"❌ Formato de fecha/hora inválido: {e}" if language == "es"
            else f"❌ Invalid date/time format: {e}"
        )

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

    confirmation = format_event_confirmation(event_data, event.id, language)
    return twiml_response(confirmation)


@router.get("/webhook")
async def whatsapp_verify(request: Request):
    return PlainTextResponse("Kalirio WhatsApp Bot is running ✅")

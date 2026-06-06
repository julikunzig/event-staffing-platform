# Integración de Emails en Endpoints - Ejemplos de Código

## 1. Publicar Evento (Sin Invitaciones Específicas)

**Archivo:** `backend/app/routers/events.py`

**Endpoint:** `POST /events/{id}/publish`

```python
from app.services.email_service import send_event_published_email
from sqlalchemy import select

@router.post("/events/{id}/publish", response_model=EventOut)
async def publish_event(
    id: int,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    """Publish an event and notify employees with required roles"""
    company_id = current_user["company_id"]
    event = await db.get(Event, id)
    
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event.status != "created":
        raise HTTPException(status_code=400, detail="Event must be in created state")
    
    # Get event job roles
    result = await db.execute(
        select(EventJobRole).where(EventJobRole.event_id == id)
    )
    event_roles = result.scalars().all()
    
    # Get all employees with required roles
    job_role_ids = [er.job_role_id for er in event_roles]
    result = await db.execute(
        select(User).join(
            UserCompanyMembership,
            User.id == UserCompanyMembership.user_id
        ).where(
            UserCompanyMembership.company_id == company_id,
            User.id.in_(
                select(UserJobRole.user_id).where(
                    UserJobRole.job_role_id.in_(job_role_ids)
                )
            )
        ).distinct()
    )
    employees = result.scalars().all()
    
    # Update event status
    event.status = "published"
    await db.flush()
    
    # Send emails to employees with required roles
    if employees:
        roles_info = [
            {
                "name": (await db.get(JobRole, er.job_role_id)).name,
                "rate": str((await db.get(JobRole, er.job_role_id)).hourly_rate)
            }
            for er in event_roles
        ]
        
        await send_event_published_email(
            employee_emails=[emp.email for emp in employees],
            event_name=event.name,
            event_date=event.event_date.strftime("%Y-%m-%d"),
            start_time=str(event.start_time),
            address=event.address,
            city=event.city or "",
            state=event.state or "",
            zip_code=event.zip_code or "",
            roles=roles_info,
            dress_code=event.dress_code,
        )
    
    await db.commit()
    await db.refresh(event)
    return event
```

## 2. Invitar Empleados Específicos

**Archivo:** `backend/app/routers/assignments.py`

**Endpoint:** `POST /assignments/events/{event_id}/bulk-invite`

```python
from app.services.email_service import send_event_invitation_email

@router.post("/assignments/events/{event_id}/bulk-invite")
async def bulk_invite_employees(
    event_id: int,
    body: BulkInviteRequest,
    current_user: AdminDep,
    db: AsyncSession = Depends(get_db),
):
    """Invite multiple employees to an event"""
    company_id = current_user["company_id"]
    event = await db.get(Event, event_id)
    
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Event not found")
    
    created_count = 0
    
    for invitation in body.invitations:
        user = await db.get(User, invitation.user_id)
        role = await db.get(JobRole, invitation.job_role_id)
        
        if not user or not role:
            continue
        
        # Create assignment
        assignment = EventAssignment(
            event_id=event_id,
            user_id=invitation.user_id,
            company_id=company_id,
            job_role_id=invitation.job_role_id,
            status="invited",
            assigned_by=current_user["user_id"],
        )
        db.add(assignment)
        created_count += 1
        
        # Send invitation email
        await send_event_invitation_email(
            employee_emails=[user.email],
            event_name=event.name,
            event_date=event.event_date.strftime("%Y-%m-%d"),
            start_time=str(event.start_time),
            address=event.address,
            city=event.city or "",
            state=event.state or "",
            zip_code=event.zip_code or "",
            role_name=role.name,
            hourly_rate=str(role.hourly_rate),
            dress_code=event.dress_code,
        )
    
    await db.commit()
    return {"count": created_count}
```

## 3. Empleado Aplica a Evento

**Archivo:** `backend/app/routers/assignments.py`

**Endpoint:** `POST /assignments/events/{event_id}/apply`

```python
from app.services.email_service import send_application_notification_email

@router.post("/assignments/events/{event_id}/apply", response_model=AssignmentOut)
async def apply_to_event(
    event_id: int,
    body: ApplyRequest,
    current_user: AuthDep,
    db: AsyncSession = Depends(get_db),
):
    """Employee applies to an event"""
    user_id = int(current_user["sub"])
    company_id = current_user["company_id"]
    
    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # ... validaciones ...
    
    # Create assignment
    assignment = EventAssignment(
        event_id=event_id,
        user_id=user_id,
        company_id=company_id,
        job_role_id=body.job_role_id,
        status="pending",
    )
    db.add(assignment)
    await db.flush()
    
    # Get event creator (admin)
    event_creator = await db.get(User, event.created_by)
    current_user_obj = await db.get(User, user_id)
    role = await db.get(JobRole, body.job_role_id)
    
    # Send notification to admin
    if event_creator:
        await send_application_notification_email(
            admin_email=event_creator.email,
            employee_name=current_user_obj.name,
            event_name=event.name,
            role_name=role.name,
            event_date=event.event_date.strftime("%Y-%m-%d"),
        )
    
    await db.commit()
    await db.refresh(assignment)
    return assignment
```

## 4. Empleado Acepta/Rechaza Invitación

**Archivo:** `backend/app/routers/assignments.py`

**Endpoints:** `PATCH /assignments/{assignment_id}/accept` y `/reject`

```python
from app.services.email_service import send_invitation_response_email

@router.patch("/assignments/{assignment_id}/accept", response_model=AssignmentOut)
async def accept_invitation(
    assignment_id: int,
    current_user: AuthDep,
    db: AsyncSession = Depends(get_db),
):
    """Employee accepts an invitation"""
    user_id = int(current_user["sub"])
    company_id = current_user["company_id"]
    
    assignment = await db.get(EventAssignment, assignment_id)
    if not assignment or assignment.company_id != company_id:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    if assignment.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if assignment.status != "invited":
        raise HTTPException(status_code=400, detail="Assignment is not invited")
    
    # Update status
    assignment.status = "approved"
    await db.flush()
    
    # Get event creator (admin)
    event = await db.get(Event, assignment.event_id)
    event_creator = await db.get(User, event.created_by)
    current_user_obj = await db.get(User, user_id)
    role = await db.get(JobRole, assignment.job_role_id)
    
    # Send notification to admin
    if event_creator:
        await send_invitation_response_email(
            admin_email=event_creator.email,
            employee_name=current_user_obj.name,
            event_name=event.name,
            role_name=role.name,
            event_date=event.event_date.strftime("%Y-%m-%d"),
            accepted=True,
        )
    
    await db.commit()
    await db.refresh(assignment)
    return assignment


@router.patch("/assignments/{assignment_id}/reject", response_model=AssignmentOut)
async def reject_invitation(
    assignment_id: int,
    current_user: AuthDep,
    db: AsyncSession = Depends(get_db),
):
    """Employee rejects an invitation"""
    user_id = int(current_user["sub"])
    company_id = current_user["company_id"]
    
    assignment = await db.get(EventAssignment, assignment_id)
    if not assignment or assignment.company_id != company_id:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    if assignment.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if assignment.status != "invited":
        raise HTTPException(status_code=400, detail="Assignment is not invited")
    
    # Update status
    assignment.status = "rejected"
    await db.flush()
    
    # Get event creator (admin)
    event = await db.get(Event, assignment.event_id)
    event_creator = await db.get(User, event.created_by)
    current_user_obj = await db.get(User, user_id)
    role = await db.get(JobRole, assignment.job_role_id)
    
    # Send notification to admin
    if event_creator:
        await send_invitation_response_email(
            admin_email=event_creator.email,
            employee_name=current_user_obj.name,
            event_name=event.name,
            role_name=role.name,
            event_date=event.event_date.strftime("%Y-%m-%d"),
            accepted=False,
        )
    
    await db.commit()
    await db.refresh(assignment)
    return assignment
```

## 5. Admin Aprueba Aplicación

**Archivo:** `backend/app/routers/assignments.py`

**Endpoint:** `PATCH /assignments/{assignment_id}/approve`

```python
from app.services.email_service import send_application_approved_email

@router.patch("/assignments/{assignment_id}/approve", response_model=AssignmentOut)
async def approve_assignment(
    assignment_id: int,
    current_user: AdminCoordDep,
    db: AsyncSession = Depends(get_db),
):
    """Admin approves an employee application"""
    company_id = current_user["company_id"]
    
    assignment = await db.get(EventAssignment, assignment_id)
    if not assignment or assignment.company_id != company_id:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    if assignment.status != "pending":
        raise HTTPException(status_code=400, detail="Assignment is not pending")
    
    # ... validaciones ...
    
    # Update status
    assignment.status = "approved"
    await db.flush()
    
    # Get employee, event, and role
    employee = await db.get(User, assignment.user_id)
    event = await db.get(Event, assignment.event_id)
    role = await db.get(JobRole, assignment.job_role_id)
    
    # Send confirmation email to employee
    if employee:
        await send_application_approved_email(
            employee_email=employee.email,
            event_name=event.name,
            event_date=event.event_date.strftime("%Y-%m-%d"),
            start_time=str(event.start_time),
            address=event.address,
            city=event.city or "",
            state=event.state or "",
            zip_code=event.zip_code or "",
            role_name=role.name,
            hourly_rate=str(role.hourly_rate),
            dress_code=event.dress_code,
        )
    
    await db.commit()
    await db.refresh(assignment)
    return assignment
```

## 6. Recuperación de Contraseña

**Archivo:** `backend/app/routers/auth.py`

**Endpoint:** `POST /auth/forgot-password`

```python
from app.services.email_service import send_password_reset_email
import secrets
from datetime import datetime, timedelta

@router.post("/auth/forgot-password")
async def forgot_password(
    body: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Send password reset email"""
    result = await db.execute(
        select(User).where(User.email == body.email)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        # Don't reveal if email exists
        return {"message": "If email exists, reset link has been sent"}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=2)
    
    # Store token in database
    password_reset = PasswordResetToken(
        user_id=user.id,
        token=reset_token,
        expires_at=expires_at,
    )
    db.add(password_reset)
    await db.flush()
    
    # Create reset link
    reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"
    
    # Send email
    await send_password_reset_email(
        user_email=user.email,
        reset_link=reset_link,
    )
    
    await db.commit()
    return {"message": "Reset link has been sent to your email"}
```

## Notas de Implementación

1. **Importaciones:** Asegúrate de importar las funciones de email al inicio del archivo
2. **Async/Await:** Las funciones de email son asincrónicas, úsalas con `await`
3. **Manejo de Errores:** Los errores de email se registran pero no detienen la operación
4. **Configuración:** Asegúrate de que `RESEND_API_KEY` esté configurada en `.env`
5. **Testing:** Usa direcciones de email de prueba de Resend para testing

## Próximos Pasos

1. Copiar el código de integración en los endpoints correspondientes
2. Probar cada flujo de email
3. Verificar que los emails se envíen correctamente
4. Monitorear en el dashboard de Resend

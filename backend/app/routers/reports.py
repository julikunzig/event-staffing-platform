import csv
import io
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from decimal import Decimal
from typing import Annotated
from datetime import date, datetime, time
from app.core.database import get_db
from app.core.auth import require_role, get_current_user
from app.models import Event, EventAssignment, Shift, JobRole, User

router = APIRouter(prefix="/reports", tags=["reports"])
AdminCoordDep = Annotated[dict, Depends(require_role("super_admin", "admin", "coordinator"))]
AuthDep = Annotated[dict, Depends(get_current_user)]


class EmployeeShiftRow(BaseModel):
    user_id: int
    user_name: str
    job_role: str
    clock_in: datetime | None
    clock_out: datetime | None
    hours_worked: Decimal | None
    hourly_rate: Decimal
    regular_pay: Decimal | None
    overtime_pay: Decimal
    total_pay: Decimal | None


class EventReportOut(BaseModel):
    event_id: int
    event_name: str
    event_date: date
    employees: list[EmployeeShiftRow]
    total_hours: Decimal
    total_pay: Decimal


class EmployeeEventRow(BaseModel):
    event_id: int
    event_name: str
    event_date: date
    event_start_time: time | None
    event_end_time: time | None
    job_role: str
    hours_worked: Decimal | None
    hourly_rate: Decimal
    regular_pay: Decimal | None
    overtime_pay: Decimal
    total_pay: Decimal | None


class EmployeeReportOut(BaseModel):
    user_id: int
    user_name: str
    events: list[EmployeeEventRow]
    total_hours: Decimal
    total_pay: Decimal


@router.get("/events", response_model=list[EventReportOut])
async def report_by_event(
    current_user: AdminCoordDep,
    event_date: date = Query(..., alias="event_date"),
    event_name: str | None = Query(None, alias="event_name"),
    format: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """
    Reporte 1: Por Evento
    - Filtros: Fecha evento (obligatorio), Nombre evento (opcional)
    - Resultados: Agregar fecha y dirección del evento al encabezado
    - Si múltiples eventos: Mostrar encabezado y listado por cada evento (rompimiento)
    - Ordenamiento: Por fecha descendente (más reciente primero)
    """
    company_id = current_user["company_id"]

    # Construir query base
    query = (
        select(Event)
        .where(
            Event.company_id == company_id,
            Event.event_date == event_date,
        )
    )

    # Aplicar filtro opcional de nombre
    if event_name:
        query = query.where(Event.name.ilike(f"%{event_name}%"))

    # Ordenar por nombre de evento (A-Z)
    query = query.order_by(Event.name.asc())

    result = await db.execute(query)
    events = result.scalars().all()

    if not events:
        return []

    # Procesar cada evento
    reports = []
    for event in events:
        # Obtener asignaciones aprobadas para este evento
        assignments_result = await db.execute(
            select(EventAssignment, Shift, JobRole, User)
            .join(Shift, Shift.assignment_id == EventAssignment.id, isouter=True)
            .join(JobRole, JobRole.id == EventAssignment.job_role_id)
            .join(User, User.id == EventAssignment.user_id)
            .where(EventAssignment.event_id == event.id, EventAssignment.status == "approved")
        )
        rows = assignments_result.all()

        employees = []
        total_hours = Decimal("0")
        total_pay = Decimal("0")

        for assignment, shift, role, user in rows:
            hw = shift.hours_worked if shift else None
            tp = shift.total_pay if shift else None
            rp = shift.regular_pay if shift else None
            op = shift.overtime_pay if shift else Decimal("0")
            rate = shift.hourly_rate_snapshot if shift else role.hourly_rate

            employees.append(EmployeeShiftRow(
                user_id=user.id, user_name=user.name, job_role=role.name,
                clock_in=shift.clock_in if shift else None,
                clock_out=shift.clock_out if shift else None,
                hours_worked=hw, hourly_rate=rate,
                regular_pay=rp, overtime_pay=op, total_pay=tp,
            ))
            total_hours += hw or Decimal("0")
            total_pay += tp or Decimal("0")

        reports.append(EventReportOut(
            event_id=event.id, event_name=event.name, event_date=event.event_date,
            employees=employees, total_hours=total_hours, total_pay=total_pay,
        ))

    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        
        for report in reports:
            writer.writerow([f"Evento: {report.event_name}"])
            writer.writerow([f"Fecha: {report.event_date}"])
            writer.writerow([])
            writer.writerow(["Empleado", "Rol", "Entrada", "Salida", "Horas", "Tarifa/h", "Pago Regular", "Overtime", "Total"])
            for e in report.employees:
                writer.writerow([e.user_name, e.job_role, e.clock_in, e.clock_out,
                                 e.hours_worked, e.hourly_rate, e.regular_pay, e.overtime_pay, e.total_pay])
            writer.writerow(["", "", "", "TOTAL", report.total_hours, "", "", "", report.total_pay])
            writer.writerow([])
        
        output.seek(0)
        return StreamingResponse(output, media_type="text/csv",
                                 headers={"Content-Disposition": f"attachment; filename=events_report.csv"})
    
    return reports


@router.get("/events/{event_id}", response_model=EventReportOut)
async def report_by_event_id(
    event_id: int,
    current_user: AdminCoordDep,
    format: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Endpoint legacy para compatibilidad"""
    company_id = current_user["company_id"]
    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    result = await db.execute(
        select(EventAssignment, Shift, JobRole, User)
        .join(Shift, Shift.assignment_id == EventAssignment.id, isouter=True)
        .join(JobRole, JobRole.id == EventAssignment.job_role_id)
        .join(User, User.id == EventAssignment.user_id)
        .where(EventAssignment.event_id == event_id, EventAssignment.status == "approved")
    )
    rows = result.all()

    employees = []
    total_hours = Decimal("0")
    total_pay = Decimal("0")

    for assignment, shift, role, user in rows:
        hw = shift.hours_worked if shift else None
        tp = shift.total_pay if shift else None
        rp = shift.regular_pay if shift else None
        op = shift.overtime_pay if shift else Decimal("0")
        rate = shift.hourly_rate_snapshot if shift else role.hourly_rate

        employees.append(EmployeeShiftRow(
            user_id=user.id, user_name=user.name, job_role=role.name,
            clock_in=shift.clock_in if shift else None,
            clock_out=shift.clock_out if shift else None,
            hours_worked=hw, hourly_rate=rate,
            regular_pay=rp, overtime_pay=op, total_pay=tp,
        ))
        total_hours += hw or Decimal("0")
        total_pay += tp or Decimal("0")

    report = EventReportOut(
        event_id=event.id, event_name=event.name, event_date=event.event_date,
        employees=employees, total_hours=total_hours, total_pay=total_pay,
    )

    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Empleado", "Rol", "Entrada", "Salida", "Horas", "Tarifa/h", "Pago Regular", "Overtime", "Total"])
        for e in employees:
            writer.writerow([e.user_name, e.job_role, e.clock_in, e.clock_out,
                             e.hours_worked, e.hourly_rate, e.regular_pay, e.overtime_pay, e.total_pay])
        writer.writerow(["", "", "", "TOTAL", total_hours, "", "", "", total_pay])
        output.seek(0)
        return StreamingResponse(output, media_type="text/csv",
                                 headers={"Content-Disposition": f"attachment; filename=event_{event_id}_report.csv"})
    return report


@router.get("/employees", response_model=EmployeeReportOut)
async def report_by_employee(
    current_user: AdminCoordDep,
    employee_search: str = Query(..., alias="employee_search"),
    from_date: date = Query(..., alias="from"),
    to_date: date = Query(..., alias="to"),
    format: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """
    Reporte 2: Por Empleado
    - Filtros: Empleado (nombre/email/teléfono) (obligatorio), desde (obligatorio), hasta (obligatorio)
    - Resultados: Sin cambios
    - Ordenamiento: Por fecha descendente (más reciente primero)
    """
    company_id = current_user["company_id"]

    # Buscar empleado por nombre, email o teléfono
    user_result = await db.execute(
        select(User)
        .where(
            (User.name.ilike(f"%{employee_search}%")) |
            (User.email.ilike(f"%{employee_search}%")) |
            (User.phone.ilike(f"%{employee_search}%"))
        )
    )
    user = user_result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    result = await db.execute(
        select(EventAssignment, Shift, JobRole, Event)
        .join(Shift, Shift.assignment_id == EventAssignment.id, isouter=True)
        .join(JobRole, JobRole.id == EventAssignment.job_role_id)
        .join(Event, Event.id == EventAssignment.event_id)
        .where(
            EventAssignment.user_id == user.id,
            EventAssignment.company_id == company_id,
            EventAssignment.status == "approved",
            Event.event_date >= from_date,
            Event.event_date <= to_date,
        )
        .order_by(Event.event_date.desc())
    )
    rows = result.all()

    events_list = []
    total_hours = Decimal("0")
    total_pay = Decimal("0")

    for assignment, shift, role, event in rows:
        hw = shift.hours_worked if shift else None
        tp = shift.total_pay if shift else None
        rp = shift.regular_pay if shift else None
        op = shift.overtime_pay if shift else Decimal("0")
        rate = shift.hourly_rate_snapshot if shift else role.hourly_rate

        events_list.append(EmployeeEventRow(
            event_id=event.id, event_name=event.name, event_date=event.event_date,
            event_start_time=event.start_time, event_end_time=event.end_time,
            job_role=role.name, hours_worked=hw, hourly_rate=rate,
            regular_pay=rp, overtime_pay=op, total_pay=tp,
        ))
        total_hours += hw or Decimal("0")
        total_pay += tp or Decimal("0")

    report = EmployeeReportOut(
        user_id=user.id, user_name=user.name,
        events=events_list, total_hours=total_hours, total_pay=total_pay,
    )

    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Evento", "Fecha", "Hora Inicio", "Hora Fin", "Rol", "Horas", "Tarifa/h", "Pago Regular", "Overtime", "Total"])
        for e in events_list:
            writer.writerow([e.event_name, e.event_date, e.event_start_time or "", e.event_end_time or "", e.job_role,
                             e.hours_worked, e.hourly_rate, e.regular_pay, e.overtime_pay, e.total_pay])
        writer.writerow(["TOTAL", "", "", "", "", total_hours, "", "", "", total_pay])
        output.seek(0)
        return StreamingResponse(output, media_type="text/csv",
                                 headers={"Content-Disposition": f"attachment; filename=employee_report.csv"})
    
    return report


@router.get("/employees/{user_id}", response_model=EmployeeReportOut)
async def report_by_employee_id(
    user_id: int,
    current_user: AdminCoordDep,
    from_date: date = Query(..., alias="from"),
    to_date: date = Query(..., alias="to"),
    format: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Endpoint legacy para compatibilidad"""
    company_id = current_user["company_id"]
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    result = await db.execute(
        select(EventAssignment, Shift, JobRole, Event)
        .join(Shift, Shift.assignment_id == EventAssignment.id, isouter=True)
        .join(JobRole, JobRole.id == EventAssignment.job_role_id)
        .join(Event, Event.id == EventAssignment.event_id)
        .where(
            EventAssignment.user_id == user_id,
            EventAssignment.company_id == company_id,
            EventAssignment.status == "approved",
            Event.event_date >= from_date,
            Event.event_date <= to_date,
        )
    )
    rows = result.all()

    events_list = []
    total_hours = Decimal("0")
    total_pay = Decimal("0")

    for assignment, shift, role, event in rows:
        hw = shift.hours_worked if shift else None
        tp = shift.total_pay if shift else None
        rp = shift.regular_pay if shift else None
        op = shift.overtime_pay if shift else Decimal("0")
        rate = shift.hourly_rate_snapshot if shift else role.hourly_rate

        events_list.append(EmployeeEventRow(
            event_id=event.id, event_name=event.name, event_date=event.event_date,
            event_start_time=event.start_time, event_end_time=event.end_time,
            job_role=role.name, hours_worked=hw, hourly_rate=rate,
            regular_pay=rp, overtime_pay=op, total_pay=tp,
        ))
        total_hours += hw or Decimal("0")
        total_pay += tp or Decimal("0")

    report = EmployeeReportOut(
        user_id=user.id, user_name=user.name,
        events=events_list, total_hours=total_hours, total_pay=total_pay,
    )

    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Evento", "Fecha", "Hora Inicio", "Hora Fin", "Rol", "Horas", "Tarifa/h", "Pago Regular", "Overtime", "Total"])
        for e in events_list:
            writer.writerow([e.event_name, e.event_date, e.event_start_time or "", e.event_end_time or "", e.job_role,
                             e.hours_worked, e.hourly_rate, e.regular_pay, e.overtime_pay, e.total_pay])
        writer.writerow(["TOTAL", "", "", "", "", total_hours, "", "", "", total_pay])
        output.seek(0)
        return StreamingResponse(output, media_type="text/csv",
                                 headers={"Content-Disposition": f"attachment; filename=employee_{user_id}_report.csv"})
    return report


@router.get("/me", response_model=EmployeeReportOut)
async def my_report(
    current_user: AuthDep,
    from_date: date = Query(..., alias="from"),
    to_date: date = Query(..., alias="to"),
    format: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    user_id = int(current_user["sub"])
    company_id = current_user["company_id"]
    user = await db.get(User, user_id)

    result = await db.execute(
        select(EventAssignment, Shift, JobRole, Event)
        .join(Shift, Shift.assignment_id == EventAssignment.id, isouter=True)
        .join(JobRole, JobRole.id == EventAssignment.job_role_id)
        .join(Event, Event.id == EventAssignment.event_id)
        .where(
            EventAssignment.user_id == user_id,
            EventAssignment.company_id == company_id,
            EventAssignment.status == "approved",
            Event.event_date >= from_date,
            Event.event_date <= to_date,
        )
    )
    rows = result.all()

    events_list = []
    total_hours = Decimal("0")
    total_pay = Decimal("0")

    for assignment, shift, role, event in rows:
        hw = shift.hours_worked if shift else None
        tp = shift.total_pay if shift else None
        rate = shift.hourly_rate_snapshot if shift else role.hourly_rate
        op = shift.overtime_pay if shift else Decimal("0")

        events_list.append(EmployeeEventRow(
            event_id=event.id, event_name=event.name, event_date=event.event_date,
            event_start_time=event.start_time, event_end_time=event.end_time,
            job_role=role.name, hours_worked=hw, hourly_rate=rate,
            regular_pay=shift.regular_pay if shift else None, overtime_pay=op, total_pay=tp,
        ))
        total_hours += hw or Decimal("0")
        total_pay += tp or Decimal("0")

    report = EmployeeReportOut(
        user_id=user.id, user_name=user.name,
        events=events_list, total_hours=total_hours, total_pay=total_pay,
    )

    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Evento", "Fecha", "Hora Inicio", "Hora Fin", "Rol", "Horas", "Tarifa/h", "Pago Regular", "Overtime", "Total"])
        for e in events_list:
            writer.writerow([e.event_name, e.event_date, e.event_start_time or "", e.event_end_time or "", e.job_role,
                             e.hours_worked, e.hourly_rate, e.regular_pay, e.overtime_pay, e.total_pay])
        writer.writerow(["TOTAL", "", "", "", "", total_hours, "", "", "", total_pay])
        output.seek(0)
        return StreamingResponse(output, media_type="text/csv",
                                 headers={"Content-Disposition": f"attachment; filename=my_report.csv"})

    return report


# ─────────────────────────────────────────────────────────────────────────────
# REPORTE 4: Listado de empleados por evento (ordenado por fecha de evento)
# ─────────────────────────────────────────────────────────────────────────────

class EmployeesByEventRow(BaseModel):
    event_date: date
    event_start_time: time | None
    event_end_time: time | None
    event_name: str
    employee_name: str
    phone: str | None
    job_role: str
    hours_worked: Decimal | None
    hourly_rate: Decimal
    total_pay: Decimal | None


@router.get("/employees-by-event", response_model=list[EmployeesByEventRow])
async def employees_by_event(
    current_user: AdminCoordDep,
    from_date: date = Query(..., alias="from_date"),
    to_date: date = Query(..., alias="to_date"),
    format: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """
    Reporte 4: Eventos por Fechas (anteriormente "Empleados por Evento")
    - Filtros: desde (obligatorio), hasta (obligatorio)
    - Resultados: Agregar total horas y total pago al encabezado
    - Ordenamiento: Por fecha evento DESC, luego por nombre evento A-Z
    """
    company_id = current_user["company_id"]

    # Construir query base
    query = (
        select(Event, EventAssignment, Shift, JobRole, User)
        .join(EventAssignment, EventAssignment.event_id == Event.id)
        .join(Shift, Shift.assignment_id == EventAssignment.id, isouter=True)
        .join(JobRole, JobRole.id == EventAssignment.job_role_id)
        .join(User, User.id == EventAssignment.user_id)
        .where(
            Event.company_id == company_id,
            EventAssignment.status == "approved",
            Event.event_date >= from_date,
            Event.event_date <= to_date,
        )
        .order_by(Event.event_date.desc(), Event.name.asc())
    )

    result = await db.execute(query)
    rows = result.all()

    employees_list = []
    for event, assignment, shift, role, user in rows:
        hw = (shift.hours_worked if shift and shift.hours_worked is not None else None)
        tp = (shift.total_pay if shift and shift.total_pay is not None else None)
        rate = shift.hourly_rate_snapshot if shift else role.hourly_rate

        employees_list.append(EmployeesByEventRow(
            event_date=event.event_date,
            event_start_time=event.start_time,
            event_end_time=event.end_time,
            event_name=event.name,
            employee_name=user.name,
            phone=user.phone,
            job_role=role.name,
            hours_worked=hw,
            hourly_rate=rate,
            total_pay=tp,
        ))

    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Fecha Evento", "Hora Inicio", "Hora Fin", "Evento", "Empleado", "Teléfono", "Rol", "Horas Trabajadas", "Valor/Hora", "Valor Total a Pagar"])
        for row in employees_list:
            writer.writerow([
                row.event_date,
                row.event_start_time or "",
                row.event_end_time or "",
                row.event_name,
                row.employee_name,
                row.phone or "",
                row.job_role,
                row.hours_worked if row.hours_worked is not None else "Pendiente",
                row.hourly_rate,
                row.total_pay if row.total_pay is not None else "Pendiente",
            ])
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=events_by_dates_report.csv"}
        )
    
    return employees_list


# ─────────────────────────────────────────────────────────────────────────────
# REPORTE 5: Consolidado de pagos por empleado
# ─────────────────────────────────────────────────────────────────────────────

class ConsolidatedPaymentRow(BaseModel):
    employee_name: str
    total_hours: Decimal
    total_pay: Decimal


@router.get("/consolidated-payments", response_model=list[ConsolidatedPaymentRow])
@router.get("/payment-consolidation", response_model=list[ConsolidatedPaymentRow])
async def consolidated_payments(
    current_user: AdminCoordDep,
    from_date: date = Query(..., alias="from_date"),
    to_date: date = Query(..., alias="to_date"),
    format: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """
    Reporte 5: Consolidado de Pagos
    - Filtros: desde (obligatorio), hasta (obligatorio)
    - Resultados: Agregar total horas y total pago
    - Ordenamiento: Alfabético por nombre de empleado
    """
    company_id = current_user["company_id"]

    # Obtener todos los empleados con sus asignaciones aprobadas en el rango de fechas
    result = await db.execute(
        select(User, EventAssignment, Shift)
        .join(EventAssignment, EventAssignment.user_id == User.id)
        .join(Shift, Shift.assignment_id == EventAssignment.id, isouter=True)
        .join(Event, Event.id == EventAssignment.event_id)
        .where(
            EventAssignment.company_id == company_id,
            EventAssignment.status == "approved",
            Event.event_date >= from_date,
            Event.event_date <= to_date,
        )
        .order_by(User.name.asc())
    )
    rows = result.all()

    # Agrupar por empleado
    employees_dict = {}
    for user, assignment, shift in rows:
        if user.id not in employees_dict:
            employees_dict[user.id] = {
                "name": user.name,
                "total_hours": Decimal("0"),
                "total_pay": Decimal("0"),
            }
        
        if shift:
            employees_dict[user.id]["total_hours"] += shift.hours_worked or Decimal("0")
            employees_dict[user.id]["total_pay"] += shift.total_pay or Decimal("0")

    # Convertir a lista de modelos
    payments_list = [
        ConsolidatedPaymentRow(
            employee_name=emp["name"],
            total_hours=emp["total_hours"],
            total_pay=emp["total_pay"],
        )
        for emp in employees_dict.values()
    ]

    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Empleado", "Total Horas", "Total a Pagar"])
        for row in payments_list:
            writer.writerow([
                row.employee_name,
                row.total_hours,
                row.total_pay,
            ])
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=consolidated_payments_report.csv"}
        )
    
    return payments_list

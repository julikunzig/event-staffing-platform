import csv
import io
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from pydantic import BaseModel
from decimal import Decimal
from typing import Annotated, List, Optional
from datetime import date, datetime, time
from app.core.database import get_db
from app.core.auth import require_role, get_current_user
from app.models import Event, EventAssignment, Shift, JobRole, User, EmployeeProfile, EmployeeJobRole

router = APIRouter(prefix="/reports", tags=["reports"])
AdminCoordDep = Annotated[dict, Depends(require_role("super_admin", "admin", "coordinator"))]
AuthDep = Annotated[dict, Depends(get_current_user)]


# ─── Modelos de salida ────────────────────────────────────────────────────────

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

class EmployeesByEventRow(BaseModel):
    event_id: int
    user_id: int
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

class ConsolidatedPaymentRow(BaseModel):
    employee_name: str
    phone: str | None = None
    total_hours: Decimal
    total_pay: Decimal

# ─── Nuevo: Búsqueda de eventos para autocomplete ─────────────────────────────

class EventSearchResult(BaseModel):
    id: int
    name: str
    event_date: date
    status: str
    address: str | None

@router.get("/search/events", response_model=list[EventSearchResult])
async def search_events(
    current_user: AdminCoordDep,
    q: str = Query("", description="Buscar por nombre o ID"),
    from_date: date | None = Query(None),
    to_date: date | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    company_id = current_user["company_id"]
    query = select(Event).where(Event.company_id == company_id)
    if q:
        if q.isdigit():
            query = query.where(or_(Event.name.ilike(f"%{q}%"), Event.id == int(q)))
        else:
            query = query.where(Event.name.ilike(f"%{q}%"))
    if from_date:
        query = query.where(Event.event_date >= from_date)
    if to_date:
        query = query.where(Event.event_date <= to_date)
    query = query.order_by(Event.event_date.desc()).limit(30)
    result = await db.execute(query)
    events = result.scalars().all()
    return [EventSearchResult(id=e.id, name=e.name, event_date=e.event_date, status=e.status, address=e.address) for e in events]


# ─── Nuevo: Búsqueda de empleados para autocomplete ──────────────────────────

class EmployeeSearchResult(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None

@router.get("/search/employees", response_model=list[EmployeeSearchResult])
async def search_employees(
    current_user: AdminCoordDep,
    q: str = Query("", description="Buscar por nombre, email o teléfono"),
    db: AsyncSession = Depends(get_db),
):
    company_id = current_user["company_id"]
    query = (
        select(User)
        .join(EventAssignment, EventAssignment.user_id == User.id)
        .where(
            EventAssignment.company_id == company_id,
            or_(
                User.name.ilike(f"%{q}%"),
                User.email.ilike(f"%{q}%"),
                User.phone.ilike(f"%{q}%"),
            )
        )
        .distinct()
        .order_by(User.name.asc())
        .limit(20)
    )
    result = await db.execute(query)
    users = result.scalars().all()
    return [EmployeeSearchResult(id=u.id, name=u.name, email=u.email, phone=u.phone) for u in users]


# ─── Nuevo: Ficha de evento ───────────────────────────────────────────────────

class EventAssignmentDetail(BaseModel):
    user_id: int
    user_name: str
    user_email: str
    user_phone: str | None
    job_role: str
    status: str
    clock_in: datetime | None
    clock_out: datetime | None
    hours_worked: Decimal | None
    total_pay: Decimal | None

class EventDetailReport(BaseModel):
    id: int
    name: str
    event_date: date
    start_time: time | None
    end_time: time | None
    address: str | None
    city: str | None
    state: str | None
    dress_code: str | None
    status: str
    assignments: list[EventAssignmentDetail]
    total_staff: int
    total_hours: Decimal
    total_pay: Decimal

@router.get("/event-detail/{event_id}", response_model=EventDetailReport)
async def event_detail_report(
    event_id: int,
    current_user: AdminCoordDep,
    db: AsyncSession = Depends(get_db),
):
    company_id = current_user["company_id"]
    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    result = await db.execute(
        select(EventAssignment, Shift, JobRole, User)
        .join(Shift, Shift.assignment_id == EventAssignment.id, isouter=True)
        .join(JobRole, JobRole.id == EventAssignment.job_role_id)
        .join(User, User.id == EventAssignment.user_id)
        .where(EventAssignment.event_id == event_id)
        .order_by(User.name.asc())
    )
    rows = result.all()

    assignments = []
    total_hours = Decimal("0")
    total_pay = Decimal("0")

    for assignment, shift, role, user in rows:
        hw = shift.hours_worked if shift else None
        tp = shift.total_pay if shift else None
        assignments.append(EventAssignmentDetail(
            user_id=user.id, user_name=user.name, user_email=user.email,
            user_phone=user.phone, job_role=role.name, status=assignment.status,
            clock_in=shift.clock_in if shift else None,
            clock_out=shift.clock_out if shift else None,
            hours_worked=hw, total_pay=tp,
        ))
        total_hours += hw or Decimal("0")
        total_pay += tp or Decimal("0")

    return EventDetailReport(
        id=event.id, name=event.name, event_date=event.event_date,
        start_time=event.start_time, end_time=event.end_time,
        address=event.address, city=event.city, state=event.state,
        dress_code=event.dress_code, status=event.status,
        assignments=assignments, total_staff=len(assignments),
        total_hours=total_hours, total_pay=total_pay,
    )


# ─── Nuevo: Ficha de empleado ─────────────────────────────────────────────────

class EmployeeRoleDetail(BaseModel):
    job_role_id: int
    job_role_name: str
    hourly_rate: Decimal

class EmployeeEventDetail(BaseModel):
    event_id: int
    event_name: str
    event_date: date
    job_role: str
    status: str
    hours_worked: Decimal | None
    total_pay: Decimal | None

class EmployeeDetailReport(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None
    roles: list[EmployeeRoleDetail]
    events: list[EmployeeEventDetail]
    total_events: int
    total_hours: Decimal
    total_pay: Decimal

@router.get("/employee-detail/{user_id}", response_model=EmployeeDetailReport)
async def employee_detail_report(
    user_id: int,
    current_user: AdminCoordDep,
    from_date: date | None = Query(None),
    to_date: date | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    company_id = current_user["company_id"]
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Roles del empleado
    roles_result = await db.execute(
        select(EmployeeJobRole, JobRole)
        .join(JobRole, JobRole.id == EmployeeJobRole.job_role_id)
        .where(EmployeeJobRole.user_id == user_id)
    )
    roles = [EmployeeRoleDetail(job_role_id=ejr.job_role_id, job_role_name=jr.name, hourly_rate=ejr.hourly_rate_override or jr.hourly_rate)
             for ejr, jr in roles_result.all()]

    # Eventos del empleado
    eq = (
        select(EventAssignment, Shift, JobRole, Event)
        .join(Shift, Shift.assignment_id == EventAssignment.id, isouter=True)
        .join(JobRole, JobRole.id == EventAssignment.job_role_id)
        .join(Event, Event.id == EventAssignment.event_id)
        .where(EventAssignment.user_id == user_id, EventAssignment.company_id == company_id)
        .order_by(Event.event_date.desc())
    )
    if from_date:
        eq = eq.where(Event.event_date >= from_date)
    if to_date:
        eq = eq.where(Event.event_date <= to_date)

    events_result = await db.execute(eq)
    events_list = []
    total_hours = Decimal("0")
    total_pay = Decimal("0")

    for assignment, shift, role, event in events_result.all():
        hw = shift.hours_worked if shift else None
        tp = shift.total_pay if shift else None
        events_list.append(EmployeeEventDetail(
            event_id=event.id, event_name=event.name, event_date=event.event_date,
            job_role=role.name, status=assignment.status,
            hours_worked=hw, total_pay=tp,
        ))
        total_hours += hw or Decimal("0")
        total_pay += tp or Decimal("0")

    return EmployeeDetailReport(
        id=user.id, name=user.name, email=user.email, phone=user.phone,
        roles=roles, events=events_list, total_events=len(events_list),
        total_hours=total_hours, total_pay=total_pay,
    )


# ─── Reporte 1: Por Evento (múltiples IDs) ────────────────────────────────────

@router.get("/events", response_model=list[EventReportOut])
async def report_by_event(
    current_user: AdminCoordDep,
    event_ids: str | None = Query(None, description="IDs separados por coma"),
    event_date: date | None = Query(None, alias="event_date"),
    event_name: str | None = Query(None, alias="event_name"),
    from_date: date | None = Query(None),
    to_date: date | None = Query(None),
    format: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    company_id = current_user["company_id"]
    query = select(Event).where(Event.company_id == company_id)

    if event_ids:
        ids = [int(i.strip()) for i in event_ids.split(",") if i.strip().isdigit()]
        if ids:
            query = query.where(Event.id.in_(ids))
    elif event_date:
        query = query.where(Event.event_date == event_date)
    if from_date and not event_date:
        query = query.where(Event.event_date >= from_date)
    if to_date and not event_date:
        query = query.where(Event.event_date <= to_date)
    if event_name:
        query = query.where(Event.name.ilike(f"%{event_name}%"))

    query = query.order_by(Event.event_date.desc(), Event.name.asc())
    result = await db.execute(query)
    events = result.scalars().all()
    if not events:
        return []

    reports = []
    for event in events:
        assignments_result = await db.execute(
            select(EventAssignment, Shift, JobRole, User)
            .join(Shift, Shift.assignment_id == EventAssignment.id, isouter=True)
            .join(JobRole, JobRole.id == EventAssignment.job_role_id)
            .join(User, User.id == EventAssignment.user_id)
            .where(EventAssignment.event_id == event.id, EventAssignment.status.in_(("confirmed","completed","approved","finished")))
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
            writer.writerow(["Empleado","Rol","Entrada","Salida","Horas","Tarifa/h","Pago Regular","Overtime","Total"])
            for e in report.employees:
                writer.writerow([e.user_name,e.job_role,e.clock_in,e.clock_out,e.hours_worked,e.hourly_rate,e.regular_pay,e.overtime_pay,e.total_pay])
            writer.writerow(["","","","TOTAL",report.total_hours,"","","",report.total_pay])
            writer.writerow([])
        output.seek(0)
        return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition":"attachment; filename=events_report.csv"})
    return reports


@router.get("/events/{event_id}", response_model=EventReportOut)
async def report_by_event_id(event_id: int, current_user: AdminCoordDep, format: str | None = Query(None), db: AsyncSession = Depends(get_db)):
    company_id = current_user["company_id"]
    event = await db.get(Event, event_id)
    if not event or event.company_id != company_id:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    result = await db.execute(
        select(EventAssignment, Shift, JobRole, User)
        .join(Shift, Shift.assignment_id == EventAssignment.id, isouter=True)
        .join(JobRole, JobRole.id == EventAssignment.job_role_id)
        .join(User, User.id == EventAssignment.user_id)
        .where(EventAssignment.event_id == event_id, EventAssignment.status.in_(("confirmed","completed","approved","finished")))
    )
    rows = result.all()
    employees = []; total_hours = Decimal("0"); total_pay = Decimal("0")
    for assignment, shift, role, user in rows:
        hw = shift.hours_worked if shift else None; tp = shift.total_pay if shift else None
        rp = shift.regular_pay if shift else None; op = shift.overtime_pay if shift else Decimal("0")
        rate = shift.hourly_rate_snapshot if shift else role.hourly_rate
        employees.append(EmployeeShiftRow(user_id=user.id,user_name=user.name,job_role=role.name,clock_in=shift.clock_in if shift else None,clock_out=shift.clock_out if shift else None,hours_worked=hw,hourly_rate=rate,regular_pay=rp,overtime_pay=op,total_pay=tp))
        total_hours += hw or Decimal("0"); total_pay += tp or Decimal("0")
    report = EventReportOut(event_id=event.id,event_name=event.name,event_date=event.event_date,employees=employees,total_hours=total_hours,total_pay=total_pay)
    if format == "csv":
        output = io.StringIO(); writer = csv.writer(output)
        writer.writerow(["Empleado","Rol","Entrada","Salida","Horas","Tarifa/h","Pago Regular","Overtime","Total"])
        for e in employees:
            writer.writerow([e.user_name,e.job_role,e.clock_in,e.clock_out,e.hours_worked,e.hourly_rate,e.regular_pay,e.overtime_pay,e.total_pay])
        writer.writerow(["","","","TOTAL",total_hours,"","","",total_pay])
        output.seek(0)
        return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition":f"attachment; filename=event_{event_id}_report.csv"})
    return report


# ─── Reporte 2: Por Empleado (múltiples IDs) ──────────────────────────────────

@router.get("/employees", response_model=list[EmployeeReportOut])
async def report_by_employee(
    current_user: AdminCoordDep,
    employee_ids: str | None = Query(None, description="IDs separados por coma"),
    employee_search: str | None = Query(None, alias="employee_search"),
    from_date: date = Query(..., alias="from"),
    to_date: date = Query(..., alias="to"),
    format: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    company_id = current_user["company_id"]
    users = []

    if employee_ids:
        ids = [int(i.strip()) for i in employee_ids.split(",") if i.strip().isdigit()]
        result = await db.execute(select(User).where(User.id.in_(ids)))
        users = result.scalars().all()
    elif employee_search:
        result = await db.execute(
            select(User).where(or_(
                User.name.ilike(f"%{employee_search}%"),
                User.email.ilike(f"%{employee_search}%"),
                User.phone.ilike(f"%{employee_search}%"),
            ))
        )
        users = result.scalars().all()

    if not users:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    reports = []
    for user in users:
        result = await db.execute(
            select(EventAssignment, Shift, JobRole, Event)
            .join(Shift, Shift.assignment_id == EventAssignment.id, isouter=True)
            .join(JobRole, JobRole.id == EventAssignment.job_role_id)
            .join(Event, Event.id == EventAssignment.event_id)
            .where(EventAssignment.user_id == user.id, EventAssignment.company_id == company_id,
                   EventAssignment.status.in_(("confirmed","completed","approved","finished")),
                   Event.event_date >= from_date, Event.event_date <= to_date)
            .order_by(Event.event_date.desc())
        )
        rows = result.all()
        events_list = []; total_hours = Decimal("0"); total_pay = Decimal("0")
        for assignment, shift, role, event in rows:
            hw = shift.hours_worked if shift else None; tp = shift.total_pay if shift else None
            rp = shift.regular_pay if shift else None; op = shift.overtime_pay if shift else Decimal("0")
            rate = shift.hourly_rate_snapshot if shift else role.hourly_rate
            events_list.append(EmployeeEventRow(event_id=event.id,event_name=event.name,event_date=event.event_date,event_start_time=event.start_time,event_end_time=event.end_time,job_role=role.name,hours_worked=hw,hourly_rate=rate,regular_pay=rp,overtime_pay=op,total_pay=tp))
            total_hours += hw or Decimal("0"); total_pay += tp or Decimal("0")
        reports.append(EmployeeReportOut(user_id=user.id,user_name=user.name,events=events_list,total_hours=total_hours,total_pay=total_pay))

    if format == "csv":
        output = io.StringIO(); writer = csv.writer(output)
        writer.writerow(["Empleado","Evento","Fecha","Hora Inicio","Hora Fin","Rol","Horas","Tarifa/h","Pago Regular","Overtime","Total"])
        for rpt in reports:
            for e in rpt.events:
                writer.writerow([rpt.user_name,e.event_name,e.event_date,e.event_start_time or "",e.event_end_time or "",e.job_role,e.hours_worked,e.hourly_rate,e.regular_pay,e.overtime_pay,e.total_pay])
            writer.writerow(["TOTAL","","","","","",rpt.total_hours,"","","",rpt.total_pay])
        output.seek(0)
        return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition":"attachment; filename=employee_report.csv"})
    return reports


@router.get("/employees/{user_id}", response_model=EmployeeReportOut)
async def report_by_employee_id(user_id: int, current_user: AdminCoordDep, from_date: date = Query(..., alias="from"), to_date: date = Query(..., alias="to"), format: str | None = Query(None), db: AsyncSession = Depends(get_db)):
    company_id = current_user["company_id"]
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    result = await db.execute(
        select(EventAssignment, Shift, JobRole, Event)
        .join(Shift, Shift.assignment_id == EventAssignment.id, isouter=True)
        .join(JobRole, JobRole.id == EventAssignment.job_role_id)
        .join(Event, Event.id == EventAssignment.event_id)
        .where(EventAssignment.user_id == user_id, EventAssignment.company_id == company_id,
               EventAssignment.status.in_(("confirmed","completed","approved","finished")),
               Event.event_date >= from_date, Event.event_date <= to_date)
    )
    rows = result.all()
    events_list = []; total_hours = Decimal("0"); total_pay = Decimal("0")
    for assignment, shift, role, event in rows:
        hw = shift.hours_worked if shift else None; tp = shift.total_pay if shift else None
        rp = shift.regular_pay if shift else None; op = shift.overtime_pay if shift else Decimal("0")
        rate = shift.hourly_rate_snapshot if shift else role.hourly_rate
        events_list.append(EmployeeEventRow(event_id=event.id,event_name=event.name,event_date=event.event_date,event_start_time=event.start_time,event_end_time=event.end_time,job_role=role.name,hours_worked=hw,hourly_rate=rate,regular_pay=rp,overtime_pay=op,total_pay=tp))
        total_hours += hw or Decimal("0"); total_pay += tp or Decimal("0")
    report = EmployeeReportOut(user_id=user.id,user_name=user.name,events=events_list,total_hours=total_hours,total_pay=total_pay)
    if format == "csv":
        output = io.StringIO(); writer = csv.writer(output)
        writer.writerow(["Evento","Fecha","Hora Inicio","Hora Fin","Rol","Horas","Tarifa/h","Pago Regular","Overtime","Total"])
        for e in events_list:
            writer.writerow([e.event_name,e.event_date,e.event_start_time or "",e.event_end_time or "",e.job_role,e.hours_worked,e.hourly_rate,e.regular_pay,e.overtime_pay,e.total_pay])
        writer.writerow(["TOTAL","","","","",total_hours,"","","",total_pay])
        output.seek(0)
        return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition":f"attachment; filename=employee_{user_id}_report.csv"})
    return report


@router.get("/me", response_model=EmployeeReportOut)
async def my_report(current_user: AuthDep, from_date: date = Query(..., alias="from"), to_date: date = Query(..., alias="to"), format: str | None = Query(None), db: AsyncSession = Depends(get_db)):
    user_id = int(current_user["sub"]); company_id = current_user["company_id"]
    user = await db.get(User, user_id)
    result = await db.execute(
        select(EventAssignment, Shift, JobRole, Event)
        .join(Shift, Shift.assignment_id == EventAssignment.id, isouter=True)
        .join(JobRole, JobRole.id == EventAssignment.job_role_id)
        .join(Event, Event.id == EventAssignment.event_id)
        .where(EventAssignment.user_id == user_id, EventAssignment.company_id == company_id,
               EventAssignment.status.in_(("confirmed","completed","approved","finished")),
               Event.event_date >= from_date, Event.event_date <= to_date)
    )
    rows = result.all()
    events_list = []; total_hours = Decimal("0"); total_pay = Decimal("0")
    for assignment, shift, role, event in rows:
        hw = shift.hours_worked if shift else None; tp = shift.total_pay if shift else None
        rate = shift.hourly_rate_snapshot if shift else role.hourly_rate; op = shift.overtime_pay if shift else Decimal("0")
        events_list.append(EmployeeEventRow(event_id=event.id,event_name=event.name,event_date=event.event_date,event_start_time=event.start_time,event_end_time=event.end_time,job_role=role.name,hours_worked=hw,hourly_rate=rate,regular_pay=shift.regular_pay if shift else None,overtime_pay=op,total_pay=tp))
        total_hours += hw or Decimal("0"); total_pay += tp or Decimal("0")
    report = EmployeeReportOut(user_id=user.id,user_name=user.name,events=events_list,total_hours=total_hours,total_pay=total_pay)
    if format == "csv":
        output = io.StringIO(); writer = csv.writer(output)
        writer.writerow(["Evento","Fecha","Hora Inicio","Hora Fin","Rol","Horas","Tarifa/h","Pago Regular","Overtime","Total"])
        for e in events_list:
            writer.writerow([e.event_name,e.event_date,e.event_start_time or "",e.event_end_time or "",e.job_role,e.hours_worked,e.hourly_rate,e.regular_pay,e.overtime_pay,e.total_pay])
        writer.writerow(["TOTAL","","","","",total_hours,"","","",total_pay])
        output.seek(0)
        return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition":"attachment; filename=my_report.csv"})
    return report


@router.get("/employees-by-event", response_model=list[EmployeesByEventRow])
async def employees_by_event(current_user: AdminCoordDep, from_date: date = Query(..., alias="from_date"), to_date: date = Query(..., alias="to_date"), format: str | None = Query(None), db: AsyncSession = Depends(get_db)):
    company_id = current_user["company_id"]
    query = (
        select(Event, EventAssignment, Shift, JobRole, User)
        .join(EventAssignment, EventAssignment.event_id == Event.id)
        .join(Shift, Shift.assignment_id == EventAssignment.id, isouter=True)
        .join(JobRole, JobRole.id == EventAssignment.job_role_id)
        .join(User, User.id == EventAssignment.user_id)
        .where(Event.company_id == company_id, EventAssignment.status.in_(("confirmed","completed","approved","finished")), Event.event_date >= from_date, Event.event_date <= to_date)
        .order_by(Event.event_date.desc(), Event.name.asc())
    )
    result = await db.execute(query)
    rows = result.all()
    employees_list = []
    for event, assignment, shift, role, user in rows:
        hw = shift.hours_worked if shift and shift.hours_worked is not None else None
        tp = shift.total_pay if shift and shift.total_pay is not None else None
        rate = shift.hourly_rate_snapshot if shift else role.hourly_rate
        employees_list.append(EmployeesByEventRow(event_id=event.id,user_id=user.id,event_date=event.event_date,event_start_time=event.start_time,event_end_time=event.end_time,event_name=event.name,employee_name=user.name,phone=user.phone,job_role=role.name,hours_worked=hw,hourly_rate=rate,total_pay=tp))
    if format == "csv":
        output = io.StringIO(); writer = csv.writer(output)
        writer.writerow(["Fecha Evento","Hora Inicio","Hora Fin","Evento","Empleado","Teléfono","Rol","Horas Trabajadas","Valor/Hora","Valor Total a Pagar"])
        for row in employees_list:
            writer.writerow([row.event_date,row.event_start_time or "",row.event_end_time or "",row.event_name,row.employee_name,row.phone or "",row.job_role,row.hours_worked if row.hours_worked is not None else "Pendiente",row.hourly_rate,row.total_pay if row.total_pay is not None else "Pendiente"])
        output.seek(0)
        return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition":"attachment; filename=events_by_dates_report.csv"})
    return employees_list


@router.get("/consolidated-payments", response_model=list[ConsolidatedPaymentRow])
@router.get("/payment-consolidation", response_model=list[ConsolidatedPaymentRow])
async def consolidated_payments(current_user: AdminCoordDep, from_date: date = Query(..., alias="from_date"), to_date: date = Query(..., alias="to_date"), format: str | None = Query(None), db: AsyncSession = Depends(get_db)):
    company_id = current_user["company_id"]
    result = await db.execute(
        select(User, EventAssignment, Shift)
        .join(EventAssignment, EventAssignment.user_id == User.id)
        .join(Shift, Shift.assignment_id == EventAssignment.id, isouter=True)
        .join(Event, Event.id == EventAssignment.event_id)
        .where(EventAssignment.company_id == company_id, EventAssignment.status.in_(("confirmed","completed","approved","finished")), Event.event_date >= from_date, Event.event_date <= to_date)
        .order_by(User.name.asc())
    )
    rows = result.all()
    employees_dict = {}
    for user, assignment, shift in rows:
        if user.id not in employees_dict:
            employees_dict[user.id] = {"name": user.name, "phone": user.phone, "total_hours": Decimal("0"), "total_pay": Decimal("0")}
        if shift:
            employees_dict[user.id]["total_hours"] += shift.hours_worked or Decimal("0")
            employees_dict[user.id]["total_pay"] += shift.total_pay or Decimal("0")
    payments_list = [ConsolidatedPaymentRow(employee_name=emp["name"],phone=emp.get("phone"),total_hours=emp["total_hours"],total_pay=emp["total_pay"]) for emp in employees_dict.values()]
    if format == "csv":
        output = io.StringIO(); writer = csv.writer(output)
        writer.writerow(["Empleado","Teléfono","Total Horas","Total a Pagar"])
        for row in payments_list:
            writer.writerow([row.employee_name, row.phone or "", row.total_hours, row.total_pay])
        output.seek(0)
        return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition":"attachment; filename=consolidated_payments_report.csv"})
    return payments_list
from decimal import Decimal, ROUND_HALF_UP
from dataclasses import dataclass


@dataclass
class ShiftPayResult:
    hours_worked: Decimal          # horas reales trabajadas (sin pausas)
    hours_billed: Decimal          # horas a cobrar (puede ser mayor por mínimo)
    regular_pay: Decimal
    overtime_pay: Decimal
    total_pay: Decimal
    exceeded_weekly_limit: bool
    applied_minimum: bool          # True si se aplicó el mínimo de horas


def calculate_shift_pay(
    hours_worked: Decimal,
    hourly_rate: Decimal,
    weekly_hours_limit: Decimal,
    hours_worked_this_week: Decimal,
    min_shift_hours: Decimal = Decimal("0"),
) -> ShiftPayResult:
    """
    Calcula el pago de un turno considerando:
    - Horas extra semanales (overtime al 1.5x)
    - Tiempo mínimo a pagar por turno (si la empresa lo configura)

    Regla de mínimo:
    - Si hours_worked < min_shift_hours → se paga min_shift_hours
    - Si hours_worked >= min_shift_hours → se pagan las horas reales
    """
    # Aplicar mínimo de horas si corresponde
    applied_minimum = False
    if min_shift_hours > 0 and hours_worked < min_shift_hours:
        hours_billed = min_shift_hours
        applied_minimum = True
    else:
        hours_billed = hours_worked

    # Calcular overtime sobre las horas a cobrar
    weekly_hours_remaining = max(Decimal("0"), weekly_hours_limit - hours_worked_this_week)

    regular_hours = min(hours_billed, weekly_hours_remaining)
    overtime_hours = max(Decimal("0"), hours_billed - weekly_hours_remaining)

    regular_pay = (regular_hours * hourly_rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    overtime_pay = (overtime_hours * hourly_rate * Decimal("1.5")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    total_pay = regular_pay + overtime_pay

    return ShiftPayResult(
        hours_worked=hours_worked,
        hours_billed=hours_billed,
        regular_pay=regular_pay,
        overtime_pay=overtime_pay,
        total_pay=total_pay,
        exceeded_weekly_limit=overtime_hours > 0,
        applied_minimum=applied_minimum,
    )

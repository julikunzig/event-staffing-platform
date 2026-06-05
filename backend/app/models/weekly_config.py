from sqlalchemy import ForeignKey, String, Numeric, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from decimal import Decimal
from datetime import datetime


class WeeklyHoursConfig(Base):
    __tablename__ = "weekly_hours_config"
    __table_args__ = (UniqueConstraint("company_id", name="uq_whc_company"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    weekly_hours_limit: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("40.00"), nullable=False)
    week_start_day: Mapped[str] = mapped_column(String(10), default="monday", nullable=False)
    week_end_day: Mapped[str] = mapped_column(String(10), default="sunday", nullable=False)
    # Tiempo mínimo a pagar por turno (0 = sin mínimo)
    min_shift_hours: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("0.00"), nullable=False)
    # Horas mínimas requeridas entre dos eventos en el mismo día (0 = sin restricción)
    horas_entre_eventos: Mapped[int] = mapped_column(default=0, nullable=False)
    # ¿Admin/coordinador puede registrar clock-in para todos los empleados?
    admin_can_clock_in_all: Mapped[bool] = mapped_column(default=False, nullable=False)
    # Días antes del evento que el empleado puede retirarse (0 = no puede retirarse)
    days_to_reject_event: Mapped[int] = mapped_column(default=0, nullable=False)
    # ¿Validar geolocalización al hacer clock-in?
    geolocation_enabled: Mapped[bool] = mapped_column(default=True, nullable=False)
    # Multiplicador de horas extras (ej: 1.5 = 50% más, 1.2 = 20% más)
    overtime_multiplier: Mapped[Decimal] = mapped_column(Numeric(4, 2), default=Decimal("1.50"), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    updated_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))

    company: Mapped["Company"] = relationship(back_populates="weekly_config")

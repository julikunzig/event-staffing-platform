from sqlalchemy import ForeignKey, Numeric, UniqueConstraint, CheckConstraint, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from decimal import Decimal
from datetime import datetime


class Shift(Base):
    __tablename__ = "shifts"
    __table_args__ = (
        UniqueConstraint("assignment_id", name="uq_shift_assignment"),
        CheckConstraint("clock_out IS NULL OR clock_out > clock_in", name="chk_clockout_after"),
        CheckConstraint("hours_worked IS NULL OR hours_worked >= 0", name="chk_shift_hours"),
        CheckConstraint("hourly_rate_snapshot >= 0", name="chk_shift_rate"),
        CheckConstraint("overtime_pay >= 0", name="chk_shift_overtime"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    assignment_id: Mapped[int] = mapped_column(ForeignKey("event_assignments.id", ondelete="CASCADE"), nullable=False)
    clock_in: Mapped[datetime | None] = mapped_column()
    clock_in_lat: Mapped[Decimal | None] = mapped_column(Numeric(10, 7))
    clock_in_lng: Mapped[Decimal | None] = mapped_column(Numeric(10, 7))
    clock_out: Mapped[datetime | None] = mapped_column()
    clock_out_lat: Mapped[Decimal | None] = mapped_column(Numeric(10, 7))
    clock_out_lng: Mapped[Decimal | None] = mapped_column(Numeric(10, 7))
    # Pausa
    is_paused: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    pause_start: Mapped[datetime | None] = mapped_column()
    total_pause_minutes: Mapped[Decimal] = mapped_column(Numeric(8, 2), default=Decimal("0"), nullable=False)
    # Pago
    hours_worked: Mapped[Decimal | None] = mapped_column(Numeric(6, 2))
    hourly_rate_snapshot: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    regular_pay: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
    overtime_pay: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    total_pay: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
    modified_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    assignment: Mapped["EventAssignment"] = relationship(back_populates="shift")

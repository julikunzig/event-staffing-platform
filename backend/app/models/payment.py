from sqlalchemy import ForeignKey, String, Numeric, Date, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from decimal import Decimal
from datetime import datetime, date


class Payment(Base):
    """Registro de pago grupal (batch). Contiene múltiples eventos pagados."""
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pagado", nullable=False)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0"), nullable=False)
    events_count: Mapped[int] = mapped_column(default=0, nullable=False)
    employees_count: Mapped[int] = mapped_column(default=0, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)

    items: Mapped[list["PaymentItem"]] = relationship(back_populates="payment", cascade="all, delete-orphan")
    events: Mapped[list["PaymentEvent"]] = relationship(back_populates="payment", cascade="all, delete-orphan")
    creator: Mapped["User"] = relationship(foreign_keys=[created_by])


class PaymentEvent(Base):
    """Registro de qué eventos se pagaron en cada Payment."""
    __tablename__ = "payment_events"

    id: Mapped[int] = mapped_column(primary_key=True)
    payment_id: Mapped[int] = mapped_column(ForeignKey("payments.id", ondelete="CASCADE"), nullable=False)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), nullable=False)

    payment: Mapped["Payment"] = relationship(back_populates="events")
    event: Mapped["Event"] = relationship()


class PaymentItem(Base):
    """Registro de pago por empleado. Suma de todos los eventos pagados para ese empleado."""
    __tablename__ = "payment_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    payment_id: Mapped[int] = mapped_column(ForeignKey("payments.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    total_hours: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    events_count: Mapped[int] = mapped_column(default=0, nullable=False)

    payment: Mapped["Payment"] = relationship(back_populates="items")
    user: Mapped["User"] = relationship(foreign_keys=[user_id])

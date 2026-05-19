from sqlalchemy import ForeignKey, Integer, UniqueConstraint, CheckConstraint, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from decimal import Decimal
from datetime import datetime


class EventJobRole(Base):
    __tablename__ = "event_job_roles"
    __table_args__ = (
        UniqueConstraint("event_id", "job_role_id", name="uq_event_job_role"),
        CheckConstraint("slots_required > 0", name="chk_slots_required"),
        CheckConstraint("slots_filled >= 0", name="chk_slots_filled"),
        CheckConstraint("slots_filled <= slots_required", name="chk_slots_not_exceeded"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    job_role_id: Mapped[int] = mapped_column(ForeignKey("job_roles.id", ondelete="RESTRICT"), nullable=False)
    slots_required: Mapped[int] = mapped_column(Integer, nullable=False)
    slots_filled: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    hourly_rate_override: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    event: Mapped["Event"] = relationship(back_populates="event_job_roles")
    job_role: Mapped["JobRole"] = relationship(back_populates="event_job_roles")

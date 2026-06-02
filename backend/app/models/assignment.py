from sqlalchemy import ForeignKey, String, Enum as SAEnum, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.enums import AssignmentStatus
from datetime import datetime


class EventAssignment(Base):
    __tablename__ = "event_assignments"
    __table_args__ = (UniqueConstraint("event_id", "user_id", name="uq_assignment"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    job_role_id: Mapped[int] = mapped_column(ForeignKey("job_roles.id", ondelete="RESTRICT"), nullable=False)
    event_job_role_id: Mapped[int | None] = mapped_column(ForeignKey("event_job_roles.id", ondelete="SET NULL"), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    assigned_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    event: Mapped["Event"] = relationship(back_populates="assignments")
    user: Mapped["User"] = relationship(back_populates="assignments", foreign_keys=[user_id])
    job_role: Mapped["JobRole"] = relationship(back_populates="assignments")
    shift: Mapped["Shift | None"] = relationship(back_populates="assignment", uselist=False)

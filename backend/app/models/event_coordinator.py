from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from datetime import datetime


class EventCoordinator(Base):
    """Coordinators assigned to an event by an admin."""
    __tablename__ = "event_coordinators"
    __table_args__ = (
        UniqueConstraint("event_id", "user_id", name="uq_event_coordinator"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(
        ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    assigned_by: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)

    event: Mapped["Event"] = relationship(back_populates="coordinators")
    user: Mapped["User"] = relationship(foreign_keys=[user_id])
    assigner: Mapped["User"] = relationship(foreign_keys=[assigned_by])

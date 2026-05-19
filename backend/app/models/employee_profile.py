from sqlalchemy import ForeignKey, Text, String, Numeric, Integer, SmallInteger, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from decimal import Decimal
from datetime import datetime


class EmployeeProfile(Base):
    __tablename__ = "employee_profiles"
    __table_args__ = (
        CheckConstraint(
            "average_rating IS NULL OR (average_rating >= 1.00 AND average_rating <= 5.00)",
            name="chk_avg_rating",
        ),
        CheckConstraint("total_events >= 0", name="chk_total_events"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    bio: Mapped[str | None] = mapped_column(Text)
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    average_rating: Mapped[Decimal | None] = mapped_column(Numeric(3, 2))
    total_events: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user: Mapped["User"] = relationship(back_populates="profile")


class EventRating(Base):
    __tablename__ = "event_ratings"
    __table_args__ = (
        CheckConstraint("rating BETWEEN 1 AND 5", name="chk_rating_value"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    rated_by: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    rating: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)

    event: Mapped["Event"] = relationship(back_populates="ratings")
    user: Mapped["User"] = relationship(back_populates="ratings_received", foreign_keys=[user_id])

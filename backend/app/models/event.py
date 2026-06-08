from sqlalchemy import ForeignKey, String, Date, Time, Numeric, UniqueConstraint, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from decimal import Decimal
from datetime import datetime, date, time


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    event_code: Mapped[str | None] = mapped_column(String(20), unique=True, nullable=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    event_date: Mapped[date] = mapped_column(Date, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time | None] = mapped_column(Time)
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    city: Mapped[str | None] = mapped_column(String(100))
    state: Mapped[str | None] = mapped_column(String(50))
    zip_code: Mapped[str | None] = mapped_column(String(20))
    latitude: Mapped[Decimal | None] = mapped_column(Numeric(10, 7))
    longitude: Mapped[Decimal | None] = mapped_column(Numeric(10, 7))
    dress_code: Mapped[str | None] = mapped_column(String(200))
    notes: Mapped[str | None] = mapped_column(Text)
    is_public: Mapped[bool] = mapped_column(default=True, nullable=False)
    # States: created, published, filled_pending, filled, started, finished, cancelled
    status: Mapped[str] = mapped_column(String(20), default="created", nullable=False)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    company: Mapped["Company"] = relationship(back_populates="events")
    event_job_roles: Mapped[list["EventJobRole"]] = relationship(back_populates="event", cascade="all, delete-orphan")
    assignments: Mapped[list["EventAssignment"]] = relationship(back_populates="event", cascade="all, delete-orphan")
    ratings: Mapped[list["EventRating"]] = relationship(back_populates="event", cascade="all, delete-orphan")
    coordinators: Mapped[list["EventCoordinator"]] = relationship(back_populates="event", cascade="all, delete-orphan")
    documents: Mapped[list["EventDocument"]] = relationship(back_populates="event", cascade="all, delete-orphan")

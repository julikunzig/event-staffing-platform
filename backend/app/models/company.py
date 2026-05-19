from sqlalchemy import String, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from datetime import datetime


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    contact_email: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_phone: Mapped[str | None] = mapped_column(String(30))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    shift_start_minutes_before: Mapped[int] = mapped_column(Integer, default=15, nullable=False)  # Minutos antes del evento para iniciar turno
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    memberships: Mapped[list["UserCompanyMembership"]] = relationship(back_populates="company")
    job_roles: Mapped[list["JobRole"]] = relationship(back_populates="company")
    events: Mapped[list["Event"]] = relationship(back_populates="company")
    weekly_config: Mapped["WeeklyHoursConfig | None"] = relationship(back_populates="company", uselist=False)
    notifications: Mapped[list["Notification"]] = relationship(back_populates="company")
    news: Mapped[list["News"]] = relationship(back_populates="company")

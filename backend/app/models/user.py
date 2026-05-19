from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(30))
    preferred_lang: Mapped[str] = mapped_column(String(5), default="es", nullable=False)
    must_change_password: Mapped[bool] = mapped_column(default=False, nullable=False)
    address: Mapped[str | None] = mapped_column(String(500))
    city: Mapped[str | None] = mapped_column(String(100))
    state: Mapped[str | None] = mapped_column(String(50))
    zip_code: Mapped[str | None] = mapped_column(String(20))
    photo_url: Mapped[str | None] = mapped_column(String(500))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    memberships: Mapped[list["UserCompanyMembership"]] = relationship(back_populates="user")
    employee_job_roles: Mapped[list["EmployeeJobRole"]] = relationship(back_populates="user")
    assignments: Mapped[list["EventAssignment"]] = relationship(
        back_populates="user", foreign_keys="EventAssignment.user_id"
    )
    profile: Mapped["EmployeeProfile | None"] = relationship(back_populates="user", uselist=False)
    notifications: Mapped[list["Notification"]] = relationship(back_populates="user")
    ratings_received: Mapped[list["EventRating"]] = relationship(
        back_populates="user", foreign_keys="EventRating.user_id"
    )

from sqlalchemy import ForeignKey, String, Boolean, Numeric, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from decimal import Decimal
from datetime import datetime


class JobRole(Base):
    __tablename__ = "job_roles"
    __table_args__ = (UniqueConstraint("company_id", "name", name="uq_job_role_company"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    hourly_rate: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    company: Mapped["Company"] = relationship(back_populates="job_roles")
    employee_job_roles: Mapped[list["EmployeeJobRole"]] = relationship(back_populates="job_role")
    event_job_roles: Mapped[list["EventJobRole"]] = relationship(back_populates="job_role")
    assignments: Mapped[list["EventAssignment"]] = relationship(back_populates="job_role")


class EmployeeJobRole(Base):
    __tablename__ = "employee_job_roles"
    __table_args__ = (UniqueConstraint("user_id", "company_id", "job_role_id", name="uq_employee_job_role"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    job_role_id: Mapped[int] = mapped_column(ForeignKey("job_roles.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)

    user: Mapped["User"] = relationship(back_populates="employee_job_roles")
    job_role: Mapped["JobRole"] = relationship(back_populates="employee_job_roles")

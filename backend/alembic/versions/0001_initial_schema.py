"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-04-23
"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # --- profiles ---
    op.create_table(
        "profiles",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("code", sa.String(50), nullable=False, unique=True),
        sa.Column("name_es", sa.String(100), nullable=False),
        sa.Column("name_en", sa.String(100), nullable=False),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # --- companies ---
    op.create_table(
        "companies",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("slug", sa.String(100), nullable=False, unique=True),
        sa.Column("contact_email", sa.String(255), nullable=False),
        sa.Column("contact_phone", sa.String(30)),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # --- users ---
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(30)),
        sa.Column("preferred_lang", sa.String(5), nullable=False, server_default="es"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # --- user_company_memberships ---
    op.create_table(
        "user_company_memberships",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_id", sa.Integer, sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("profile_id", sa.Integer, sa.ForeignKey("profiles.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("user_id", "company_id", name="uq_user_company"),
    )
    op.create_index("idx_ucm_company", "user_company_memberships", ["company_id"])
    op.create_index("idx_ucm_user", "user_company_memberships", ["user_id"])

    # --- job_roles ---
    op.create_table(
        "job_roles",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("company_id", sa.Integer, sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("hourly_rate", sa.Numeric(10, 2), nullable=False),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("company_id", "name", name="uq_job_role_company"),
        sa.CheckConstraint("hourly_rate >= 0", name="chk_hourly_rate"),
    )
    op.create_index("idx_job_roles_company", "job_roles", ["company_id"])

    # --- employee_job_roles ---
    op.create_table(
        "employee_job_roles",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_id", sa.Integer, sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("job_role_id", sa.Integer, sa.ForeignKey("job_roles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("user_id", "company_id", "job_role_id", name="uq_employee_job_role"),
    )
    op.create_index("idx_ejr_user_company", "employee_job_roles", ["user_id", "company_id"])

    # --- weekly_hours_config ---
    op.create_table(
        "weekly_hours_config",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("company_id", sa.Integer, sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("weekly_hours_limit", sa.Numeric(5, 2), nullable=False, server_default="40.00"),
        sa.Column("week_start_day", sa.String(10), nullable=False, server_default="monday"),
        sa.Column("week_end_day", sa.String(10), nullable=False, server_default="sunday"),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_by", sa.Integer, sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.UniqueConstraint("company_id", name="uq_whc_company"),
        sa.CheckConstraint("weekly_hours_limit > 0", name="chk_hours_limit"),
    )

    # --- events ---
    op.create_table(
        "events",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("company_id", sa.Integer, sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("event_date", sa.Date, nullable=False),
        sa.Column("start_time", sa.Time, nullable=False),
        sa.Column("end_time", sa.Time),
        sa.Column("address", sa.String(500), nullable=False),
        sa.Column("latitude", sa.Numeric(10, 7)),
        sa.Column("longitude", sa.Numeric(10, 7)),
        sa.Column("dress_code", sa.String(200)),
        sa.Column("status", sa.String(20), nullable=False, server_default="draft"),
        sa.Column("created_by", sa.Integer, sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("idx_events_company", "events", ["company_id"])
    op.create_index("idx_events_company_date", "events", ["company_id", "event_date"])
    op.create_index("idx_events_status", "events", ["company_id", "status"])

    # --- event_job_roles ---
    op.create_table(
        "event_job_roles",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("event_id", sa.Integer, sa.ForeignKey("events.id", ondelete="CASCADE"), nullable=False),
        sa.Column("job_role_id", sa.Integer, sa.ForeignKey("job_roles.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("slots_required", sa.Integer, nullable=False),
        sa.Column("slots_filled", sa.Integer, nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("event_id", "job_role_id", name="uq_event_job_role"),
        sa.CheckConstraint("slots_required > 0", name="chk_slots_required"),
        sa.CheckConstraint("slots_filled >= 0", name="chk_slots_filled"),
        sa.CheckConstraint("slots_filled <= slots_required", name="chk_slots_not_exceeded"),
    )
    op.create_index("idx_ejr_event", "event_job_roles", ["event_id"])

    # --- event_assignments ---
    op.create_table(
        "event_assignments",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("event_id", sa.Integer, sa.ForeignKey("events.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_id", sa.Integer, sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("job_role_id", sa.Integer, sa.ForeignKey("job_roles.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("assigned_by", sa.Integer, sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("event_id", "user_id", name="uq_assignment"),
    )
    op.create_index("idx_ea_event", "event_assignments", ["event_id"])
    op.create_index("idx_ea_user", "event_assignments", ["user_id", "company_id"])
    op.create_index("idx_ea_company", "event_assignments", ["company_id"])
    op.create_index("idx_ea_status", "event_assignments", ["event_id", "status"])

    # --- shifts ---
    op.create_table(
        "shifts",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("assignment_id", sa.Integer, sa.ForeignKey("event_assignments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("clock_in", sa.DateTime(timezone=True)),
        sa.Column("clock_in_lat", sa.Numeric(10, 7)),
        sa.Column("clock_in_lng", sa.Numeric(10, 7)),
        sa.Column("clock_out", sa.DateTime(timezone=True)),
        sa.Column("clock_out_lat", sa.Numeric(10, 7)),
        sa.Column("clock_out_lng", sa.Numeric(10, 7)),
        sa.Column("hours_worked", sa.Numeric(6, 2)),
        sa.Column("hourly_rate_snapshot", sa.Numeric(10, 2), nullable=False),
        sa.Column("regular_pay", sa.Numeric(10, 2)),
        sa.Column("overtime_pay", sa.Numeric(10, 2), nullable=False, server_default="0.00"),
        sa.Column("total_pay", sa.Numeric(10, 2)),
        sa.Column("modified_by", sa.Integer, sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("assignment_id", name="uq_shift_assignment"),
        sa.CheckConstraint("clock_out IS NULL OR clock_out > clock_in", name="chk_clockout_after"),
        sa.CheckConstraint("hours_worked IS NULL OR hours_worked >= 0", name="chk_shift_hours"),
        sa.CheckConstraint("hourly_rate_snapshot >= 0", name="chk_shift_rate"),
        sa.CheckConstraint("overtime_pay >= 0", name="chk_shift_overtime"),
    )
    op.create_index("idx_shifts_assignment", "shifts", ["assignment_id"])

    # --- notifications ---
    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("company_id", sa.Integer, sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("type", sa.String(100), nullable=False),
        sa.Column("channel", sa.String(10), nullable=False),
        sa.Column("subject", sa.String(255)),
        sa.Column("body", sa.Text, nullable=False),
        sa.Column("status", sa.String(10), nullable=False, server_default="pending"),
        sa.Column("attempts", sa.SmallInteger, nullable=False, server_default="0"),
        sa.Column("error_message", sa.Text),
        sa.Column("sent_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("idx_notif_user", "notifications", ["user_id"])
    op.create_index("idx_notif_company", "notifications", ["company_id"])
    op.create_index("idx_notif_status", "notifications", ["status"])

    # --- employee_profiles ---
    op.create_table(
        "employee_profiles",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("bio", sa.Text),
        sa.Column("avatar_url", sa.String(500)),
        sa.Column("average_rating", sa.Numeric(3, 2)),
        sa.Column("total_events", sa.Integer, nullable=False, server_default="0"),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint(
            "average_rating IS NULL OR (average_rating >= 1.00 AND average_rating <= 5.00)",
            name="chk_avg_rating",
        ),
        sa.CheckConstraint("total_events >= 0", name="chk_total_events"),
    )

    # --- event_ratings ---
    op.create_table(
        "event_ratings",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("event_id", sa.Integer, sa.ForeignKey("events.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_id", sa.Integer, sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("rated_by", sa.Integer, sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("rating", sa.SmallInteger, nullable=False),
        sa.Column("comment", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("event_id", "user_id", name="uq_rating_event_user"),
        sa.CheckConstraint("rating BETWEEN 1 AND 5", name="chk_rating_value"),
    )
    op.create_index("idx_ratings_user", "event_ratings", ["user_id"])
    op.create_index("idx_ratings_event", "event_ratings", ["event_id"])
    op.create_index("idx_ratings_company", "event_ratings", ["company_id"])

    # --- seed profiles ---
    op.execute("""
        INSERT INTO profiles (code, name_es, name_en) VALUES
        ('super_admin', 'Super Administrador', 'Super Administrator'),
        ('admin',       'Administrador',       'Administrator'),
        ('coordinator', 'Coordinador',         'Coordinator'),
        ('employee',    'Empleado',            'Employee')
    """)


def downgrade() -> None:
    op.drop_table("event_ratings")
    op.drop_table("employee_profiles")
    op.drop_table("notifications")
    op.drop_table("shifts")
    op.drop_table("event_assignments")
    op.drop_table("event_job_roles")
    op.drop_table("events")
    op.drop_table("weekly_hours_config")
    op.drop_table("employee_job_roles")
    op.drop_table("job_roles")
    op.drop_table("user_company_memberships")
    op.drop_table("users")
    op.drop_table("companies")
    op.drop_table("profiles")

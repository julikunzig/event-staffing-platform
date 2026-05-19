"""event job role hourly rate override

Revision ID: 0005
Revises: 0004
Create Date: 2026-04-29
"""
from alembic import op
import sqlalchemy as sa

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Tarifa override por rol en un evento específico (no modifica la tarifa global)
    op.add_column("event_job_roles",
                  sa.Column("hourly_rate_override", sa.Numeric(10, 2), nullable=True))


def downgrade() -> None:
    op.drop_column("event_job_roles", "hourly_rate_override")

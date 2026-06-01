"""Add hourly_rate_override to employee_job_roles

Revision ID: 0013
Revises: 0012
Create Date: 2026-06-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '0013'
down_revision = '0012'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('employee_job_roles', sa.Column('hourly_rate_override', sa.Numeric(10, 2), nullable=True))


def downgrade() -> None:
    op.drop_column('employee_job_roles', 'hourly_rate_override')

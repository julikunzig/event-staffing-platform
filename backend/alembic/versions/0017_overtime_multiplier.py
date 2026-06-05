"""Add overtime_multiplier to weekly_hours_config

Revision ID: 0017
Revises: 0016
Create Date: 2026-06-03 14:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '0017'
down_revision = '0016'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('weekly_hours_config', sa.Column('overtime_multiplier', sa.Numeric(4, 2), server_default='1.50', nullable=False))


def downgrade() -> None:
    op.drop_column('weekly_hours_config', 'overtime_multiplier')

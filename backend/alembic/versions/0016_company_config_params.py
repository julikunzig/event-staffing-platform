"""Add configuration parameters: admin_clock_in, days_to_reject, geolocation_enabled

Revision ID: 0016
Revises: 0015
Create Date: 2026-06-03 12:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '0016'
down_revision = '0015'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # admin_can_clock_in_all: Can admin/coordinator register clock-in for all employees?
    op.add_column('weekly_hours_config', sa.Column('admin_can_clock_in_all', sa.Boolean(), server_default='false', nullable=False))
    # days_to_reject_event: Days before event that employee can withdraw from confirmed event (0 = cannot withdraw)
    op.add_column('weekly_hours_config', sa.Column('days_to_reject_event', sa.Integer(), server_default='0', nullable=False))
    # geolocation_enabled: Whether to validate geolocation on clock-in
    op.add_column('weekly_hours_config', sa.Column('geolocation_enabled', sa.Boolean(), server_default='true', nullable=False))


def downgrade() -> None:
    op.drop_column('weekly_hours_config', 'geolocation_enabled')
    op.drop_column('weekly_hours_config', 'days_to_reject_event')
    op.drop_column('weekly_hours_config', 'admin_can_clock_in_all')

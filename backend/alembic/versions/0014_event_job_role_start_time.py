"""Add start_time to event_job_roles and remove unique constraint

Revision ID: 0014
Revises: 0013
Create Date: 2026-06-01 12:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '0014'
down_revision = '0013'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('event_job_roles', sa.Column('start_time', sa.Time(), nullable=True))
    # Remove unique constraint to allow same role multiple times with different start_time
    op.drop_constraint('uq_event_job_role', 'event_job_roles', type_='unique')


def downgrade() -> None:
    op.drop_column('event_job_roles', 'start_time')
    op.create_unique_constraint('uq_event_job_role', 'event_job_roles', ['event_id', 'job_role_id'])

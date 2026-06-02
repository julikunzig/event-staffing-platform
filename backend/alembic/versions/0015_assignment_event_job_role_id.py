"""Add event_job_role_id to event_assignments

Revision ID: 0015
Revises: 0014
Create Date: 2026-06-02 18:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '0015'
down_revision = '0014'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('event_assignments', sa.Column('event_job_role_id', sa.Integer(), sa.ForeignKey('event_job_roles.id', ondelete='SET NULL'), nullable=True))
    op.create_index('ix_ea_event_job_role', 'event_assignments', ['event_job_role_id'])


def downgrade() -> None:
    op.drop_index('ix_ea_event_job_role', table_name='event_assignments')
    op.drop_column('event_assignments', 'event_job_role_id')

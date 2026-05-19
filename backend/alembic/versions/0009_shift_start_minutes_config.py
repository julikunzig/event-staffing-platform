"""Add shift_start_minutes_before to companies table

Revision ID: 0009
Revises: 0008
Create Date: 2026-05-08 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0009'
down_revision = '0008'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('companies', sa.Column('shift_start_minutes_before', sa.Integer(), nullable=False, server_default='30'))


def downgrade() -> None:
    op.drop_column('companies', 'shift_start_minutes_before')

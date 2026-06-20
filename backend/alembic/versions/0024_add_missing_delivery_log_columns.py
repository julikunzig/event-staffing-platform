"""add missing columns to email_delivery_logs

Revision ID: 0024
Revises: 0023
Create Date: 2026-06-20 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '0024'
down_revision = '0023'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('email_delivery_logs', sa.Column('html_body', sa.Text(), nullable=True))
    op.add_column('email_delivery_logs', sa.Column('text_body', sa.Text(), nullable=True))
    op.add_column('email_delivery_logs', sa.Column('variables_json', sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column('email_delivery_logs', 'variables_json')
    op.drop_column('email_delivery_logs', 'text_body')
    op.drop_column('email_delivery_logs', 'html_body')

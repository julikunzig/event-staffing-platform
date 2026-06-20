"""add missing columns to email_delivery_logs

Revision ID: 0024
Revises: 0023
Create Date: 2026-06-20
"""

from typing import Sequence, Union

from alembic import op


revision: str = "0024"
down_revision: Union[str, None] = "0023"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        ALTER TABLE email_delivery_logs
        ADD COLUMN IF NOT EXISTS html_body TEXT
    """)

    op.execute("""
        ALTER TABLE email_delivery_logs
        ADD COLUMN IF NOT EXISTS text_body TEXT
    """)

    op.execute("""
        ALTER TABLE email_delivery_logs
        ADD COLUMN IF NOT EXISTS variables_json JSONB
    """)


def downgrade() -> None:
    op.execute("""
        ALTER TABLE email_delivery_logs
        DROP COLUMN IF EXISTS variables_json
    """)

    op.execute("""
        ALTER TABLE email_delivery_logs
        DROP COLUMN IF EXISTS text_body
    """)

    op.execute("""
        ALTER TABLE email_delivery_logs
        DROP COLUMN IF EXISTS html_body
    """)
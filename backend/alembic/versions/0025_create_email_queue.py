"""create email queue

Revision ID: 0024
Revises: 0025
Create Date: 2026-06-20
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0026_email_queue"
down_revision: Union[str, None] = "b2407287dea4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "email_queue",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("company_id", sa.Integer(), sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("template_code", sa.String(length=100), nullable=False),
        sa.Column("recipient_email", sa.String(length=255), nullable=False),
        sa.Column("variables_json", sa.JSON(), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="pending"),
        sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("max_attempts", sa.Integer(), nullable=False, server_default="3"),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("scheduled_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("processed_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

    op.create_index("ix_email_queue_company_id", "email_queue", ["company_id"])
    op.create_index("ix_email_queue_template_code", "email_queue", ["template_code"])
    op.create_index("ix_email_queue_recipient_email", "email_queue", ["recipient_email"])
    op.create_index("ix_email_queue_status", "email_queue", ["status"])
    op.create_index("ix_email_queue_scheduled_at", "email_queue", ["scheduled_at"])


def downgrade() -> None:
    op.drop_index("ix_email_queue_scheduled_at", table_name="email_queue")
    op.drop_index("ix_email_queue_status", table_name="email_queue")
    op.drop_index("ix_email_queue_recipient_email", table_name="email_queue")
    op.drop_index("ix_email_queue_template_code", table_name="email_queue")
    op.drop_index("ix_email_queue_company_id", table_name="email_queue")
    op.drop_table("email_queue")

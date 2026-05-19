"""shift pause support and minimum shift hours per company

Revision ID: 0007
Revises: 0006
Create Date: 2026-05-05
"""
from alembic import op
import sqlalchemy as sa

revision = "0007"
down_revision = "0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Campos de pausa en shifts
    op.add_column("shifts", sa.Column("pause_start", sa.DateTime(), nullable=True))
    op.add_column("shifts", sa.Column("total_pause_minutes", sa.Numeric(8, 2), nullable=True, server_default="0"))
    op.add_column("shifts", sa.Column("is_paused", sa.Boolean(), nullable=False, server_default="false"))

    # Tiempo mínimo a pagar por turno en weekly_hours_config
    op.add_column(
        "weekly_hours_config",
        sa.Column("min_shift_hours", sa.Numeric(5, 2), nullable=False, server_default="0")
    )


def downgrade() -> None:
    op.drop_column("shifts", "pause_start")
    op.drop_column("shifts", "total_pause_minutes")
    op.drop_column("shifts", "is_paused")
    op.drop_column("weekly_hours_config", "min_shift_hours")

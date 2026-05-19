"""event notes field and company admin endpoints

Revision ID: 0008
Revises: 0007
Create Date: 2026-05-05
"""
from alembic import op
import sqlalchemy as sa

revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Campo notas/detalles adicionales en eventos
    op.add_column("events", sa.Column("notes", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("events", "notes")

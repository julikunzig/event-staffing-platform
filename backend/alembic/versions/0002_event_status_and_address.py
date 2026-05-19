"""event status and address fields

Revision ID: 0002
Revises: 0001
Create Date: 2026-04-28
"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Agregar campos de dirección a events
    op.add_column("events", sa.Column("city", sa.String(100)))
    op.add_column("events", sa.Column("state", sa.String(50)))
    op.add_column("events", sa.Column("zip_code", sa.String(20)))

    # Actualizar valores de status en events para incluir nuevos estados
    # Los nuevos estados: created, published, filled, started, finished, cancelled
    # Primero actualizamos los registros existentes
    op.execute("UPDATE events SET status = 'created' WHERE status = 'draft'")

    # Agregar nuevo estado 'invited' a event_assignments
    # Los estados ahora son: pending, approved, invited, rejected, removed
    # No hay cambio de tipo ya que usamos VARCHAR

    # Agregar campo para contraseña temporal
    op.add_column("users", sa.Column("must_change_password", sa.Boolean,
                                     server_default="false", nullable=False))


def downgrade() -> None:
    op.drop_column("events", "city")
    op.drop_column("events", "state")
    op.drop_column("events", "zip_code")
    op.drop_column("users", "must_change_password")
    op.execute("UPDATE events SET status = 'draft' WHERE status = 'created'")

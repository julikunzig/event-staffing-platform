"""user profile extended fields and documents

Revision ID: 0006
Revises: 0005
Create Date: 2026-04-29
"""
from alembic import op
import sqlalchemy as sa

revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Campos de dirección y perfil extendido en users
    op.add_column("users", sa.Column("address", sa.String(500)))
    op.add_column("users", sa.Column("city", sa.String(100)))
    op.add_column("users", sa.Column("state", sa.String(50)))
    op.add_column("users", sa.Column("zip_code", sa.String(20)))
    op.add_column("users", sa.Column("photo_url", sa.String(500)))

    # Tabla de documentos del usuario
    op.create_table(
        "user_documents",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("doc_type", sa.String(50), nullable=False),  # photo, w9, certification, other
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("url", sa.String(500), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("idx_user_docs_user", "user_documents", ["user_id"])


def downgrade() -> None:
    op.drop_table("user_documents")
    op.drop_column("users", "address")
    op.drop_column("users", "city")
    op.drop_column("users", "state")
    op.drop_column("users", "zip_code")
    op.drop_column("users", "photo_url")

"""Add annulment audit fields to payroll_settlements

Revision ID: 0021
Revises: 0020
Create Date: 2026-06-10 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '0021'
down_revision = '0020'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Campos de auditoría para la anulación de liquidaciones.
    # El estado se maneja en la columna 'status' existente: 'liquidado' -> 'anulado'.
    op.add_column('payroll_settlements', sa.Column('annulled_at', sa.DateTime(), nullable=True))
    op.add_column('payroll_settlements', sa.Column('annulled_by', sa.Integer(), nullable=True))
    op.add_column('payroll_settlements', sa.Column('annul_reason', sa.String(500), nullable=True))
    op.create_foreign_key(
        'fk_payroll_settlements_annulled_by',
        'payroll_settlements', 'users',
        ['annulled_by'], ['id'],
        ondelete='SET NULL',
    )


def downgrade() -> None:
    op.drop_constraint('fk_payroll_settlements_annulled_by', 'payroll_settlements', type_='foreignkey')
    op.drop_column('payroll_settlements', 'annul_reason')
    op.drop_column('payroll_settlements', 'annulled_by')
    op.drop_column('payroll_settlements', 'annulled_at')

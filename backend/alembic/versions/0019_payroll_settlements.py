"""Add payroll_settlements and payroll_settlement_items tables

Revision ID: 0019
Revises: 0018
Create Date: 2026-05-28 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '0019'
down_revision = '0018'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'payroll_settlements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(20), nullable=False, server_default='liquidado'),
        sa.Column('period_start', sa.Date(), nullable=False),
        sa.Column('period_end', sa.Date(), nullable=False),
        sa.Column('total_amount', sa.Numeric(10, 2), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_payroll_settlements_company_id', 'payroll_settlements', ['company_id'])

    op.create_table(
        'payroll_settlement_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('settlement_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('shift_id', sa.Integer(), nullable=False),
        sa.Column('week_start', sa.Date(), nullable=False),
        sa.Column('week_end', sa.Date(), nullable=False),
        sa.Column('hours_worked', sa.Numeric(5, 2), nullable=False),
        sa.Column('hourly_rate', sa.Numeric(10, 2), nullable=False),
        sa.Column('regular_hours', sa.Numeric(5, 2), nullable=False),
        sa.Column('overtime_hours', sa.Numeric(5, 2), nullable=False, server_default='0'),
        sa.Column('regular_pay', sa.Numeric(10, 2), nullable=False),
        sa.Column('overtime_pay', sa.Numeric(10, 2), nullable=False, server_default='0'),
        sa.Column('total_pay', sa.Numeric(10, 2), nullable=False),
        sa.ForeignKeyConstraint(['settlement_id'], ['payroll_settlements.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['shift_id'], ['shifts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_payroll_settlement_items_settlement_id', 'payroll_settlement_items', ['settlement_id'])
    op.create_index('ix_payroll_settlement_items_user_id', 'payroll_settlement_items', ['user_id'])

    # Add settlement_id column to shifts table
    op.add_column('shifts', sa.Column('settlement_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_shifts_settlement_id',
        'shifts', 'payroll_settlements',
        ['settlement_id'], ['id'],
        ondelete='SET NULL'
    )


def downgrade() -> None:
    op.drop_constraint('fk_shifts_settlement_id', 'shifts', type_='foreignkey')
    op.drop_column('shifts', 'settlement_id')
    op.drop_index('ix_payroll_settlement_items_user_id', table_name='payroll_settlement_items')
    op.drop_index('ix_payroll_settlement_items_settlement_id', table_name='payroll_settlement_items')
    op.drop_table('payroll_settlement_items')
    op.drop_index('ix_payroll_settlements_company_id', table_name='payroll_settlements')
    op.drop_table('payroll_settlements')

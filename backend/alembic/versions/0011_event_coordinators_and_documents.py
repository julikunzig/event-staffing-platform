"""Add event_coordinators and event_documents tables

Revision ID: 0011
Revises: 0010
Create Date: 2026-05-20 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = '0011'
down_revision = '0010'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # event_coordinators: maps coordinators to events
    op.create_table(
        'event_coordinators',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('event_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('assigned_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['event_id'], ['events.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['assigned_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('event_id', 'user_id', name='uq_event_coordinator'),
    )
    op.create_index('ix_event_coordinators_event_id', 'event_coordinators', ['event_id'])
    op.create_index('ix_event_coordinators_user_id', 'event_coordinators', ['user_id'])

    # event_documents: links/documents attached to an event
    op.create_table(
        'event_documents',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('event_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('url', sa.String(1000), nullable=False),
        sa.Column('uploaded_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['event_id'], ['events.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['uploaded_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_event_documents_event_id', 'event_documents', ['event_id'])

    # Add notes column to events if not already present
    # Check if column exists first to avoid transaction abort
    conn = op.get_bind()
    result = conn.execute(sa.text(
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_name='events' AND column_name='notes'"
    ))
    if not result.fetchone():
        op.add_column('events', sa.Column('notes', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_index('ix_event_documents_event_id', table_name='event_documents')
    op.drop_table('event_documents')
    op.drop_index('ix_event_coordinators_user_id', table_name='event_coordinators')
    op.drop_index('ix_event_coordinators_event_id', table_name='event_coordinators')
    op.drop_table('event_coordinators')

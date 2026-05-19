"""Add news table and horas_entre_eventos field

Revision ID: 0010
Revises: 0009
Create Date: 2026-05-14 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0010'
down_revision = '0009'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create news table
    op.create_table(
        'news',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('author_id', sa.Integer(), nullable=False),
        sa.Column('publication_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('expiration_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('published_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_news_company_id'), 'news', ['company_id'], unique=False)
    op.create_index(op.f('ix_news_published_at'), 'news', ['published_at'], unique=False)
    
    # Add horas_entre_eventos column to weekly_hours_config
    op.add_column('weekly_hours_config', sa.Column('horas_entre_eventos', sa.Integer(), nullable=False, server_default='0'))


def downgrade() -> None:
    # Remove horas_entre_eventos column
    op.drop_column('weekly_hours_config', 'horas_entre_eventos')
    
    # Drop news table
    op.drop_index(op.f('ix_news_published_at'), table_name='news')
    op.drop_index(op.f('ix_news_company_id'), table_name='news')
    op.drop_table('news')

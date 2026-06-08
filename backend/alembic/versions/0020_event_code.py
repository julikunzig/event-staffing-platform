"""Add event_code field and populate existing events

Revision ID: 0020
Revises: 0019
"""
from alembic import op
import sqlalchemy as sa

revision = "0020"
down_revision = "0019"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add event_code column
    op.add_column("events", sa.Column("event_code", sa.String(20), nullable=True))
    op.create_unique_constraint("uq_events_event_code", "events", ["event_code"])

    # Populate existing events with codes: {company_id}-{consecutive}
    op.execute("""
        UPDATE events SET event_code = sub.code
        FROM (
            SELECT id, company_id || '-' || ROW_NUMBER() OVER (PARTITION BY company_id ORDER BY id) as code
            FROM events
        ) sub
        WHERE events.id = sub.id
    """)


def downgrade() -> None:
    op.drop_constraint("uq_events_event_code", "events", type_="unique")
    op.drop_column("events", "event_code")

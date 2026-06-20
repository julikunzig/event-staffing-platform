"""merge email queue heads

Revision ID: 4acb227ee329
Revises: 0024, 0026_email_queue, 8f0fe94d1f22
Create Date: 2026-06-20 07:23:56.964897

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '4acb227ee329'
down_revision: Union[str, None] = ('0024', '0026_email_queue', '8f0fe94d1f22')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

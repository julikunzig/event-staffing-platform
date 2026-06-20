"""merge payments branch

Revision ID: 8f0fe94d1f22
Revises: 0022, b2407287dea4
Create Date: 2026-06-20 06:11:49.203699

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '8f0fe94d1f22'
down_revision: Union[str, None] = ('0022', 'b2407287dea4')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

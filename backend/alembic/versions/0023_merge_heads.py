"""merge payment and email settings branches

Revision ID: 0023
Revises: 0022, b2407287dea4
Create Date: 2026-06-20 00:00:00.000000
"""
from typing import Sequence, Union

revision: str = '0023'
down_revision = ('0022', 'b2407287dea4')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

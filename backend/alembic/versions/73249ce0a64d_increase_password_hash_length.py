"""Increase password hash length

Revision ID: 73249ce0a64d
Revises: 24cb754f0a9a
Create Date: 2024-05-05 23:16:48.517295

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '73249ce0a64d'
down_revision = '24cb754f0a9a'
branch_labels = None
depends_on = None

def upgrade():
    op.alter_column('users', 'password_hash',
                    existing_type=sa.String(128),
                    type_=sa.String(256),
                    existing_nullable=True)

def downgrade():
    op.alter_column('users', 'password_hash',
                    existing_type=sa.String(256),
                    type_=sa.String(128),
                    existing_nullable=True)

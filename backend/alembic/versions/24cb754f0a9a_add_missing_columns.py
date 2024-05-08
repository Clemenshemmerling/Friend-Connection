"""Add missing columns

Revision ID: 24cb754f0a9a
Revises: None
Create Date: 2024-05-05 22:45:00.170581

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector

def upgrade():
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    columns = [column['name'] for column in inspector.get_columns('users')]

    if 'password_hash' not in columns:
        op.add_column('users', sa.Column('password_hash', sa.String(length=128), nullable=True))

    if 'avatar_url' not in columns:
        op.add_column('users', sa.Column('avatar_url', sa.String(), nullable=True))

    if 'is_blocked' not in columns:
        op.add_column('users', sa.Column('is_blocked', sa.Boolean(), nullable=True))

def downgrade():
    op.drop_column('users', 'is_blocked')
    op.drop_column('users', 'avatar_url')
    op.drop_column('users', 'password_hash')

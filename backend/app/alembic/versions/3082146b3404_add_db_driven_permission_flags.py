"""add_db_driven_permission_flags

Revision ID: 3082146b3404
Revises: 1a1dba24471c
Create Date: 2026-05-01 09:00:06.542219

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '3082146b3404'
down_revision = '1a1dba24471c'
branch_labels = None
depends_on = None


def upgrade():
    # Add as nullable first (existing rows can't satisfy NOT NULL without a value)
    op.add_column('user', sa.Column('can_access_dashboard', sa.Boolean(), nullable=True))
    op.add_column('user', sa.Column('can_apply_internship', sa.Boolean(), nullable=True))
    op.add_column('user', sa.Column('can_view_convention', sa.Boolean(), nullable=True))
    op.add_column('user', sa.Column('can_view_tracking', sa.Boolean(), nullable=True))
    op.add_column('user', sa.Column('can_review_applications', sa.Boolean(), nullable=True))

    # Backfill all existing rows to False (least-privilege default)
    op.execute('UPDATE "user" SET can_access_dashboard = FALSE WHERE can_access_dashboard IS NULL')
    op.execute('UPDATE "user" SET can_apply_internship = FALSE WHERE can_apply_internship IS NULL')
    op.execute('UPDATE "user" SET can_view_convention = FALSE WHERE can_view_convention IS NULL')
    op.execute('UPDATE "user" SET can_view_tracking = FALSE WHERE can_view_tracking IS NULL')
    op.execute('UPDATE "user" SET can_review_applications = FALSE WHERE can_review_applications IS NULL')

    # Now enforce NOT NULL with a server-side default of false
    op.alter_column('user', 'can_access_dashboard', nullable=False, server_default=sa.false())
    op.alter_column('user', 'can_apply_internship', nullable=False, server_default=sa.false())
    op.alter_column('user', 'can_view_convention', nullable=False, server_default=sa.false())
    op.alter_column('user', 'can_view_tracking', nullable=False, server_default=sa.false())
    op.alter_column('user', 'can_review_applications', nullable=False, server_default=sa.false())


def downgrade():
    op.drop_column('user', 'can_review_applications')
    op.drop_column('user', 'can_view_tracking')
    op.drop_column('user', 'can_view_convention')
    op.drop_column('user', 'can_apply_internship')
    op.drop_column('user', 'can_access_dashboard')

"""add university branding to internship offers

Revision ID: a1b2c3d4e5f6
Revises: f1a2b3c4d5e6
Create Date: 2026-05-01 21:18:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "a1b2c3d4e5f6"
down_revision = "1b89afeda774"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "internshipoffer",
        sa.Column("university_name", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "internshipoffer",
        sa.Column("university_logo", sa.String(length=1000), nullable=True),
    )
    op.add_column(
        "internshipoffer",
        sa.Column("country_flag", sa.String(length=10), nullable=True),
    )
    op.add_column(
        "internshipoffer",
        sa.Column("country", sa.String(length=100), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("internshipoffer", "country")
    op.drop_column("internshipoffer", "country_flag")
    op.drop_column("internshipoffer", "university_logo")
    op.drop_column("internshipoffer", "university_name")

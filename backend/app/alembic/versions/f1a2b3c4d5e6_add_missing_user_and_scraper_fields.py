"""Add missing user and scraper fields

Revision ID: f1a2b3c4d5e6
Revises: eeacfe0ba015
Create Date: 2026-05-01 04:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'f1a2b3c4d5e6'
down_revision = 'eeacfe0ba015'
branch_labels = None
depends_on = None


def upgrade():
    # --- ENUMS ---
    bind = op.get_bind()
    
    def safe_create_enum(name, *values):
        result = bind.execute(sa.text(f"SELECT 1 FROM pg_type WHERE typname = '{name}'"))
        if not result.scalar():
            enum_type = postgresql.ENUM(*values, name=name)
            enum_type.create(bind)

    # Create required Enums safely
    safe_create_enum('internshipstatus', 'draft', 'pending_verification', 'pending_signature', 'active', 'completed', 'blocked')
    safe_create_enum('verificationstatus', 'idle', 'checking', 'verified', 'failed')
    safe_create_enum('mobilitytype', 'nationale', 'internationale')
    safe_create_enum('approvallevel', 'N1', 'N2', 'N3')
    safe_create_enum('prioritylevel', 'Low', 'Medium', 'High', 'Critical')
    safe_create_enum('alertseverity', 'info', 'warning', 'critical')

    # --- TABLES ---
    
    # 1. InternshipRequest
    op.create_table('internshiprequest',
        sa.Column('student_name', sa.String(length=255), nullable=False),
        sa.Column('registration_number', sa.String(length=50), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('birth_date', sa.Date(), nullable=True),
        sa.Column('company_name', sa.String(length=255), nullable=True),
        sa.Column('company_address', sa.String(length=500), nullable=True),
        sa.Column('mission_title', sa.String(length=255), nullable=True),
        sa.Column('mission_description', sa.String(length=2000), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('status', postgresql.ENUM('draft', 'pending_verification', 'pending_signature', 'active', 'completed', 'blocked', name='internshipstatus', create_type=False), nullable=False),
        sa.Column('verification_status', postgresql.ENUM('idle', 'checking', 'verified', 'failed', name='verificationstatus', create_type=False), nullable=False),
        sa.Column('progress', sa.Integer(), nullable=False),
        sa.Column('current_step', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_activity_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('owner_id', sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 2. Convention
    op.create_table('convention',
        sa.Column('document_name', sa.String(length=255), nullable=False),
        sa.Column('signature_step', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('internship_request_id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('owner_id', sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(['internship_request_id'], ['internshiprequest.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['owner_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 3. MobilityFile
    op.create_table('mobilityfile',
        sa.Column('reference_code', sa.String(length=20), nullable=False),
        sa.Column('student_name', sa.String(length=255), nullable=False),
        sa.Column('destination', sa.String(length=500), nullable=False),
        sa.Column('mobility_type', postgresql.ENUM('nationale', 'internationale', name='mobilitytype', create_type=False), nullable=False),
        sa.Column('approval_level', postgresql.ENUM('N1', 'N2', 'N3', name='approvallevel', create_type=False), nullable=False),
        sa.Column('priority', postgresql.ENUM('Low', 'Medium', 'High', 'Critical', name='prioritylevel', create_type=False), nullable=False),
        sa.Column('tags', sa.String(length=500), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('owner_id', sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 4. ActivityLogEntry
    op.create_table('activitylogentry',
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('content', sa.String(length=2000), nullable=False),
        sa.Column('hours', sa.Integer(), nullable=False),
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('internship_request_id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('owner_id', sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(['internship_request_id'], ['internshiprequest.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['owner_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 5. Alert
    op.create_table('alert',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('severity', postgresql.ENUM('info', 'warning', 'critical', name='alertseverity', create_type=False), nullable=False),
        sa.Column('message', sa.String(length=500), nullable=False),
        sa.Column('dossier_id', sa.Uuid(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['dossier_id'], ['internshiprequest.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 6. Recommendation Tables
    op.create_table('userinteraction',
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('offer_id', sa.Uuid(), nullable=False),
        sa.Column('event_type', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(['offer_id'], ['internshipoffer.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('stagerequest',
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('selected_mobility_type', sa.String(length=50), nullable=False),
        sa.Column('selected_interests', sa.JSON(), nullable=True),
        sa.Column('duration_preference', sa.String(length=100), nullable=True),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('processed', sa.Boolean(), nullable=True),
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('recommendation',
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('internship_id', sa.Uuid(), nullable=False),
        sa.Column('score', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(['internship_id'], ['internshipoffer.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Add missing columns to 'user' table
    op.add_column('user', sa.Column('role_type', sa.String(length=50), nullable=True))
    op.add_column('user', sa.Column('mobility_preference', sa.String(length=50), nullable=True))
    op.add_column('user', sa.Column('interest_tags', sa.JSON(), nullable=True))
    op.add_column('user', sa.Column('recommendation_score_profile', sa.JSON(), nullable=True))
    op.add_column('user', sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('user', sa.Column('total_sessions', sa.Integer(), nullable=True))
    op.add_column('user', sa.Column('engagement_score', sa.Float(), nullable=True))
    op.add_column('user', sa.Column('profile_locked', sa.Boolean(), nullable=True))

    # Add missing columns to 'internshipoffer' table
    op.add_column('internshipoffer', sa.Column('target_audience', sa.String(length=50), nullable=True))
    op.add_column('internshipoffer', sa.Column('mobility_type', sa.String(length=50), nullable=True))
    op.add_column('internshipoffer', sa.Column('keywords', sa.JSON(), nullable=True))


def downgrade():
    # Drop recommendation tables
    op.drop_table('recommendation')
    op.drop_table('stagerequest')
    op.drop_table('userinteraction')

    # Drop 'alert' table
    op.drop_table('alert')
    
    # Drop ActivityLogEntry
    op.drop_table('activitylogentry')
    
    # Drop MobilityFile
    op.drop_table('mobilityfile')
    
    # Drop Convention
    op.drop_table('convention')
    
    # Drop InternshipRequest
    op.drop_table('internshiprequest')

    # Remove columns from 'internshipoffer' table
    op.drop_column('internshipoffer', 'keywords')
    op.drop_column('internshipoffer', 'mobility_type')
    op.drop_column('internshipoffer', 'target_audience')

    # Remove columns from 'user' table
    op.drop_column('user', 'profile_locked')
    op.drop_column('user', 'engagement_score')
    op.drop_column('user', 'total_sessions')
    op.drop_column('user', 'last_login_at')
    op.drop_column('user', 'recommendation_score_profile')
    op.drop_column('user', 'interest_tags')
    op.drop_column('user', 'mobility_preference')
    op.drop_column('user', 'role_type')

    # Drop Enums
    bind = op.get_bind()
    bind.execute(sa.text("DROP TYPE IF EXISTS alertseverity"))
    bind.execute(sa.text("DROP TYPE IF EXISTS prioritylevel"))
    bind.execute(sa.text("DROP TYPE IF EXISTS approvallevel"))
    bind.execute(sa.text("DROP TYPE IF EXISTS mobilitytype"))
    bind.execute(sa.text("DROP TYPE IF EXISTS verificationstatus"))
    bind.execute(sa.text("DROP TYPE IF EXISTS internshipstatus"))

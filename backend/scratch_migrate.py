import os
import sys
from alembic.config import Config
from alembic import command

# Add the current directory to sys.path
sys.path.append(os.getcwd())

alembic_cfg = Config("alembic.ini")
command.revision(alembic_cfg, message="Add recommendation and interaction models", autogenerate=True)
command.upgrade(alembic_cfg, "head")

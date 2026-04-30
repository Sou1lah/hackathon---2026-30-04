"""
Database initialization script.
Run this after migrations to seed initial data if needed.
"""

import asyncio
from datetime import datetime
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

async def seed_database():
    """Seed database with initial data."""
    from backend.app.database import get_db, engine
    from backend.app.models import Base
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    print("✅ Database tables created!")
    print("📝 Add your initial data creation here")
    
    # Example (uncomment and modify):
    # async with get_db() as db:
    #     # Create initial records
    #     pass

if __name__ == "__main__":
    asyncio.run(seed_database())

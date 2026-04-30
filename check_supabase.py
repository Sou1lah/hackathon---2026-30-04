#!/usr/bin/env python
"""
Check what's in Supabase database
"""

import psycopg2
from psycopg2.extras import RealDictCursor

# Supabase connection
SUPABASE_DB_URL = "postgresql://postgres:hackathon123@db.ecygiqcooswopxkhdmoh.supabase.co:5432/postgres?sslmode=require"

def check_supabase():
    """Check Supabase database"""
    try:
        print("🔍 Connecting to Supabase...")
        conn = psycopg2.connect(SUPABASE_DB_URL)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        print("✅ Connected to Supabase!")
        
        # List all tables
        print("\n📋 Tables in Supabase:")
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        tables = cursor.fetchall()
        
        if tables:
            print(f"Found {len(tables)} tables:")
            for row in tables:
                print(f"  - {row['table_name']}")
        else:
            print("  (No tables found - database is empty)")
        
        # Try to get row counts
        if tables:
            print("\n📊 Row counts:")
            for row in tables:
                table_name = row['table_name']
                try:
                    cursor.execute(f"SELECT COUNT(*) as count FROM {table_name}")
                    count = cursor.fetchone()['count']
                    print(f"  {table_name}: {count} rows")
                except Exception as e:
                    print(f"  {table_name}: Error - {e}")
        
        cursor.close()
        conn.close()
        print("\n✅ Done!")
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("\n💡 This might mean:")
        print("  1. No internet connection to Supabase")
        print("  2. Wrong password/credentials")
        print("  3. Supabase server is down")
        print("\n✅ But your LOCAL database (localhost:5433) is working fine!")

if __name__ == "__main__":
    check_supabase()

#!/usr/bin/env python
"""
Database connection test & sample data insertion script
"""

import os
import sys
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

# Database credentials from environment
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:hackathon123@localhost:5433/hackathon')

def connect_db():
    """Connect to the database"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        print("✅ Connected to database successfully!")
        return conn
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return None

def create_sample_tables(conn):
    """Create sample tables if they don't exist"""
    try:
        with conn.cursor() as cur:
            # Create users table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create posts table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS posts (
                    id SERIAL PRIMARY KEY,
                    user_id INT REFERENCES users(id) ON DELETE CASCADE,
                    title VARCHAR(200) NOT NULL,
                    content TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.commit()
            print("✅ Tables created/verified!")
            return True
    except Exception as e:
        print(f"❌ Failed to create tables: {e}")
        return False

def insert_sample_data(conn):
    """Insert sample data"""
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Insert users
            cur.execute("""
                INSERT INTO users (username, email) VALUES (%s, %s)
                ON CONFLICT(email) DO NOTHING
                RETURNING id, username, email
            """, ('testuser1', 'testuser1@example.com'))
            user1 = cur.fetchone()
            
            cur.execute("""
                INSERT INTO users (username, email) VALUES (%s, %s)
                ON CONFLICT(email) DO NOTHING
                RETURNING id, username, email
            """, ('testuser2', 'testuser2@example.com'))
            user2 = cur.fetchone()
            
            conn.commit()
            
            if user1:
                print(f"✅ User 1 created: {user1['username']} ({user1['email']})")
            if user2:
                print(f"✅ User 2 created: {user2['username']} ({user2['email']})")
            
            # Insert posts
            if user1:
                cur.execute("""
                    INSERT INTO posts (user_id, title, content) VALUES (%s, %s, %s)
                    RETURNING id, title
                """, (user1['id'], 'First Post', 'This is a test post from testuser1'))
                post = cur.fetchone()
                print(f"✅ Post created: {post['title']}")
            
            if user2:
                cur.execute("""
                    INSERT INTO posts (user_id, title, content) VALUES (%s, %s, %s)
                    RETURNING id, title
                """, (user2['id'], 'Hello World', 'This is a test post from testuser2'))
                post = cur.fetchone()
                print(f"✅ Post created: {post['title']}")
            
            conn.commit()
            return True
            
    except Exception as e:
        print(f"❌ Failed to insert data: {e}")
        return False

def view_data(conn):
    """View all data in tables"""
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            print("\n📊 USERS TABLE:")
            print("-" * 60)
            cur.execute("SELECT * FROM users ORDER BY id")
            users = cur.fetchall()
            if users:
                for user in users:
                    print(f"  ID: {user['id']}, Username: {user['username']}, Email: {user['email']}")
            else:
                print("  (No users yet)")
            
            print("\n📝 POSTS TABLE:")
            print("-" * 60)
            cur.execute("""
                SELECT p.id, p.title, p.content, u.username, p.created_at 
                FROM posts p 
                LEFT JOIN users u ON p.user_id = u.id 
                ORDER BY p.id
            """)
            posts = cur.fetchall()
            if posts:
                for post in posts:
                    print(f"  ID: {post['id']}, Title: {post['title']}")
                    print(f"    By: {post['username']}, Content: {post['content']}")
            else:
                print("  (No posts yet)")
            
            print("\n" + "=" * 60)
            
    except Exception as e:
        print(f"❌ Failed to view data: {e}")

def main():
    print("🚀 Database Connection Test\n")
    print(f"Database URL: {DATABASE_URL}\n")
    
    # Connect
    conn = connect_db()
    if not conn:
        sys.exit(1)
    
    # Create tables
    if not create_sample_tables(conn):
        sys.exit(1)
    
    # Insert data
    print("\n📝 Inserting sample data...")
    insert_sample_data(conn)
    
    # View data
    print("\n🔍 Current data in database:")
    view_data(conn)
    
    # Close connection
    conn.close()
    print("✅ Connection closed\n")

if __name__ == "__main__":
    main()

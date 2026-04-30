#!/usr/bin/env python
"""Quick database test - connects and inserts test data"""

import psycopg2
import json

# Connect to local database  
try:
    conn = psycopg2.connect(
        host="localhost",
        port=5433,
        database="hackathon",
        user="postgres",
        password="hackathon123"
    )
    cursor = conn.cursor()
    print("✅ Connected to database!")
    
    # Create users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE,
        email VARCHAR(100) UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
    )
    """)
    
    # Create posts table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        title VARCHAR(200),
        content TEXT,
        created_at TIMESTAMP DEFAULT NOW()
    )
    """)
    
    conn.commit()
    print("✅ Tables created!")
    
    # Insert test users
    cursor.execute(
        "INSERT INTO users (username, email) VALUES (%s, %s) ON CONFLICT DO NOTHING RETURNING id, username",
        ("alice", "alice@example.com")
    )
    user1 = cursor.fetchone()
    
    cursor.execute(
        "INSERT INTO users (username, email) VALUES (%s, %s) ON CONFLICT DO NOTHING RETURNING id, username",
        ("bob", "bob@example.com")
    )
    user2 = cursor.fetchone()
    
    conn.commit()
    
    if user1:
        print(f"✅ User created: {user1[1]}")
    if user2:
        print(f"✅ User created: {user2[1]}")
    
    # Insert sample posts
    if user1:
        cursor.execute(
            "INSERT INTO posts (user_id, title, content) VALUES (%s, %s, %s)",
            (user1[0], "Welcome to Hackathon", "First post from Alice!")
        )
    
    if user2:
        cursor.execute(
            "INSERT INTO posts (user_id, title, content) VALUES (%s, %s, %s)",
            (user2[0], "Getting Started", "Hello from Bob!")
        )
    
    conn.commit()
    print("✅ Posts created!")
    
    # View data
    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()
    print(f"\n📊 Users: {len(users)} found")
    for u in users:
        print(f"  - {u[1]} ({u[2]})")
    
    cursor.execute("""
    SELECT p.id, p.title, u.username 
    FROM posts p 
    JOIN users u ON p.user_id = u.id
    """)
    posts = cursor.fetchall()
    print(f"\n📝 Posts: {len(posts)} found")
    for p in posts:
        print(f"  - {p[1]} (by {p[2]})")
    
    cursor.close()
    conn.close()
    print("\n✅ Database test completed successfully!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

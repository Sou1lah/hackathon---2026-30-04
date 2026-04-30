# Database Setup Guide

## Current Status ✅

**Local PostgreSQL**: Running on `localhost:5433`
- Database: `hackathon`
- User: `postgres`
- Password: `hackathon123`

**Sample Data**: Already created
- Tables: `users`, `posts`
- Users: alice, bob
- Posts: 2 sample posts

**Supabase**: Ready to connect when needed
- Host: `db.ecygiqcooswopxkhdmoh.supabase.co`
- Database: `postgres`
- User: `postgres`

---

## Choose Your Database

### Option 1: Use Local Database (Recommended for Development)

**Setup** (one-time):
```bash
# Already done! PostgreSQL is running in Docker
docker ps  # Should show hackathon-postgres

# Or restart if needed:
docker start hackathon-postgres
```

**Configuration** (`backend/.env`):
```
DATABASE_URL=postgresql://postgres:hackathon123@localhost:5433/hackathon
```

**Test connection**:
```bash
python test_db.py
```

### Option 2: Use Supabase (Production)

**Configuration** (`backend/.env`):
```
DATABASE_URL=postgresql://postgres:YOUR-PASSWORD@db.ecygiqcooswopxkhdmoh.supabase.co:5432/postgres?sslmode=require
SUPABASE_URL=https://ecygiqcooswopxkhdmoh.supabase.co
SUPABASE_KEY=your-anon-key  # Get from Supabase dashboard
```

**Note**: Will only work when you have internet access to Supabase servers.

---

## Quick Database Commands

### Connect to Local Database
```bash
PGPASSWORD=hackathon123 psql -h localhost -p 5433 -U postgres -d hackathon
```

Inside psql:
```sql
\dt                          -- List tables
SELECT * FROM users;         -- View users
SELECT * FROM posts;         -- View posts
\q                          -- Exit
```

### View Current Data
```bash
python test_db.py
```

### Add More Test Data
```python
python -c "
import psycopg2
conn = psycopg2.connect(
    host='localhost', port=5433, 
    database='hackathon', user='postgres', 
    password='hackathon123'
)
cur = conn.cursor()
cur.execute('INSERT INTO users (username, email) VALUES (%s, %s)', ('charlie', 'charlie@example.com'))
conn.commit()
print('User added!')
conn.close()
"
```

### Reset All Data
```bash
# Stop container
docker stop hackathon-postgres

# Remove container
docker rm hackathon-postgres

# Restart with fresh database
docker run -d --name hackathon-postgres \
  -e POSTGRES_PASSWORD=hackathon123 \
  -e POSTGRES_DB=hackathon \
  -p 5433:5432 \
  postgres:16-alpine
```

---

## Database Schema

### users table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### posts table
```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Troubleshooting

### "Connection refused" on localhost:5433
```bash
# Check if container is running
docker ps

# If not, start it
docker start hackathon-postgres

# Wait 5 seconds for startup
sleep 5

# Test connection
python test_db.py
```

### "Name or service not known" (Supabase)
- You don't have internet access to Supabase
- Use local database instead (`localhost:5433`)
- Or set `DATABASE_URL=postgresql://postgres:hackathon123@localhost:5433/hackathon`

### Cannot connect to local database
```bash
# Check password
echo "hackathon123"

# Check port (should be 5433)
docker port hackathon-postgres

# View container logs
docker logs hackathon-postgres
```

---

## For Your Team

**Share with team**:
1. `backend/.env` (populated with local or Supabase settings)
2. Connection string: `postgresql://postgres:hackathon123@localhost:5433/hackathon`
3. Database name: `hackathon`
4. Docker command to start: `docker start hackathon-postgres`

**Each team member**:
```bash
# Copy .env file from you
cp backend/.env ./

# Verify connection
python test_db.py

# Start developing
```

---

## Next Steps

1. ✅ Local database is working
2. 🔄 Optional: Test Supabase connection (when you have internet)
3. 📝 Build your backend models/migrations
4. 🧪 Write API endpoints
5. 🎨 Connect frontend to API

---

Last Updated: 2026-04-30

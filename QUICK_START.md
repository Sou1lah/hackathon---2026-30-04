# Quick Reference - Commands Cheat Sheet

## 🚀 First Time Setup
```bash
bash setup.sh
# Answer prompts and configure .env files
```

## 📦 Daily Development

### Backend
```bash
# Start backend server
make backend
# or
source .venv/bin/activate && uv run python backend/app/main.py
```

### Frontend
```bash
# Start frontend dev server
make frontend
# or
cd frontend && npm run dev
```

### Both Together
```bash
make dev
```

## 🧹 Code Quality

```bash
# Format all code
make format

# Check for issues
make lint

# Run all pre-commit checks
make pre-commit-run

# Run tests
make test
```

## 🗄️ Database

```bash
# Create a migration
uv run alembic revision --autogenerate -m "Your message"

# Apply migrations
make db-push

# List tables
psql $DATABASE_URL -c "\dt"

# Access Supabase CLI
supabase status
```

## 📝 Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes, test them, then:
make format  # Fix formatting
make lint    # Check for issues

# Commit
git add .
git commit -m "Add feature X"
git push origin feature/my-feature

# Create Pull Request on GitHub
```

## 🐛 Debugging

```bash
# Check if backend is running
curl http://localhost:8000

# Activate environment if needed
source .venv/bin/activate

# Check logs
make lint

# See what make targets available
make help
```

## 📂 Project Structure Quick Links

```
hackathon/
├── SETUP.md          👈 Start here for setup
├── CONTRIBUTING.md   👈 Before writing code
├── CHECKLIST.md      👈 Track progress
├── Makefile          👈 Common commands
├── setup.sh          👈 Automated setup
│
├── backend/
│   ├── app/
│   │   ├── main.py         👈 Backend entry point
│   │   ├── models/         👈 Database models
│   │   ├── routes/         👈 API endpoints
│   │   └── database.py     👈 DB connection
│   ├── scripts/
│   │   └── seed_db.py      👈 Initialize data
│   ├── tests/              👈 Backend tests
│   ├── alembic/            👈 Database migrations
│   └── .env.example        👈 Copy to .env
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx         👈 App component
│   │   ├── api/            👈 API calls
│   │   └── pages/          👈 Page components
│   ├── package.json
│   └── .env.example        👈 Copy to .env.local
│
└── .pre-commit-config.yaml 👈 Auto code checks
```

## 🆘 Common Fixes

### "module not found"
```bash
source .venv/bin/activate
uv sync
```

### "Database connection refused"
```bash
# Check .env file exists and has DATABASE_URL
cat backend/.env | grep DATABASE_URL

# Test: psql might need password
PGPASSWORD=<password> psql -h <host> -U postgres -d postgres -c "SELECT 1"
```

### "npm modules error"
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### "Port 8000 already in use"
```bash
# Find process using port
lsof -i :8000

# Kill it
kill -9 <PID>

# Or use different port
PORT=8001 uv run python backend/app/main.py
```

## 💡 Tips & Tricks

```bash
# Run only specific test
pytest backend/tests/test_something.py -v

# Format only backend
ruff format backend/

# See available make commands
make help

# Check your Python version
python --version

# List Python packages
uv pip list

# Test database connection manually
psql $DATABASE_URL -c "SELECT 1"
```

---
**Key Files to Review**: SETUP.md → CONTRIBUTING.md → CHECKLIST.md

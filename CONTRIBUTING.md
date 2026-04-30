# Contributing to This Hackathon Project

## Code of Conduct

- Be respectful and collaborative
- Ask questions before making major changes
- Share progress in team chat/standups
- Help teammates when stuck

## Getting Started

1. **Setup your environment** (only first time):
   ```bash
   bash setup.sh
   ```

2. **For daily development**:
   ```bash
   # Activate environment
   source .venv/bin/activate

   # Or use make shortcut
   make backend   # Start backend
   make frontend  # Start frontend (in another terminal)
   ```

## Git Workflow

1. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-name
   ```

2. **Make your changes** and commit regularly:
   ```bash
   git add .
   git commit -m "Clear description of what changed"
   ```

3. **Before pushing**, run code checks:
   ```bash
   make lint
   make format
   # Or run all checks:
   make pre-commit-run
   ```

4. **Push your branch** and create a Pull Request:
   ```bash
   git push origin your-branch-name
   ```

## Coding Standards

### Python (Backend)
- Follow PEP 8 style guide
- Use type hints: `def my_func(param: str) -> int:`
- Maximum line length: 88 characters (Black style)
- Docstrings for all functions/classes

**Automated formatting:**
```bash
make format  # Formats code
make lint    # Checks for issues
```

### JavaScript/TypeScript (Frontend)
- Use semicolons and 2-space indentation
- Use meaningful variable names
- Write JSDoc comments for complex functions

**Automated formatting:**
```bash
cd frontend
npm run lint
npm run format
```

## Database Changes

When modifying the database schema:

1. **Create a migration**:
   ```bash
   # For one-time local development
   uv run alembic revision --autogenerate -m "Add user_role column"
   ```

2. **Review the migration** file in `backend/alembic/versions/`

3. **Apply migrations**:
   ```bash
   make db-push
   # or
   uv run alembic upgrade head
   ```

4. **Share migration files** with the team in your PR

## API Development

When adding new API endpoints:

1. Create models in `backend/app/models/`
2. Create schemas (request/response) in `backend/app/schemas/`
3. Add routes in `backend/app/routes/`
4. Add tests in `backend/tests/`
5. Document endpoints with docstrings

Example endpoint:
```python
@router.post("/items", response_model=ItemResponse)
async def create_item(item: ItemCreate) -> ItemResponse:
    """Create a new item."""
    # Implementation here
    return item
```

## Testing

Write tests for your changes:

```bash
# Run all tests
make test

# Run specific test file
. .venv/bin/activate && uv run pytest backend/tests/test_something.py -v
```

Test file naming: `test_*.py`

## Common Tasks

### Check what tables we have in the database
```bash
make db-list
# or manually:
psql $DATABASE_URL -c "\dt"
```

### View code quality issues
```bash
make lint
```

### Clean up cache/build files
```bash
make clean
```

## Troubleshooting

### "Module not found" error
```bash
uv sync
```

### Database connection issues
- Check your `backend/.env` file has correct `DATABASE_URL`
- For Supabase: `postgresql://user:password@db.supabase.co:5432/postgres?sslmode=require`
- Test connection: `psql $DATABASE_URL -c "SELECT 1"`

### Frontend won't start
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Pre-commit hooks failing
```bash
# See what's wrong
make lint

# Fix automatically
make format
```

## Communication

- **Quick questions**: Team chat
- **Code review**: Pull Request comments
- **Major decisions**: Team discussion/standup
- **Blockers**: Let the team know immediately

## Deployment Checklist

Before deploying to production:
- [ ] All tests pass
- [ ] Code reviewed
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] No console errors or warnings

---

**Questions?** Ask your team lead or check the [SETUP.md](SETUP.md)

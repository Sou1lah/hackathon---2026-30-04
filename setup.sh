#!/usr/bin/env bash
# Team development helper script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Hackathon Project Setup${NC}"

# Check Python version
echo -e "${YELLOW}Checking Python version...${NC}"
python_version=$(python --version 2>&1 | awk '{print $2}')
echo "Python version: $python_version"

# Check if .venv exists
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python -m venv .venv
fi

# Activate venv
echo -e "${YELLOW}Activating virtual environment...${NC}"
source .venv/bin/activate

# Install uv if not exists
if ! command -v uv &> /dev/null; then
    echo -e "${YELLOW}Installing uv...${NC}"
    pip install uv
fi

# Sync dependencies
echo -e "${YELLOW}Installing Python dependencies...${NC}"
uv sync

# Setup pre-commit
if command -v pre-commit &> /dev/null; then
    echo -e "${YELLOW}Installing pre-commit hooks...${NC}"
    pre-commit install || true
fi

# Frontend setup
if [ -d "frontend" ]; then
    echo -e "${YELLOW}Setting up frontend...${NC}"
    cd frontend
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    cd ..
fi

# Check environment files
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Creating backend/.env from template...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${RED}Please edit backend/.env with your Supabase credentials${NC}"
fi

if [ ! -f "frontend/.env.local" ]; then
    echo -e "${YELLOW}⚠️  Creating frontend/.env.local from template...${NC}"
    cp frontend/.env.example frontend/.env.local
    echo -e "${RED}Please edit frontend/.env.local with your values${NC}"
fi

echo -e "${GREEN}✅ Setup complete!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Edit backend/.env with your Supabase credentials"
echo "2. Edit frontend/.env.local with your values"
echo "3. Run 'make dev' to start development servers"

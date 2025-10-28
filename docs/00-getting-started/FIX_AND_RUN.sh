#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║          PKM Shop - Fix & Run Script                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Fix npm permissions
echo -e "${YELLOW}[1/6] Fixing npm permissions...${NC}"
sudo chown -R $(whoami) ~/.npm
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ npm permissions fixed${NC}"
else
    echo -e "${RED}✗ Failed to fix npm permissions${NC}"
    exit 1
fi

# Step 2: Clean npm cache
echo ""
echo -e "${YELLOW}[2/6] Cleaning npm cache...${NC}"
npm cache clean --force
echo -e "${GREEN}✓ npm cache cleaned${NC}"

# Step 3: Install dependencies
echo ""
echo -e "${YELLOW}[3/6] Installing dependencies...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    exit 1
fi

# Step 4: Generate Prisma Client
echo ""
echo -e "${YELLOW}[4/6] Generating Prisma Client...${NC}"
npx prisma generate
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Prisma Client generated${NC}"
else
    echo -e "${RED}✗ Failed to generate Prisma Client${NC}"
    exit 1
fi

# Step 5: Check if database exists and run migrations
echo ""
echo -e "${YELLOW}[5/6] Setting up database...${NC}"
echo -e "${YELLOW}Note: Make sure MySQL is running and database 'pkm_shop' exists${NC}"
read -p "Have you created the 'pkm_shop' database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma migrate dev --name init
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Database migrations applied${NC}"
    else
        echo -e "${RED}✗ Failed to apply migrations${NC}"
        echo -e "${YELLOW}To create database manually:${NC}"
        echo "  mysql -u root -p"
        echo "  CREATE DATABASE pkm_shop;"
        echo "  exit;"
        exit 1
    fi
else
    echo -e "${YELLOW}Please create the database first:${NC}"
    echo "  mysql -u root -p"
    echo "  CREATE DATABASE pkm_shop;"
    echo "  exit;"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Step 6: Start development server
echo ""
echo -e "${YELLOW}[6/6] Starting development server...${NC}"
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Server starting at http://localhost:3000                   ║${NC}"
echo -e "${GREEN}║  Press Ctrl+C to stop                                       ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

npm run dev

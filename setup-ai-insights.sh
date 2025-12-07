#!/bin/bash

# AI Insights Setup Script
# This script automates the installation of the AI personalization engine

set -e

echo "🚀 AI Insights Setup Script"
echo "============================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Are you in the project root?${NC}"
    exit 1
fi

echo "📍 Current directory: $(pwd)"
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing @anthropic-ai/sdk..."
npm install @anthropic-ai/sdk

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    exit 1
fi
echo ""

# Step 2: Check for .env.local
echo "🔑 Step 2: Checking environment configuration..."

if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}Warning: .env.local not found. Creating from .env.example...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
    else
        touch .env.local
    fi
fi

# Check if ANTHROPIC_API_KEY is set
if grep -q "ANTHROPIC_API_KEY" .env.local; then
    if grep -q "ANTHROPIC_API_KEY=sk-ant-" .env.local; then
        echo -e "${GREEN}✓ ANTHROPIC_API_KEY found in .env.local${NC}"
    else
        echo -e "${YELLOW}⚠ ANTHROPIC_API_KEY is set but appears empty${NC}"
        echo ""
        echo "Please add your Anthropic API key to .env.local:"
        echo "  ANTHROPIC_API_KEY=sk-ant-api03-YOUR-KEY-HERE"
        echo ""
        echo "Get your API key from: https://console.anthropic.com/"
    fi
else
    echo -e "${YELLOW}⚠ ANTHROPIC_API_KEY not found in .env.local${NC}"
    echo ""
    echo "Adding ANTHROPIC_API_KEY placeholder to .env.local..."
    echo "" >> .env.local
    echo "# Anthropic API Configuration" >> .env.local
    echo "ANTHROPIC_API_KEY=sk-ant-api03-YOUR-KEY-HERE" >> .env.local
    echo ""
    echo "Please replace with your actual API key from: https://console.anthropic.com/"
fi
echo ""

# Step 3: Check for Supabase
echo "🗄️  Step 3: Checking Supabase configuration..."

if command -v supabase &> /dev/null; then
    echo -e "${GREEN}✓ Supabase CLI found${NC}"

    echo ""
    echo "Running database migration..."

    # Check if Supabase is linked
    if supabase status &> /dev/null; then
        echo "Applying migration..."
        supabase migration up

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Database migration applied${NC}"
        else
            echo -e "${YELLOW}⚠ Migration may have failed. Please check manually.${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ Supabase not linked. Please run:${NC}"
        echo "  supabase link --project-ref YOUR_PROJECT_REF"
        echo "  supabase migration up"
    fi
else
    echo -e "${YELLOW}⚠ Supabase CLI not found${NC}"
    echo ""
    echo "Please install Supabase CLI:"
    echo "  npm install -g supabase"
    echo ""
    echo "Then apply the migration manually:"
    echo "  supabase migration up"
    echo ""
    echo "Or apply via Supabase Dashboard:"
    echo "  1. Go to your project dashboard"
    echo "  2. Navigate to SQL Editor"
    echo "  3. Copy contents of supabase/migrations/20251207700000_ai_usage_tracking.sql"
    echo "  4. Paste and execute"
fi
echo ""

# Step 4: Verify setup
echo "🔍 Step 4: Verifying setup..."

# Check if all required files exist
required_files=(
    "src/lib/ai/types.ts"
    "src/lib/ai/prompts.ts"
    "src/lib/ai/sandbox.ts"
    "src/lib/ai/personalization-engine.ts"
    "src/lib/ai/index.ts"
    "src/app/api/insights/daily/route.ts"
    "src/app/api/insights/quota/route.ts"
    "supabase/migrations/20251207700000_ai_usage_tracking.sql"
)

all_files_exist=true
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file (missing)"
        all_files_exist=false
    fi
done

echo ""

if [ "$all_files_exist" = true ]; then
    echo -e "${GREEN}✓ All required files present${NC}"
else
    echo -e "${RED}✗ Some files are missing${NC}"
    exit 1
fi
echo ""

# Final summary
echo "📋 Setup Summary"
echo "================"
echo ""
echo "Next steps:"
echo ""
echo "1. Add your Anthropic API key to .env.local:"
echo "   ${YELLOW}ANTHROPIC_API_KEY=sk-ant-api03-YOUR-KEY-HERE${NC}"
echo ""
echo "2. Get your API key from:"
echo "   ${YELLOW}https://console.anthropic.com/${NC}"
echo ""
echo "3. If not already done, apply the database migration:"
echo "   ${YELLOW}npx supabase migration up${NC}"
echo ""
echo "4. Start the development server:"
echo "   ${YELLOW}npm run dev${NC}"
echo ""
echo "5. Test the API endpoints:"
echo "   ${YELLOW}curl -X GET http://localhost:3000/api/insights/quota \\${NC}"
echo "   ${YELLOW}  -H \"Authorization: Bearer YOUR_TOKEN\"${NC}"
echo ""
echo "📚 Documentation:"
echo "   - Full docs: ${YELLOW}src/lib/ai/README.md${NC}"
echo "   - Setup guide: ${YELLOW}src/lib/ai/SETUP.md${NC}"
echo "   - Implementation: ${YELLOW}AI_INSIGHTS_IMPLEMENTATION.md${NC}"
echo "   - Examples: ${YELLOW}src/lib/ai/example-component.tsx${NC}"
echo ""
echo -e "${GREEN}✨ Setup script complete!${NC}"

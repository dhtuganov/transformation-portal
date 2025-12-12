#!/bin/bash

echo "🔬 УГЛУБЛЕННЫЙ АНАЛИЗ OTRAR PORTAL"
echo "======================================"
echo ""

# Code metrics
echo "📊 CODE METRICS"
echo "---------------"
echo -n "Total TypeScript files: "
find src -name "*.ts" -o -name "*.tsx" | wc -l | xargs
echo -n "Total lines of code: "
find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1 | awk '{print $1}'
echo -n "Components count: "
find src/components -name "*.tsx" | wc -l | xargs
echo -n "Pages count: "
find src/app -name "page.tsx" | wc -l | xargs
echo -n "API routes: "
find src/app/api -name "route.ts" | wc -l | xargs
echo ""

# State management patterns
echo "🎯 STATE MANAGEMENT"
echo "-------------------"
echo -n "Components with useState: "
find src -name "*.tsx" -exec grep -l "useState" {} \; | wc -l | xargs
echo -n "Components with useEffect: "
find src -name "*.tsx" -exec grep -l "useEffect" {} \; | wc -l | xargs
echo -n "Components with useRef: "
find src -name "*.tsx" -exec grep -l "useRef" {} \; | wc -l | xargs
echo ""

# Database interactions
echo "💾 DATABASE PATTERNS"
echo "--------------------"
echo -n "Supabase client calls: "
find src -name "*.tsx" -o -name "*.ts" | xargs grep -o "createClient()" | wc -l | xargs
echo -n "Database queries (.from): "
find src -name "*.tsx" -o -name "*.ts" | xargs grep -o "\.from(" | wc -l | xargs
echo -n "Database indexes: "
grep -r "CREATE INDEX" supabase/migrations/*.sql 2>/dev/null | wc -l | xargs
echo -n "RLS policies: "
grep -r "CREATE POLICY" supabase/migrations/*.sql 2>/dev/null | wc -l | xargs
echo ""

# Debug artifacts
echo "🐛 DEBUG ARTIFACTS"
echo "------------------"
echo -n "console.log statements: "
find src -name "*.tsx" -o -name "*.ts" | xargs grep -o "console\.log" | wc -l | xargs
echo -n "console.error statements: "
find src -name "*.tsx" -o -name "*.ts" | xargs grep -o "console\.error" | wc -l | xargs
echo -n "debugger statements: "
find src -name "*.tsx" -o -name "*.ts" | xargs grep -o "debugger" | wc -l | xargs
echo -n "TODO comments: "
find src -name "*.tsx" -o -name "*.ts" | xargs grep -o "TODO" | wc -l | xargs
echo -n "FIXME comments: "
find src -name "*.tsx" -o -name "*.ts" | xargs grep -o "FIXME" | wc -l | xargs
echo ""

# Import patterns
echo "📦 IMPORT ANALYSIS"
echo "------------------"
echo -n "Relative imports (../): "
find src -name "*.tsx" -o -name "*.ts" | xargs grep -o "from '\.\." | wc -l | xargs
echo -n "Absolute imports (@/): "
find src -name "*.tsx" -o -name "*.ts" | xargs grep -o "from '@/" | wc -l | xargs
echo ""

# Type safety
echo "🛡️  TYPE SAFETY"
echo "---------------"
echo -n "any type usage: "
find src -name "*.tsx" -o -name "*.ts" | xargs grep -o ": any" | wc -l | xargs
echo -n "Type assertions (as): "
find src -name "*.tsx" -o -name "*.ts" | xargs grep -o " as " | wc -l | xargs
echo -n "Non-null assertions (!): "
find src -name "*.tsx" -o -name "*.ts" | xargs grep -o "\!" | wc -l | xargs
echo ""

# Performance patterns
echo "⚡ PERFORMANCE INDICATORS"
echo "------------------------"
echo -n "useMemo usage: "
find src -name "*.tsx" | xargs grep -o "useMemo" | wc -l | xargs
echo -n "useCallback usage: "
find src -name "*.tsx" | xargs grep -o "useCallback" | wc -l | xargs
echo -n "React.memo usage: "
find src -name "*.tsx" | xargs grep -o "React\.memo\|memo(" | wc -l | xargs
echo -n "Dynamic imports: "
find src -name "*.tsx" -o -name "*.ts" | xargs grep -o "dynamic(" | wc -l | xargs
echo ""

# Security patterns
echo "🔒 SECURITY CHECKS"
echo "------------------"
echo -n "Auth checks (auth.getUser): "
find src -name "*.tsx" -o -name "*.ts" | xargs grep -o "auth\.getUser" | wc -l | xargs
echo -n "RLS enabled tables: "
grep -r "ENABLE ROW LEVEL SECURITY" supabase/migrations/*.sql 2>/dev/null | wc -l | xargs
echo -n "Environment variables: "
grep -o "process\.env\." src/**/*.{ts,tsx} 2>/dev/null | wc -l | xargs
echo ""

echo "✅ Analysis Complete"
echo ""
echo "📝 Recommendations will be in the final report"

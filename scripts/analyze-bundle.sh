#!/bin/bash

# Bundle Size Analysis Script for Otrar Portal

echo "🔍 Analyzing Next.js Bundle Size..."
echo "======================================"

# Check if .next exists
if [ ! -d ".next" ]; then
  echo "❌ .next directory not found. Run 'npm run build' first."
  exit 1
fi

# Static bundle size
echo ""
echo "📦 Static Bundle Size:"
du -sh .next/static

# Server bundle size
echo ""
echo "🖥️  Server Bundle Size:"
du -sh .next/server

# Total build size
echo ""
echo "📊 Total Build Size:"
du -sh .next

# Largest static chunks
echo ""
echo "📈 Largest Static Chunks (Top 10):"
find .next/static/chunks -name "*.js" -exec du -h {} + | sort -hr | head -10

# Count of pages
echo ""
echo "📄 Pages Generated:"
find .next/server/app -name "*.html" -o -name "*.rsc" | wc -l | xargs echo "Total pages:"

echo ""
echo "✅ Analysis Complete"

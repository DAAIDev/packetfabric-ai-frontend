#!/bin/bash
# Verification script for Cloud Run deployment setup

echo "=================================="
echo "DEPLOYMENT SETUP VERIFICATION"
echo "=================================="
echo ""

# Check files
FILES=(
  "Dockerfile"
  ".dockerignore"
  ".env.production.example"
  ".github/workflows/deploy-staging.yml"
  ".github/workflows/deploy-production.yml"
  "app/api/health/route.ts"
  "DEPLOYMENT.md"
)

echo "✓ Checking required files..."
MISSING=0
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file"
  else
    echo "  ✗ MISSING: $file"
    MISSING=1
  fi
done

echo ""

# Check Next.js config
echo "✓ Checking Next.js configuration..."
if grep -q "output.*standalone" next.config.js 2>/dev/null; then
  echo "  ✓ Standalone output configured in next.config.js"
else
  echo "  ⚠ WARNING: next.config.js should have output: 'standalone'"
fi

echo ""

# Check Dockerfile port
echo "✓ Checking Dockerfile configuration..."
if grep -q "PORT 8080" Dockerfile; then
  echo "  ✓ Port 8080 configured (Cloud Run standard)"
else
  echo "  ⚠ WARNING: Dockerfile should expose port 8080"
fi

echo ""

# Check for git
echo "✓ Checking git status..."
if [ -d ".git" ]; then
  echo "  ✓ Git repository initialized"
  BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
  echo "  ✓ Current branch: $BRANCH"
else
  echo "  ✗ Not a git repository"
fi

echo ""

# Check for required tools
echo "✓ Checking required tools..."
command -v docker >/dev/null 2>&1 && echo "  ✓ Docker installed" || echo "  ✗ Docker NOT installed"
command -v gcloud >/dev/null 2>&1 && echo "  ✓ gcloud CLI installed" || echo "  ⚠ gcloud CLI NOT installed (brew install google-cloud-sdk)"
command -v gh >/dev/null 2>&1 && echo "  ✓ GitHub CLI installed" || echo "  ⚠ GitHub CLI NOT installed (optional: brew install gh)"

echo ""
echo "=================================="
if [ $MISSING -eq 0 ]; then
  echo "✅ ALL DEPLOYMENT FILES PRESENT"
else
  echo "❌ SOME FILES ARE MISSING"
fi
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Review DEPLOYMENT.md for setup instructions"
echo "2. Install gcloud CLI if not present"
echo "3. Set up GCP project and secrets"
echo "4. Add GitHub secrets (GCP_PROJECT_ID, GCP_SA_KEY)"
echo "5. Commit and push to trigger staging deployment"
echo ""

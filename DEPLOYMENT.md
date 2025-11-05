# Cloud Run Deployment Guide

Quick guide for deploying the Next.js frontend to Google Cloud Run.

## Quick Start

### 1. Prerequisites

```bash
# Install gcloud CLI (macOS)
brew install google-cloud-sdk

# Login and set project
gcloud auth login
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID
```

### 2. Enable APIs & Create Repository

```bash
# Enable required APIs
gcloud services enable run.googleapis.com artifactregistry.googleapis.com \
  cloudbuild.googleapis.com secretmanager.googleapis.com

# Create Artifact Registry
gcloud artifacts repositories create packetfabric \
  --repository-format=docker \
  --location=us-central1
```

### 3. Create Service Account for GitHub Actions

```bash
# Create service account
gcloud iam service-accounts create github-actions-deployer \
  --display-name="GitHub Actions Deployer"

# Grant permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Create key
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com
```

### 4. Create Secrets in Secret Manager

```bash
# Staging secrets
echo -n "https://your-staging-backend.com" | \
  gcloud secrets create PFAPI_URL_STAGING --data-file=-

echo -n "https://your-n8n-staging.com/webhook/ask" | \
  gcloud secrets create N8N_WEBHOOK_URL_STAGING --data-file=-

echo -n "$(openssl rand -base64 32)" | \
  gcloud secrets create SESSION_SECRET_STAGING --data-file=-

# Production secrets
echo -n "https://your-production-backend.com" | \
  gcloud secrets create PFAPI_URL_PRODUCTION --data-file=-

echo -n "https://your-n8n-production.com/webhook/ask" | \
  gcloud secrets create N8N_WEBHOOK_URL_PRODUCTION --data-file=-

echo -n "$(openssl rand -base64 32)" | \
  gcloud secrets create SESSION_SECRET_PRODUCTION --data-file=-

# Grant Cloud Run access to secrets
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')

for SECRET in PFAPI_URL_STAGING N8N_WEBHOOK_URL_STAGING SESSION_SECRET_STAGING \
              PFAPI_URL_PRODUCTION N8N_WEBHOOK_URL_PRODUCTION SESSION_SECRET_PRODUCTION; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
done
```

### 5. Add GitHub Secrets

Go to GitHub repo → Settings → Secrets and variables → Actions:

- `GCP_PROJECT_ID`: Your GCP project ID
- `GCP_SA_KEY`: Contents of `github-actions-key.json`

```bash
# Or use GitHub CLI
gh secret set GCP_PROJECT_ID --body "$PROJECT_ID"
gh secret set GCP_SA_KEY < github-actions-key.json
```

### 6. Deploy

**Staging (automatic on push to main):**
```bash
git push origin main
```

**Production (manual):**
```bash
# Via GitHub UI: Actions → Deploy to Cloud Run (Production) → Run workflow
# Or via CLI:
gh workflow run deploy-production.yml
```

## Manual Deploy (Quick Test)

```bash
gcloud run deploy packetfabric-frontend-staging \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --set-env-vars "NODE_ENV=production,NEXT_PUBLIC_APP_ENV=staging" \
  --set-secrets "PFAPI_URL=PFAPI_URL_STAGING:latest,N8N_WEBHOOK_URL=N8N_WEBHOOK_URL_STAGING:latest,SESSION_SECRET=SESSION_SECRET_STAGING:latest"
```

## Testing

```bash
# Get URL
STAGING_URL=$(gcloud run services describe packetfabric-frontend-staging \
  --region us-central1 --format 'value(status.url)')

# Test health
curl $STAGING_URL/api/health

# View logs
gcloud run services logs tail packetfabric-frontend-staging --region us-central1
```

## Production Traffic Management

```bash
# Deploy new version (0% traffic)
gh workflow run deploy-production.yml

# Switch traffic to new revision
gcloud run services update-traffic packetfabric-frontend-production \
  --region us-central1 \
  --to-latest

# Rollback if needed
gcloud run services update-traffic packetfabric-frontend-production \
  --region us-central1 \
  --to-revisions=PREVIOUS_REVISION=100
```

## Troubleshooting

**Build fails:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Secrets not working:**
```bash
gcloud secrets versions access latest --secret="PFAPI_URL_STAGING"
```

**View errors:**
```bash
gcloud run services logs read packetfabric-frontend-staging \
  --region us-central1 --filter="severity=ERROR" --limit 50
```

## Files Created

- `Dockerfile` - Multi-stage Next.js build for Cloud Run (port 8080)
- `.dockerignore` - Optimized build context
- `.github/workflows/deploy-staging.yml` - Auto-deploy on push to main
- `.github/workflows/deploy-production.yml` - Manual production deploy
- `.env.production.example` - Environment variable template
- `app/api/health/route.ts` - Health check endpoint

## Architecture

**Staging:** Auto-deploys from `main` branch
- URL: `https://packetfabric-frontend-staging-xxxxx-uc.a.run.app`
- Config: 512Mi RAM, 1 CPU, min 0 instances

**Production:** Manual deploy with traffic control
- URL: `https://packetfabric-frontend-production-xxxxx-uc.a.run.app`
- Config: 1Gi RAM, 2 CPU, min 1 instance (no cold starts)
- Strategy: Deploy → Test → Switch traffic

## Cost Estimate

- Staging: ~$5-10/month
- Production: ~$20-50/month + usage
- Free tier: 2M requests/month


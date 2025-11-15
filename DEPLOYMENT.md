# Deployment Guide - Vercel

## Pre-Deployment Checklist

- ✅ All demo mode removed
- ✅ Production configurations set
- ✅ Security headers configured
- ✅ Health check endpoint ready
- ✅ Environment variables documented

## Deploy to Vercel

### Option 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Option 2: Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your Git repository
4. Configure as follows:

**Framework Preset:** Next.js
**Root Directory:** ./
**Build Command:** `npm run build`
**Output Directory:** `.next` (auto-detected)
**Install Command:** `npm install`

## Environment Variables (Optional)

All environment variables have sensible defaults, but you can customize:

### Required: NONE
The app works with defaults - users provide API keys via login screen.

### Optional Production Variables:

```bash
# API Configuration (defaults provided)
NEXT_PUBLIC_RESOVA_API_URL=https://api.resova.io/v1
NEXT_PUBLIC_CLAUDE_MODEL=claude-sonnet-4-20250514

# Application Info
NEXT_PUBLIC_APP_NAME=Resova Intelligence
NEXT_PUBLIC_APP_VERSION=1.0.2

# Performance Tuning
NEXT_PUBLIC_MAX_CONVERSATION_HISTORY=10
NEXT_PUBLIC_RATE_LIMIT_MAX=100

# Monitoring (add when ready)
# NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn-here

# Debug Mode (keep false for production)
NEXT_PUBLIC_DEBUG=false
```

### How to Add Environment Variables in Vercel:

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add variables one by one
4. Choose environment: Production, Preview, or Development
5. Click **Save**

## Post-Deployment Testing

### 1. Health Check

```bash
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.2",
  "environment": "production",
  "services": {
    "resova": { "configured": true, "baseUrl": "..." },
    "claude": { "configured": true, "model": "..." }
  },
  "features": { "analytics": true, "chatAssistant": true }
}
```

### 2. Test Authentication

1. Go to https://your-app.vercel.app
2. Click "Get Started"
3. Enter **valid** Resova API credentials:
   - Resova API Key
   - Select region (US/EU/IO)
   - Claude API Key
4. Should successfully log in and load dashboard

### 3. Test Analytics

- Verify dashboard loads with real data
- Check Period Summary calculations
- Verify charts render correctly
- Test date range selection

### 4. Test AI Assistant

- Navigate to "Venue Performance" tab
- Send a test message to AI
- Verify Claude responds correctly
- Test suggested questions

## Security Verification

### Check Security Headers

```bash
curl -I https://your-app.vercel.app
```

Should see:
- `Strict-Transport-Security`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `X-XSS-Protection`
- `Referrer-Policy`

### Verify No Demo Mode

- ❌ No demo mode button on login
- ✅ All API keys required
- ✅ No fallback to demo data

## Monitoring Setup (Optional)

### Add Sentry for Error Tracking

1. Create Sentry account at https://sentry.io
2. Get your DSN
3. Add to Vercel environment variables:
   ```
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
   ```
4. Redeploy

### Vercel Analytics (Built-in)

Vercel automatically provides:
- Page load performance
- Core Web Vitals
- User analytics

Access via: **Dashboard** > **Analytics**

## Troubleshooting

### Build Fails

**Issue:** TypeScript errors during build

**Solution:**
```bash
# Run locally first
npm run build

# Fix any errors shown
# Then redeploy
```

### 500 Errors on Production

**Issue:** "Invalid API credentials" on valid keys

**Solution:**
1. Check environment variables are set correctly
2. Verify API URLs don't have trailing slashes
3. Test health check endpoint
4. Check Vercel function logs

### Health Check Fails

**Issue:** `/api/health` returns unhealthy

**Solution:**
1. Check environment variable validation
2. Verify all required configs are present
3. Review Vercel function logs

## Performance Optimization

### Vercel Automatically Provides:

- ✅ Global CDN
- ✅ Automatic SSL/HTTPS
- ✅ DDoS protection
- ✅ Image optimization
- ✅ Edge caching
- ✅ Serverless functions

### Additional Optimizations:

1. **Enable Vercel Speed Insights** (free tier)
2. **Set up custom domain** for better SEO
3. **Configure caching** via headers (already done)

## Rollback Plan

If issues occur in production:

```bash
# Rollback to previous deployment
vercel rollback
```

Or use Vercel Dashboard:
1. Go to **Deployments**
2. Find previous working deployment
3. Click **•••** > **Promote to Production**

## Custom Domain Setup (Optional)

1. Go to **Settings** > **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

## Scaling

Vercel automatically scales based on usage. For high traffic:

1. **Hobby Plan** (free): Good for testing and low traffic
2. **Pro Plan** ($20/month): Recommended for production
   - Higher function execution limits
   - More build minutes
   - Priority support

## Support

**Vercel Issues:**
- Docs: https://vercel.com/docs
- Support: support@vercel.com

**Application Issues:**
- Health Check: `GET /api/health`
- Check browser console for errors
- Review Vercel function logs

## Success Criteria

✅ Health check returns "healthy"
✅ Login works with valid credentials
✅ Dashboard loads with real data
✅ AI assistant responds correctly
✅ No console errors
✅ Security headers present
✅ Page loads in <3 seconds

## Next Steps After Deployment

1. ✅ Test thoroughly with real Resova account
2. ✅ Monitor Vercel analytics for errors
3. ✅ Set up custom domain (optional)
4. ✅ Enable Sentry monitoring (optional)
5. ✅ Share with beta users for feedback
6. ✅ Monitor API usage and costs

---

**Deployment Date:** [Add date when deployed]
**Version:** 1.0.2 (Production Ready)
**Status:** Ready for Production ✅

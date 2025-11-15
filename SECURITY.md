# Security Policy

## Overview

Resova Intelligence is built with security as a top priority. This document outlines our security measures, best practices, and vulnerability reporting procedures.

## Security Features

### 1. API Key Management

#### Client-Side Storage Only
- **Resova API Keys** are stored exclusively in browser `localStorage`
- **Claude API Keys** are stored exclusively in browser `localStorage`
- Keys are **NEVER** transmitted to or stored on our servers
- Keys are only sent directly to Resova and Anthropic APIs over HTTPS

#### Key Validation
```typescript
// Keys are validated before storage
const login = async (credentials: Credentials) => {
  // Test API call to validate credentials
  const testService = createAnalyticsService(credentials);
  await testService.getAnalytics(); // Throws if invalid

  // Only stored if validation succeeds
  localStorage.setItem('credentials', JSON.stringify(credentials));
};
```

#### Key Lifecycle
- **Input**: User enters keys via login form
- **Validation**: Test API call to Resova validates keys
- **Storage**: Stored in browser localStorage (encrypted by browser)
- **Usage**: Only sent to Resova/Anthropic APIs
- **Deletion**: Cleared on logout or browser data clear

### 2. Authentication & Authorization

#### Production-Only Mode
- ❌ **No demo mode** in production
- ✅ Valid API credentials required for all access
- ✅ Credentials validated on every login attempt
- ✅ Failed validation prevents access

#### Session Management
- Session state managed client-side via React Context
- No server-side sessions or cookies
- Logout clears all credentials from localStorage
- Auto-logout on browser close (localStorage cleared)

### 3. Security Headers

All HTTP responses include comprehensive security headers:

#### Strict-Transport-Security (HSTS)
```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```
- Forces HTTPS for 2 years
- Includes all subdomains
- Eligible for HSTS preload list

#### X-Frame-Options
```
X-Frame-Options: SAMEORIGIN
```
- Prevents clickjacking attacks
- Only allows embedding from same origin

#### X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```
- Prevents MIME-type sniffing
- Enforces declared content types

#### X-XSS-Protection
```
X-XSS-Protection: 1; mode=block
```
- Enables browser XSS filters
- Blocks rendering on XSS detection

#### Referrer-Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```
- Limits referrer information leakage
- Full URL only for same-origin requests

#### Permissions-Policy
```
Permissions-Policy: camera=(), microphone=(), geolocation=()
```
- Disables unnecessary browser features
- Reduces attack surface

#### Cache-Control (API Routes)
```
Cache-Control: no-store, must-revalidate
```
- Prevents caching of sensitive data
- Forces fresh API calls

### 4. Network Security

#### HTTPS Only
- All production traffic over HTTPS (enforced by Vercel)
- TLS 1.2+ required
- Strong cipher suites only

#### API Communication
```typescript
// All API calls use HTTPS
const response = await fetch('https://api.resova.io/v1/...', {
  headers: {
    'X-API-KEY': credentials.resovaApiKey, // Sent securely
    'Content-Type': 'application/json'
  }
});
```

#### No Server-Side Secrets
- No `.env` files with secrets in production
- All secrets provided by users via UI
- Configuration uses defaults (no sensitive data)

### 5. Data Protection

#### Data Flow
```
User Browser → Resova API (Direct, HTTPS)
User Browser → Claude API (Direct, HTTPS)
User Browser ← Next.js Server (UI only, no data storage)
```

#### No Data Persistence
- ❌ No database
- ❌ No server-side storage
- ❌ No logs with sensitive data
- ✅ All data ephemeral (in-memory only)

#### Data Transmission
- API keys transmitted only to respective APIs
- Analytics data fetched directly from Resova
- Chat data sent directly to Claude
- Server acts as proxy only (no inspection/storage)

### 6. Input Validation

#### API Routes
```typescript
// All inputs validated
export async function POST(request: NextRequest) {
  const { credentials, dateRange } = await request.json();

  // Validate required fields
  if (!credentials) {
    return NextResponse.json(
      { error: 'Credentials required' },
      { status: 400 }
    );
  }

  // Validate format
  if (!credentials.resovaApiKey?.trim()) {
    return NextResponse.json(
      { error: 'Invalid API key format' },
      { status: 400 }
    );
  }

  // Process only after validation
  const service = createAnalyticsService(credentials);
  // ...
}
```

#### User Inputs
- All form inputs sanitized
- XSS prevention via React's automatic escaping
- No `dangerouslySetInnerHTML` used
- URL parameters validated

### 7. Dependency Security

#### Regular Updates
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

#### Production Dependencies
- Minimal dependency tree
- Only trusted packages from npm
- Regular security updates
- No deprecated packages

#### Key Dependencies
```json
{
  "next": "16.0.1",          // Official Next.js
  "react": "19.0.0",         // Official React
  "@anthropic-ai/sdk": "^0.32.1" // Official Claude SDK
}
```

### 8. Error Handling

#### No Sensitive Data in Errors
```typescript
try {
  await api.call();
} catch (error) {
  // Generic error shown to user
  return { error: 'Failed to fetch data' };

  // Detailed error logged server-side only
  logger.error('API Error', {
    message: error.message,
    // No credentials logged
  });
}
```

#### Error Boundaries
- React Error Boundaries prevent app crashes
- Graceful fallbacks for component errors
- User-friendly error messages

### 9. Rate Limiting

#### Configuration
```typescript
// Default rate limits
rateLimit: {
  maxRequests: 100,        // per window
  windowMs: 60000          // 1 minute
}
```

#### Resova API Limits
- Respects Resova's 100 req/min limit
- Client-side throttling prevents overload
- Exponential backoff on rate limit errors

### 10. Monitoring & Logging

#### Health Check
```bash
GET /api/health

Response:
{
  "status": "healthy",
  "version": "1.0.2",
  "services": {
    "resova": { "configured": true },
    "claude": { "configured": true }
  }
}
```

#### Production Logging
```typescript
// Only non-sensitive data logged
logger.info('User logged in');           // ✅ OK
logger.info('Analytics fetched');        // ✅ OK
logger.error('API call failed', error);  // ✅ OK

// NEVER logged
logger.info('API Key:', key);            // ❌ NEVER
logger.info('User data:', data);         // ❌ NEVER
```

#### Sentry Integration (Optional)
```typescript
// Error monitoring without sensitive data
Sentry.captureException(error, {
  tags: { component: 'Dashboard' },
  // No user data, no API keys
});
```

## Security Best Practices

### For Users

1. **API Key Security**
   - Never share your API keys
   - Use unique keys per application
   - Rotate keys regularly
   - Revoke keys if compromised

2. **Browser Security**
   - Use latest browser version
   - Enable automatic updates
   - Clear cache/localStorage periodically
   - Use private browsing for sensitive sessions

3. **Network Security**
   - Use trusted networks only
   - Avoid public WiFi for sensitive data
   - Use VPN when on untrusted networks
   - Verify HTTPS before entering credentials

### For Developers

1. **Code Security**
   - Never commit API keys to git
   - Use environment variables for config
   - Validate all user inputs
   - Sanitize data before display
   - Keep dependencies updated

2. **Deployment Security**
   - Use Vercel's security features
   - Enable automatic deployments
   - Test security headers after deploy
   - Monitor Vercel function logs

3. **Development Security**
   - Use separate API keys for development
   - Never use production keys locally
   - Clear localStorage between tests
   - Review security headers regularly

## Vulnerability Reporting

### Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **DO NOT** create a public GitHub issue
2. **DO NOT** disclose publicly until patched
3. **DO** email: [security@yourdomain.com]
4. **DO** include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **24 hours**: Initial acknowledgment
- **7 days**: Vulnerability assessment
- **30 days**: Fix deployed (for confirmed issues)
- **After fix**: Public disclosure (with credit)

### Scope

**In Scope:**
- Authentication/authorization bypass
- API key exposure
- XSS vulnerabilities
- CSRF vulnerabilities
- SQL injection (if database added)
- Data leakage
- Security header misconfiguration

**Out of Scope:**
- Social engineering
- Physical attacks
- DDoS attacks
- Rate limiting (by design)
- Browser vulnerabilities
- Third-party service vulnerabilities (Resova, Claude)

## Compliance

### GDPR Compliance

- ✅ No personal data collected
- ✅ No cookies used
- ✅ No tracking
- ✅ User controls all data
- ✅ Data deleted on logout

### Data Residency

- API keys stored in user's browser (user's jurisdiction)
- No server-side data storage
- API calls to Resova (user's chosen region: US/EU/IO)
- API calls to Claude (Anthropic's infrastructure)

## Security Checklist for Deployment

Before deploying to production:

- [ ] All demo mode removed
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] Health check endpoint working
- [ ] No API keys in code
- [ ] No console.logs with sensitive data
- [ ] Dependencies up to date (`npm audit`)
- [ ] Environment variables documented
- [ ] Error messages user-friendly (no stack traces)
- [ ] Rate limiting configured
- [ ] Monitoring enabled (optional)
- [ ] Security documentation reviewed

## Security Updates

### Current Version: 1.0.2 (Production Ready)

**Security Enhancements:**
- ✅ Removed demo mode (v1.0.2)
- ✅ Added security headers (v1.0.2)
- ✅ Client-side only authentication (v1.0.0)
- ✅ No server-side data storage (v1.0.0)

**Known Issues:**
- None currently

**Planned Improvements:**
- Add Content Security Policy (CSP)
- Implement Subresource Integrity (SRI)
- Add API request signing
- Implement session timeout

## Additional Resources

### Security Tools

```bash
# Audit dependencies
npm audit

# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Check bundle size
npm run build
```

### Security Testing

```bash
# Test security headers
curl -I https://your-app.vercel.app

# Test health check
curl https://your-app.vercel.app/api/health

# Test HTTPS redirect
curl http://your-app.vercel.app
```

### External Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Vercel Security](https://vercel.com/docs/security)
- [React Security](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)

## Contact

**Security Team:** [security@yourdomain.com]
**General Support:** [support@yourdomain.com]
**Documentation:** https://github.com/yourusername/resova-ai-analytics

---

**Last Updated:** January 6, 2025
**Version:** 1.0.2
**Status:** Production Ready ✅

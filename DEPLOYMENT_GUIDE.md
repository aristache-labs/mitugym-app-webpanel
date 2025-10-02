# MituGym Web Panel - Vercel Deployment Guide

## 🚀 Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/mitugym-app-webpanel)

## 📋 Prerequisites

Before deploying, ensure you have:

1. ✅ **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. ✅ **Supabase Project** - Your database is already set up
3. ✅ **GitHub Repository** (recommended) - For automatic deployments
4. ✅ **Environment Variables** - Listed below

## 🔧 Step-by-Step Deployment

### Step 1: Install Vercel CLI (Optional but Recommended)

```powershell
npm install -g vercel
```

### Step 2: Prepare Environment Variables

You'll need these environment variables from your Supabase project:

| Variable | Where to Find | Description |
|----------|---------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API | Public anon key (safe for client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API | Service role key (⚠️ Keep secret!) |
| `CHECKIN_API_KEY` | Generate yourself | Secure random key for API |

**Generate CHECKIN_API_KEY:**
```powershell
# PowerShell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[BitConverter]::ToString($bytes).Replace('-','').ToLower()
```

### Step 3: Deploy via Vercel CLI

```powershell
# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - What's your project's name? mitugym-app-webpanel
# - In which directory is your code located? ./
# - Want to override settings? N
```

### Step 4: Add Environment Variables

#### Via Vercel Dashboard:

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project → **Settings** → **Environment Variables**
3. Add each variable:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://amgzzlnvrrqtleicgenq.supabase.co`
   - Environment: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**
4. Repeat for all variables listed in Step 2

#### Via Vercel CLI:

```powershell
# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste your value when prompted

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add CHECKIN_API_KEY
```

### Step 5: Deploy to Production

```powershell
# Deploy to production
vercel --prod
```

Your app will be live at: `https://mitugym-app-webpanel.vercel.app`

## 🔄 Alternative: Deploy via GitHub

### 1. Push to GitHub

```powershell
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit - MituGym Web Panel"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/mitugym-app-webpanel.git
git branch -M main
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select your GitHub repository
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** .next
5. Add environment variables (see Step 4 above)
6. Click **Deploy**

### 3. Automatic Deployments

Now every push to `main` will automatically deploy to production! 🎉

## 🔒 Security Checklist

Before going live:

- [ ] ✅ All environment variables are set correctly
- [ ] ✅ `SUPABASE_SERVICE_ROLE_KEY` is kept secret (not in client code)
- [ ] ✅ Supabase RLS (Row Level Security) policies are enabled
- [ ] ✅ API rate limiting is configured
- [ ] ✅ TOTP secrets are properly stored in database
- [ ] ✅ CORS settings are configured if needed
- [ ] ✅ Strong passwords for admin accounts
- [ ] ✅ Test all features in production

## 📊 Post-Deployment Verification

### 1. Test Authentication

1. Go to `https://your-app.vercel.app/login`
2. Try logging in with a test account
3. Verify dashboard loads correctly

### 2. Test API Endpoints

```powershell
# Test verification API
Invoke-RestMethod -Uri "https://your-app.vercel.app/api/checkin/verify" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"qr_code":"test-member-id","api_key":"YOUR_CHECKIN_API_KEY"}'
```

### 3. Test TOTP System

```powershell
# Test TOTP setup
Invoke-RestMethod -Uri "https://your-app.vercel.app/api/member/totp-setup/MEMBER_ID?api_key=YOUR_CHECKIN_API_KEY" `
  -Method GET
```

### 4. Check Logs

- Go to Vercel Dashboard → Your Project → **Deployments**
- Click on latest deployment → **View Function Logs**
- Monitor for any errors

## ⚙️ Configuration

### Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your custom domain (e.g., `admin.mitugym.com`)
3. Follow DNS configuration instructions
4. Update Supabase redirect URLs if using authentication

### Environment-Specific Variables

You can set different values for Production, Preview, and Development:

- **Production:** Live environment
- **Preview:** GitHub pull requests / branches
- **Development:** Local development

### Build Settings

Default settings work great, but you can customize in `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

## 🔄 Updates and Redeployment

### Manual Redeployment

```powershell
# Redeploy current version
vercel --prod
```

### Automatic (with GitHub)

Just push to your repository:

```powershell
git add .
git commit -m "Update feature"
git push origin main
```

Vercel will automatically build and deploy! 🚀

## 🐛 Troubleshooting

### Build Failures

**Issue:** Build fails with "Module not found"
- **Solution:** Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Issue:** TypeScript errors during build
- **Solution:** Run `npm run lint` and fix errors
- Check `tsconfig.json` is properly configured

### Runtime Errors

**Issue:** 500 Internal Server Error
- **Check:** Environment variables are set correctly
- **Check:** Supabase credentials are valid
- **View:** Function logs in Vercel Dashboard

**Issue:** API endpoints return 404
- **Check:** Middleware.ts is properly configured
- **Check:** API routes are in correct directory structure

### Environment Variables Not Working

**Issue:** App can't connect to Supabase
- **Check:** Variables are set for correct environment (Production/Preview/Dev)
- **Check:** No typos in variable names
- **Check:** Redeploy after adding variables

**Solution:**
```powershell
# Trigger new deployment to pick up env changes
vercel --prod --force
```

## 📱 Mobile App Integration

After deployment, update your React Native app with the production URL:

```typescript
// In your mobile app config
const API_BASE_URL = 'https://mitugym-app-webpanel.vercel.app';

// Test endpoints
const CHECKIN_API = `${API_BASE_URL}/api/checkin`;
const VERIFY_API = `${API_BASE_URL}/api/checkin/verify`;
const TOTP_SETUP_API = `${API_BASE_URL}/api/member/totp-setup`;
```

## 📊 Monitoring

### Vercel Analytics

Enable analytics in your project settings to track:
- Page views
- API response times
- Error rates
- Geographic distribution

### Supabase Monitoring

Monitor database performance:
- Query performance
- API usage
- Storage usage
- Active connections

## 💰 Pricing

### Vercel Free Tier Includes:

- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ HTTPS/SSL included
- ✅ Automatic CI/CD
- ✅ Preview deployments
- ✅ Analytics (basic)

**Upgrade when needed:**
- Pro: $20/month (team features, more bandwidth)
- Enterprise: Custom pricing

### Cost Optimization

- Use Edge Functions sparingly
- Optimize images (already configured)
- Enable caching where appropriate
- Monitor bandwidth usage

## 🎯 Production Checklist

Before announcing to users:

- [ ] ✅ All features tested in production
- [ ] ✅ Mobile app connected and tested
- [ ] ✅ Custom domain configured (if applicable)
- [ ] ✅ SSL certificate active (automatic with Vercel)
- [ ] ✅ Backup strategy in place (Supabase handles this)
- [ ] ✅ Monitoring and alerts configured
- [ ] ✅ Error tracking set up
- [ ] ✅ Documentation updated with production URLs
- [ ] ✅ Team members have access to Vercel project
- [ ] ✅ Support process defined for issues

## 📞 Support

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)

## 🎉 Success!

Your MituGym Web Panel is now live! 🚀

**Next Steps:**
1. Test all features thoroughly
2. Update mobile app with production URL
3. Monitor logs for first few days
4. Gather user feedback
5. Iterate and improve

---

**Last Updated:** October 2, 2025  
**Version:** 1.0.0  
**Deployment Platform:** Vercel


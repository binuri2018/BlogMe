# Deployment Checklist

This document provides a step-by-step checklist for deploying Blog Me to production.

## Pre-Deployment Checklist

### ✅ Environment Variables
- [ ] Create `.env` file from `.env.example`
- [ ] Fill in all Firebase configuration values:
  - `REACT_APP_FIREBASE_API_KEY`
  - `REACT_APP_FIREBASE_AUTH_DOMAIN`
  - `REACT_APP_FIREBASE_PROJECT_ID`
  - `REACT_APP_FIREBASE_STORAGE_BUCKET`
  - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
  - `REACT_APP_FIREBASE_APP_ID`

### ✅ Firebase Setup
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore Database configured
- [ ] Storage configured for blog images
- [ ] Firebase Security Rules configured
- [ ] CORS settings updated for production domain (if needed)

### ✅ Code Quality
- [ ] All environment variables moved to `.env` (no hardcoded keys)
- [ ] Error boundaries implemented
- [ ] Build completes without errors: `npm run build`
- [ ] No console errors in production build

### ✅ Testing
- [ ] Test authentication flow
- [ ] Test blog creation and editing
- [ ] Test image uploads
- [ ] Test responsive design on mobile devices
- [ ] Test error handling

## Deployment Steps

### Option 1: Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Create React App

3. **Configure Environment Variables**
   - Go to Project Settings > Environment Variables
   - Add all `REACT_APP_FIREBASE_*` variables
   - Set for Production, Preview, and Development

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live!

### Option 2: Netlify

1. **Push to GitHub** (same as above)

2. **Import to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" > "Import an existing project"
   - Connect to GitHub and select your repository

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `build`
   - These should auto-detect from `netlify.toml`

4. **Add Environment Variables**
   - Go to Site Settings > Build & Deploy > Environment
   - Add all `REACT_APP_FIREBASE_*` variables

5. **Deploy**
   - Click "Deploy site"
   - Your app will be live!

### Option 3: Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login**
   ```bash
   firebase login
   ```

3. **Initialize Hosting**
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Public directory: `build`
   - Single-page app: Yes
   - Automatic builds: No (or Yes if using GitHub)

4. **Build and Deploy**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

## Post-Deployment Checklist

- [ ] Test the live site
- [ ] Verify authentication works
- [ ] Verify blog creation works
- [ ] Verify image uploads work
- [ ] Check mobile responsiveness
- [ ] Test error handling
- [ ] Update Firebase CORS settings if needed
- [ ] Set up custom domain (optional)
- [ ] Configure SSL certificate (usually automatic)

## Troubleshooting

### Build Fails
- Check that all environment variables are set
- Verify Node.js version (should be 14+)
- Check for any TypeScript or linting errors

### Firebase Errors
- Verify all environment variables are correct
- Check Firebase Security Rules
- Verify CORS settings in Firebase Console

### Routing Issues (404 on refresh)
- Verify `vercel.json` or `netlify.toml` has proper redirects
- For Firebase Hosting, ensure `firebase.json` has rewrite rules

### Environment Variables Not Working
- Ensure variables start with `REACT_APP_`
- Restart development server after adding variables
- For production, add variables in hosting platform dashboard

## Security Notes

- ✅ Never commit `.env` file to Git
- ✅ Use different Firebase projects for dev/staging/production
- ✅ Review Firebase Security Rules before going live
- ✅ Enable Firebase App Check for additional security
- ✅ Monitor Firebase usage and set up billing alerts

## Performance Optimization

- ✅ Production build is minified and optimized
- ✅ Static assets are cached properly
- ✅ Images should be optimized before upload
- ✅ Consider implementing lazy loading for blog posts
- ✅ Monitor bundle size and optimize if needed



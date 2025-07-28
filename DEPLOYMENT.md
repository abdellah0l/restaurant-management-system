# 🚀 Deployment Guide

## 📋 Prerequisites
- GitHub account
- Railway account (free tier available)
- PostgreSQL database (Railway provides this)

## 🎯 Quick Deployment (Railway - Recommended)

### Step 1: Prepare Your Code
```bash
# Make sure all changes are committed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy Backend

1. **Go to [Railway Dashboard](https://railway.app/dashboard)**
2. **Click "New Project" → "Deploy from GitHub repo"**
3. **Select your repository**
4. **Set the root directory to `backend`**
5. **Add Environment Variables:**
   ```
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-domain.com
   ```

### Step 3: Deploy Database

1. **In Railway, click "New" → "Database" → "PostgreSQL"**
2. **Copy the connection string**
3. **Update your backend environment variables with the new DATABASE_URL**

### Step 4: Deploy Frontend

1. **Create another Railway project for frontend**
2. **Set root directory to project root (not backend)**
3. **Add Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-railway-url.com
   ```

### Step 5: Update CORS

Update your backend's `FRONTEND_URL` environment variable with your frontend URL.

## 🔧 Alternative Deployment Options

### Option 2: Render
- Similar to Railway
- Free tier available
- Good for static sites and APIs

### Option 3: Vercel (Frontend) + Railway (Backend)
- Vercel for frontend (excellent for React apps)
- Railway for backend and database

### Option 4: DigitalOcean App Platform
- More control
- Pay-as-you-go pricing
- Good for production apps

## 🛠️ Manual Deployment Steps

### Backend Deployment
```bash
cd backend
npm install
npm run build
npm start
```

### Frontend Deployment
```bash
npm install
npm run build
# Serve the dist folder
```

## 🔐 Security Checklist

- [ ] Use strong JWT secret
- [ ] Enable HTTPS
- [ ] Set proper CORS origins
- [ ] Use environment variables
- [ ] Enable database SSL
- [ ] Set up proper error handling

## 📊 Monitoring

- Set up health checks
- Monitor database connections
- Set up logging
- Monitor API response times

## 🚨 Troubleshooting

### Common Issues:
1. **CORS errors**: Check FRONTEND_URL environment variable
2. **Database connection**: Verify DATABASE_URL
3. **Build failures**: Check TypeScript compilation
4. **Port issues**: Ensure PORT environment variable is set

### Debug Commands:
```bash
# Check backend logs
railway logs

# Check database connection
railway connect

# Restart services
railway service restart
```

## 📞 Support

- Railway Documentation: https://docs.railway.app/
- Render Documentation: https://render.com/docs
- Vercel Documentation: https://vercel.com/docs 
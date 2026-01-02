# CFE Usage Metrics - Deployment Guide

## Overview
Full-stack application for CFE (Customer Facing Experience) usage metrics and analytics. Built with Node.js/Express backend and React/Vite frontend.

## Prerequisites
- **Node.js**: v18 or higher
- **PostgreSQL**: v12 or higher
- **Database**: `cfe_usage_metrics` with required stored procedures
- **Git**: For cloning the repository

## Project Structure
```
CFE Usage Metrics/
├── backend/           # Node.js/Express API server
│   ├── server.js     # Main server file
│   ├── .env          # Environment configuration
│   └── package.json  # Backend dependencies
├── frontend/         # React/Vite application
│   ├── src/
│   │   ├── components/  # React components
│   │   └── styles/      # CSS files
│   ├── package.json     # Frontend dependencies
│   └── vite.config.js   # Vite configuration
└── DEPLOYMENT.md     # This file
```

## Installation Steps

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "CFE Usage Metrics"
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Configure Environment Variables
Create/edit `backend/.env` file:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=cfe_usage_metrics

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

**Important**: Update `DB_USER` and `DB_PASSWORD` with your PostgreSQL credentials.

#### Database Requirements
The application requires these PostgreSQL stored procedures:
- `SP_CFE_Prod_Reports_CSR_Browse1(start_date, end_date)` - User Personas metrics
- `SP_CFE_Prod_Reports_Active_BO1(start_date, end_date)` - Back Office metrics
- Additional procedures for CSR metrics

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ../frontend
npm install
```

#### Verify Configuration
Check `frontend/vite.config.js` - proxy should point to backend:
```javascript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
}
```

## Running the Application

### Development Mode

#### Start Backend Server
```bash
cd backend
npm start
```
Backend will run on: **http://localhost:3001**

#### Start Frontend Dev Server (in new terminal)
```bash
cd frontend
npm run dev
```
Frontend will run on: **http://localhost:5173**

### Access the Application
Open your browser to: **http://localhost:5173**

## Features

### Dashboard
- Database statistics (size, table count, schema count)
- Table counts with search functionality
- Recent activity tracking

### Reports
1. **User Personas Metrics**
   - Consolidated summary panel with total personas, policies serviced, and averages
   - Sortable table with sticky header
   - Date range filtering
   - CSV export functionality

2. **CSR Metrics**
   - Client Services Representative activity tracking
   - Date range filtering
   - Export capabilities

3. **Back Office Metrics**
   - Back office user activity
   - Policy/customer service tracking
   - Date range filtering

## Recent Updates (2026-01-02)

### User Personas Report Improvements
- **Consolidated Summary Panel**: Replaced three separate stat cards with a single, modern summary panel
- **Enhanced Styling**: Professional gradient effects, hover animations, and responsive layout
- **Sticky Table Header**: Table header remains visible during scrolling for better usability
- **Improved UX**: Better visual hierarchy and data presentation

### Technical Changes
- Modified `UserPersonasMetrics.jsx` (lines 156-178) - New summary panel structure
- Added comprehensive CSS styling in `index.css` (lines 1208-1263)
- Maintained existing sticky table functionality

## Troubleshooting

### Browser Caching Issues
If changes don't appear after updates:

**Chrome/Firefox**:
1. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
2. Clear browser cache: Settings → Privacy → Clear browsing data
3. Disable cache in DevTools: Network tab → "Disable cache" checkbox

**Vite Cache**:
```bash
cd frontend
rm -rf node_modules/.vite dist .vite
npm run dev
```

### Port Conflicts
If ports 3001 or 5173 are in use:

**Kill processes**:
```bash
# Backend port
lsof -ti:3001 | xargs kill -9

# Frontend port
lsof -ti:5173 | xargs kill -9
```

### Database Connection Issues
1. Verify PostgreSQL is running
2. Check credentials in `backend/.env`
3. Ensure database `cfe_usage_metrics` exists
4. Verify stored procedures are installed

### CORS Errors
Ensure `backend/.env` has correct frontend URL:
```env
CORS_ORIGIN=http://localhost:5173
```

## Production Deployment

### Backend
1. Set `NODE_ENV=production` in `.env`
2. Update `CORS_ORIGIN` to production frontend URL
3. Use process manager (PM2 recommended):
```bash
npm install -g pm2
pm2 start server.js --name cfe-backend
```

### Frontend
1. Build production bundle:
```bash
cd frontend
npm run build
```
2. Serve `dist/` folder with nginx/Apache or static hosting service
3. Update API proxy configuration for production backend URL

## Performance Optimization

### Backend
- Query results cached for 10 minutes (600 seconds)
- Connection pooling enabled (max 20 connections)
- Automatic cache cleanup for expired entries

### Frontend
- Vite HMR (Hot Module Replacement) for fast development
- Code splitting and lazy loading
- Optimized production builds

## Security Notes
- Never commit `.env` files to version control
- Use environment-specific configurations
- Implement proper authentication/authorization for production
- Use HTTPS in production
- Regularly update dependencies

## Support
For issues or questions, refer to:
- Application logs in terminal
- Browser DevTools Console
- Network tab for API request/response inspection

## Version History
- **2026-01-02**: Enhanced User Personas report with consolidated summary panel and improved styling
- **Initial Release**: Core dashboard and reporting functionality

---
**Made with Bob** 🤖
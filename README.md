# CFE Usage Metrics Dashboard

A full-stack web application for tracking and analyzing Customer Facing Experience (CFE) usage metrics and database analytics.

## 🚀 Features

- **Real-time Database Metrics**: Monitor database size, table counts, and schema information
- **User Personas Analytics**: Track user activity and policies serviced with consolidated summary views
- **CSR Metrics**: Client Services Representative performance tracking
- **Back Office Metrics**: Back office user activity monitoring
- **Interactive Reports**: Date range filtering, sortable tables, and CSV export capabilities
- **Modern UI**: Responsive design with sticky headers and professional styling

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database with stored procedures
- **CORS** enabled for cross-origin requests
- **Query caching** for performance optimization

### Frontend
- **React 18** with functional components and hooks
- **Vite** for fast development and optimized builds
- **Axios** for API communication
- **Recharts** for data visualization
- **Modern CSS** with responsive design

## 📋 Prerequisites

- Node.js v18 or higher
- PostgreSQL v12 or higher
- Git

## 🔧 Installation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed installation and deployment instructions.

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/narayan-kn/CFE-Usage-Metrics.git
cd CFE-Usage-Metrics
```

2. **Setup Backend**
```bash
cd backend
npm install
# Configure .env file with your database credentials
npm start
```

3. **Setup Frontend** (in new terminal)
```bash
cd frontend
npm install
npm run dev
```

4. **Access the application**
Open http://localhost:5173 in your browser

## 📊 Application Structure

```
CFE Usage Metrics/
├── backend/              # Express.js API server
│   ├── server.js        # Main server file
│   ├── .env.example     # Environment template
│   └── package.json     # Backend dependencies
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── UserPersonasMetrics.jsx
│   │   │   ├── CSRMetrics.jsx
│   │   │   └── BackOfficeMetrics.jsx
│   │   └── styles/      # CSS styling
│   ├── package.json     # Frontend dependencies
│   └── vite.config.js   # Vite configuration
├── DEPLOYMENT.md        # Detailed deployment guide
└── README.md           # This file
```

## 🎯 Key Features

### Dashboard
- Database size and statistics
- Table count with search functionality
- Real-time metrics updates

### User Personas Report
- **Consolidated Summary Panel**: Single panel showing total personas, policies serviced, and averages
- **Sticky Table Header**: Header remains visible during scrolling
- **Professional Styling**: Modern gradient effects and hover animations
- **Date Range Filtering**: Analyze specific time periods
- **CSV Export**: Download data for further analysis

### CSR & Back Office Reports
- Activity tracking by user
- Performance metrics
- Date range filtering
- Export capabilities

## 🔒 Security

- Environment variables for sensitive data
- CORS configuration for API security
- Input validation and sanitization
- Secure database connections

## 📝 Recent Updates

### 2026-01-02: Enhanced User Personas Report
- Replaced three separate stat cards with consolidated summary panel
- Added professional gradient styling and hover effects
- Implemented sticky table header for better UX
- Improved responsive layout and visual hierarchy

## 🐛 Troubleshooting

### Browser Cache Issues
If changes don't appear:
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
- Clear browser cache in settings
- Clear Vite cache: `rm -rf node_modules/.vite dist .vite`

### Port Conflicts
```bash
# Kill processes on ports
lsof -ti:3001 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for more troubleshooting tips.

## 📄 License

This project is proprietary software developed for internal use.

## 👥 Contributors

- Development Team
- Database Administrators
- UX/UI Designers

## 📞 Support

For issues or questions:
1. Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
2. Review application logs
3. Contact the development team

---

**Made with Bob** 🤖 | Last Updated: January 2, 2026
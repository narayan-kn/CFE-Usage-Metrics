import React, { useState, useEffect } from 'react';
import { metricsAPI } from '../services/api';
import TableList from './TableList';
import TableDetails from './TableDetails';
import QueryExecutor from './QueryExecutor';
import StatsOverview from './StatsOverview';
import WorktypeCounts from './WorktypeCounts';
import MetricsReports from './MetricsReports';
import { getVersionString } from '../config/version';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, tablesRes] = await Promise.all([
        metricsAPI.getStats(),
        metricsAPI.getTableCounts(),
      ]);

      setStats(statsRes.data.data);
      setTables(tablesRes.data.data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadInitialData();
      return;
    }

    try {
      setLoading(true);
      const response = await metricsAPI.searchTables(searchQuery);
      setTables(response.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = (table) => {
    setSelectedTable(table);
    setActiveTab('details');
  };

  if (loading && !stats) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading database metrics...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px 30px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          {/* Left: Custom Logo */}
          <div style={{ display: 'flex', alignItems: 'center', minWidth: '80px' }}>
            <img
              src="/IBM logo.png"
              alt="Company Logo"
              style={{
                height: '40px',
                width: 'auto',
                objectFit: 'contain'
              }}
            />
          </div>
          
          {/* Center: Title */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h1 style={{
              margin: 0,
              fontSize: '2rem',
              fontWeight: '700',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              letterSpacing: '0.5px'
            }}>
              📊 Operations Dashboard
            </h1>
            <p style={{
              margin: '6px 0 0 0',
              color: 'rgba(255,255,255,0.95)',
              fontSize: '1rem',
              fontWeight: '500',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}>
              CFE Usage Metrics
            </p>
          </div>
          
          {/* Right: Version */}
          <div style={{
            fontSize: '0.85rem',
            color: 'white',
            textAlign: 'right',
            fontFamily: 'monospace',
            minWidth: '180px',
            background: 'rgba(255,255,255,0.15)',
            padding: '8px 12px',
            borderRadius: '6px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{getVersionString()}</div>
            <div style={{ fontSize: '0.75rem', marginTop: '3px', opacity: 0.9 }}>CFE Usage Metrics</div>
          </div>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
          <button onClick={loadInitialData}>Retry</button>
        </div>
      )}

      <div className="dashboard-tabs">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={activeTab === 'query' ? 'active' : ''}
          onClick={() => setActiveTab('query')}
        >
          Query Executor
        </button>
        <button
          className={activeTab === 'metrics' ? 'active' : ''}
          onClick={() => setActiveTab('metrics')}
        >
          Metrics Reports
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <StatsOverview stats={stats} tables={tables} />
        )}

        {activeTab === 'query' && <QueryExecutor />}

        {activeTab === 'metrics' && <MetricsReports />}
      </div>
    </div>
  );
};

export default Dashboard;

// Made with Bob

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
      <header className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* IBM Logo */}
            <svg width="50" height="20" viewBox="0 0 50 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="0" width="8" height="3" fill="#0F62FE"/>
              <rect x="0" y="4" width="8" height="3" fill="#0F62FE"/>
              <rect x="0" y="8" width="8" height="3" fill="#0F62FE"/>
              <rect x="0" y="12" width="8" height="3" fill="#0F62FE"/>
              <rect x="0" y="16" width="8" height="3" fill="#0F62FE"/>
              <rect x="10" y="0" width="8" height="3" fill="#0F62FE"/>
              <rect x="10" y="8" width="8" height="3" fill="#0F62FE"/>
              <rect x="10" y="16" width="8" height="3" fill="#0F62FE"/>
              <rect x="20" y="0" width="8" height="3" fill="#0F62FE"/>
              <rect x="20" y="4" width="8" height="3" fill="#0F62FE"/>
              <rect x="20" y="8" width="8" height="3" fill="#0F62FE"/>
              <rect x="20" y="12" width="8" height="3" fill="#0F62FE"/>
              <rect x="20" y="16" width="8" height="3" fill="#0F62FE"/>
            </svg>
            
            {/* Dashboard Icon */}
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="7" height="7" rx="1" stroke="#667eea" strokeWidth="2" fill="none"/>
              <rect x="3" y="14" width="7" height="7" rx="1" stroke="#667eea" strokeWidth="2" fill="none"/>
              <rect x="14" y="3" width="7" height="7" rx="1" stroke="#667eea" strokeWidth="2" fill="none"/>
              <rect x="14" y="14" width="7" height="7" rx="1" stroke="#667eea" strokeWidth="2" fill="none"/>
              <circle cx="6.5" cy="6.5" r="1.5" fill="#667eea"/>
              <circle cx="17.5" cy="6.5" r="1.5" fill="#667eea"/>
              <circle cx="6.5" cy="17.5" r="1.5" fill="#667eea"/>
              <circle cx="17.5" cy="17.5" r="1.5" fill="#667eea"/>
            </svg>
            
            <div>
              <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '600' }}>Operations Dashboard</h1>
              <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '0.9rem' }}>CFE Usage Metrics</p>
            </div>
          </div>
          <div style={{
            fontSize: '0.85rem',
            color: '#666',
            textAlign: 'right',
            fontFamily: 'monospace'
          }}>
            <div style={{ fontWeight: '600', color: '#667eea' }}>{getVersionString()}</div>
            <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>Release: Monthly Metrics</div>
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
          className={activeTab === 'tables' ? 'active' : ''}
          onClick={() => setActiveTab('tables')}
        >
          Tables
        </button>
        <button
          className={activeTab === 'details' ? 'active' : ''}
          onClick={() => setActiveTab('details')}
          disabled={!selectedTable}
        >
          Table Details
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

        {activeTab === 'tables' && (
          <div className="tables-view">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search tables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button onClick={handleSearch}>Search</button>
              <button onClick={() => { setSearchQuery(''); loadInitialData(); }}>
                Clear
              </button>
            </div>
            <TableList
              tables={tables}
              onTableSelect={handleTableSelect}
              loading={loading}
            />
          </div>
        )}

        {activeTab === 'details' && selectedTable && (
          <TableDetails table={selectedTable} />
        )}

        {activeTab === 'query' && <QueryExecutor />}

        {activeTab === 'metrics' && <MetricsReports />}
      </div>
    </div>
  );
};

export default Dashboard;

// Made with Bob

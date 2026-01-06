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
          <div>
            <h1>📊 Operations Dashboard</h1>
            <p>CFE Usage Metrics</p>
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

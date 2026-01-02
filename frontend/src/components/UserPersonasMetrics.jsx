import React, { useState, useEffect, useRef } from 'react';
import { metricsAPI } from '../services/api';

const UserPersonasMetrics = () => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [finalElapsedTime, setFinalElapsedTime] = useState(null);
  const timerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Set default dates to August 2025 (as per SQL example)
  useEffect(() => {
    setStartDate('2025-08-01');
    setEndDate('2025-08-05');
  }, []);

  // Timer effect for elapsed time
  useEffect(() => {
    if (loading) {
      setElapsedTime(0);
      setFinalElapsedTime(null);
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [loading]);

  // Separate effect to capture final elapsed time when loading completes
  useEffect(() => {
    if (!loading && elapsedTime > 0) {
      setFinalElapsedTime(elapsedTime);
    }
  }, [loading, elapsedTime]);

  const fetchMetrics = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    setLoading(true);
    setError(null);
    
    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await metricsAPI.getUserPersonasMetrics(startDate, endDate, {
        signal: abortControllerRef.current.signal
      });
      const data = response.data.data || [];
      // Sort by user persona alphabetically
      const sortedData = data.sort((a, b) => {
        const personaA = (a.userpersona || '').toLowerCase();
        const personaB = (b.userpersona || '').toLowerCase();
        return personaA.localeCompare(personaB);
      });
      setMetrics(sortedData);
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        setError('Report was cancelled');
      } else {
        setError(err.response?.data?.error || 'Failed to fetch User Personas metrics');
      }
      console.error('Error fetching User Personas metrics:', err);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const cancelReport = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  // Don't auto-fetch - wait for user to click Run Report button

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return Number(num).toLocaleString();
  };

  const formatElapsedTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="csr-metrics">
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="startDate">Start Date:</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="endDate">End Date:</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button onClick={fetchMetrics} className="refresh-btn">
          ▶️ Run Report
        </button>
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading User Personas metrics...</p>
          <p className="elapsed-time">Elapsed time: {formatElapsedTime(elapsedTime)}</p>
          <p className="loading-note">This may take 30-60 seconds...</p>
          <button onClick={cancelReport} className="cancel-btn">
            ⏹️ Cancel Report
          </button>
        </div>
      )}
      
      {error && <div className="error">{error}</div>}

      {!loading && !error && metrics.length === 0 && (
        <div className="no-data">No User Personas metrics found for the selected date range.</div>
      )}

      {!loading && !error && metrics.length > 0 && (
        <>
          {finalElapsedTime !== null && (
            <div className="report-completion-time">
              {finalElapsedTime === 0 ? (
                <>⚡ Report loaded instantly (from cache)</>
              ) : (
                <>⏱️ Report completed in {formatElapsedTime(finalElapsedTime)}</>
              )}
            </div>
          )}
          
          {/* Updated: 2026-01-02 16:54 - New Summary Panel Design */}
          <div className="summary-panel">
            <h3>📊 Summary Metrics</h3>
            <div className="summary-stats">
              <div className="summary-stat">
                <span className="summary-label">Total Personas:</span>
                <span className="summary-value">{formatNumber(metrics.length)}</span>
              </div>
              <div className="summary-stat">
                <span className="summary-label">Total Policies Serviced:</span>
                <span className="summary-value">
                  {formatNumber(metrics.reduce((sum, m) => sum + (Number(m.countofpoliciesserviced) || 0), 0))}
                </span>
              </div>
              <div className="summary-stat">
                <span className="summary-label">Average per Persona:</span>
                <span className="summary-value">
                  {formatNumber(Math.round(
                    metrics.reduce((sum, m) => sum + (Number(m.countofpoliciesserviced) || 0), 0) / metrics.length
                  ))}
                </span>
              </div>
            </div>
          </div>

          <div className="metrics-table-container" style={{
            background: 'white',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
            overflow: 'hidden',
            maxHeight: '600px',
            overflowY: 'auto',
            position: 'relative',
            border: '1px solid #e2e8f0'
          }}>
            <div className="metrics-table-header" style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1.5fr 1.5fr',
              gap: 0,
              position: 'sticky',
              top: 0,
              zIndex: 10,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <div className="header-cell" style={{
                padding: '16px',
                textAlign: 'left',
                fontWeight: 600,
                color: 'white',
                fontSize: '0.95rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderRight: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center'
              }}>User Email</div>
              <div className="header-cell" style={{
                padding: '16px',
                textAlign: 'left',
                fontWeight: 600,
                color: 'white',
                fontSize: '0.95rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderRight: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center'
              }}>User Persona</div>
              <div className="header-cell" style={{
                padding: '16px',
                textAlign: 'left',
                fontWeight: 600,
                color: 'white',
                fontSize: '0.95rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center'
              }}>Number of Policies Serviced</div>
            </div>
            <div className="metrics-table-body" style={{ background: 'white' }}>
              {metrics.map((metric, index) => (
                <div key={index} className="table-row" style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1.5fr 1.5fr',
                  gap: 0,
                  borderBottom: index === metrics.length - 1 ? 'none' : '1px solid #e2e8f0',
                  transition: 'background-color 0.2s ease'
                }}>
                  <div className="table-cell" style={{
                    padding: '14px 16px',
                    color: '#475569',
                    background: 'inherit',
                    borderRight: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center'
                  }}>{metric.userlogin || 'N/A'}</div>
                  <div className="table-cell" style={{
                    padding: '14px 16px',
                    color: '#475569',
                    background: 'inherit',
                    borderRight: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center'
                  }}>{metric.userpersona || 'N/A'}</div>
                  <div className="table-cell number" style={{
                    padding: '14px 16px',
                    color: '#1e293b',
                    background: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    fontWeight: 500
                  }}>{formatNumber(metric.countofpoliciesserviced)}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserPersonasMetrics;

// Made with Bob
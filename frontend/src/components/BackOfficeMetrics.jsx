import React, { useState, useEffect, useRef } from 'react';
import { metricsAPI } from '../services/api';

const BackOfficeMetrics = () => {
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

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await metricsAPI.getBackOfficeMetrics(startDate, endDate, {
        signal: abortControllerRef.current.signal
      });
      setMetrics(response.data.data || []);
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        setError('Report was cancelled');
      } else {
        setError(err.response?.data?.error || 'Failed to fetch Back Office metrics');
        console.error('Error fetching Back Office metrics:', err);
      }
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
          <p>Loading Back Office metrics...</p>
          <p className="elapsed-time">Elapsed time: {formatElapsedTime(elapsedTime)}</p>
          <p className="loading-note">This may take 30-60 seconds...</p>
          <button onClick={cancelReport} className="cancel-btn">
            ⏹️ Cancel Report
          </button>
        </div>
      )}
      
      {error && <div className="error">{error}</div>}

      {!loading && !error && metrics.length === 0 && (
        <div className="no-data">No Back Office metrics found for the selected date range.</div>
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
          
          <div className="summary-panel">
            <h3>📊 Summary Metrics</h3>
            <div className="summary-stats">
              <div className="summary-stat">
                <span className="summary-label">Total Users:</span>
                <span className="summary-value">{formatNumber(metrics.length)}</span>
              </div>
              <div className="summary-stat">
                <span className="summary-label">Total Policies:</span>
                <span className="summary-value">
                  {formatNumber(metrics.reduce((sum, m) => sum + (Number(m.countofpoliciescustomersserviced) || 0), 0))}
                </span>
              </div>
              <div className="summary-stat">
                <span className="summary-label">Average per User:</span>
                <span className="summary-value">
                  {formatNumber(Math.round(
                    metrics.reduce((sum, m) => sum + (Number(m.countofpoliciescustomersserviced) || 0), 0) / metrics.length
                  ))}
                </span>
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              maxHeight: '600px',
              overflowY: 'auto',
              position: 'relative'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'separate',
                borderSpacing: 0
              }}>
                <thead>
                  <tr style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}>
                    <th style={{
                      padding: '16px 20px',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      textAlign: 'left',
                      borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                      width: '60%'
                    }}>User Login</th>
                    <th style={{
                      padding: '16px 20px',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      textAlign: 'right',
                      width: '40%'
                    }}>Number of Policies Serviced</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric, index) => (
                    <tr key={index} style={{
                      background: index % 2 === 0 ? '#f7fafc' : 'white',
                      borderBottom: index === metrics.length - 1 ? 'none' : '1px solid #e2e8f0',
                      transition: 'background-color 0.2s ease'
                    }}>
                      <td style={{
                        padding: '16px 20px',
                        fontSize: '14px',
                        color: '#2d3748',
                        borderRight: '1px solid #e2e8f0'
                      }}>{metric.userloginname || 'N/A'}</td>
                      <td style={{
                        padding: '16px 20px',
                        fontSize: '14px',
                        color: '#2d3748',
                        textAlign: 'right',
                        fontWeight: '500'
                      }}>{formatNumber(metric.countofpoliciescustomersserviced)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BackOfficeMetrics;

// Made with Bob
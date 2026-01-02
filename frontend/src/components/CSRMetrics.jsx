import React, { useState, useEffect, useRef } from 'react';
import { metricsAPI } from '../services/api';

const CSRMetrics = () => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [finalElapsedTime, setFinalElapsedTime] = useState(null);
  const timerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Set default dates to last month of 2024 (where data exists)
  // Full year queries can take 1-2 minutes due to stored procedure processing
  useEffect(() => {
    setStartDate('2024-12-01');
    setEndDate('2024-12-31');
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
      const response = await metricsAPI.getCSRMetrics(startDate, endDate, {
        signal: abortControllerRef.current.signal
      });
      setMetrics(response.data.data || []);
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        setError('Report was cancelled');
      } else {
        setError(err.response?.data?.error || 'Failed to fetch CSR metrics');
      }
      console.error('Error fetching CSR metrics:', err);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return Number(num).toLocaleString();
  };

  const formatMinutes = (mins) => {
    if (!mins) return '0m';
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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
          <p>Loading CSR metrics...</p>
          <p className="elapsed-time">Elapsed time: {formatElapsedTime(elapsedTime)}</p>
          <p className="loading-note">Note: Large date ranges may take 1-2 minutes to process.</p>
          <button onClick={cancelReport} className="cancel-btn">
            ⏹️ Cancel Report
          </button>
        </div>
      )}
      
      {error && <div className="error">{error}</div>}

      {!loading && !error && metrics.length === 0 && (
        <div className="no-data">No CSR metrics found for the selected date range.</div>
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
          
          <div className="metrics-report-summary">
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <h3>Total Records</h3>
                <p className="stat-value">{formatNumber(metrics.length)}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Unique Users</h3>
                <p className="stat-value">
                  {formatNumber(new Set(metrics.map(m => m.userlogin)).size)}
                </p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <h3>Total Policies</h3>
                <p className="stat-value">
                  {formatNumber(metrics.reduce((sum, m) => sum + (Number(m.polcusserviced) || 0), 0))}
                </p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📞</div>
              <div className="stat-content">
                <h3>Total Contacts</h3>
                <p className="stat-value">
                  {formatNumber(metrics.reduce((sum, m) => sum + (Number(m.countofcontacts) || 0), 0))}
                </p>
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
                      width: '12%'
                    }}>Run Date</th>
                    <th style={{
                      padding: '16px 20px',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      textAlign: 'left',
                      borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                      width: '20%'
                    }}>User Login</th>
                    <th style={{
                      padding: '16px 20px',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      textAlign: 'left',
                      borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                      width: '18%'
                    }}>User Persona</th>
                    <th style={{
                      padding: '16px 20px',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      textAlign: 'left',
                      borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                      width: '12%'
                    }}>Time in CFE</th>
                    <th style={{
                      padding: '16px 20px',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      textAlign: 'right',
                      borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                      width: '20%'
                    }}>Policies/Customers Serviced</th>
                    <th style={{
                      padding: '16px 20px',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      textAlign: 'right',
                      width: '18%'
                    }}>Contact Count</th>
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
                      }}>{formatDate(metric.rundate)}</td>
                      <td style={{
                        padding: '16px 20px',
                        fontSize: '14px',
                        color: '#2d3748',
                        borderRight: '1px solid #e2e8f0'
                      }}>{metric.userlogin || 'N/A'}</td>
                      <td style={{
                        padding: '16px 20px',
                        fontSize: '14px',
                        color: '#2d3748',
                        borderRight: '1px solid #e2e8f0'
                      }}>{metric.userpersona || 'N/A'}</td>
                      <td style={{
                        padding: '16px 20px',
                        fontSize: '14px',
                        color: '#2d3748',
                        borderRight: '1px solid #e2e8f0'
                      }}>{formatMinutes(metric.minsincfe)}</td>
                      <td style={{
                        padding: '16px 20px',
                        fontSize: '14px',
                        color: '#2d3748',
                        textAlign: 'right',
                        fontWeight: '500',
                        borderRight: '1px solid #e2e8f0'
                      }}>{formatNumber(metric.polcusserviced)}</td>
                      <td style={{
                        padding: '16px 20px',
                        fontSize: '14px',
                        color: '#2d3748',
                        textAlign: 'right',
                        fontWeight: '500'
                      }}>{formatNumber(metric.countofcontacts)}</td>
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

export default CSRMetrics;

// Made with Bob

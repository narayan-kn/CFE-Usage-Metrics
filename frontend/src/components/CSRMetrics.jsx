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
        // Store the final elapsed time when loading completes
        if (elapsedTime > 0) {
          setFinalElapsedTime(elapsedTime);
        }
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
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
              ⏱️ Report completed in {formatElapsedTime(finalElapsedTime)}
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

          <div className="metrics-table-wrapper">
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>Run Date</th>
                  <th>User Login</th>
                  <th>User Persona</th>
                  <th>Time in CFE</th>
                  <th>Policies/Customers Serviced</th>
                  <th>Contact Count</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric, index) => (
                  <tr key={index}>
                    <td>{formatDate(metric.rundate)}</td>
                    <td>{metric.userlogin || 'N/A'}</td>
                    <td>{metric.userpersona || 'N/A'}</td>
                    <td>{formatMinutes(metric.minsincfe)}</td>
                    <td className="number">{formatNumber(metric.polcusserviced)}</td>
                    <td className="number">{formatNumber(metric.countofcontacts)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default CSRMetrics;

// Made with Bob

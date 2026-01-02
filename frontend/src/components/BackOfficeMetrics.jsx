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
              ⏱️ Report completed in {formatElapsedTime(finalElapsedTime)}
            </div>
          )}
          
          <div className="metrics-report-summary">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Total Users</h3>
                <p className="stat-value">{formatNumber(metrics.length)}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <h3>Total Policies</h3>
                <p className="stat-value">
                  {formatNumber(metrics.reduce((sum, m) => sum + (Number(m.countofpoliciescustomersserviced) || 0), 0))}
                </p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>Average per User</h3>
                <p className="stat-value">
                  {formatNumber(Math.round(
                    metrics.reduce((sum, m) => sum + (Number(m.countofpoliciescustomersserviced) || 0), 0) / metrics.length
                  ))}
                </p>
              </div>
            </div>
          </div>

          <div className="metrics-table-wrapper">
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>User Login</th>
                  <th>Number of Policies Serviced</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric, index) => (
                  <tr key={index}>
                    <td>{metric.userloginname || 'N/A'}</td>
                    <td className="number">{formatNumber(metric.countofpoliciescustomersserviced)}</td>
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

export default BackOfficeMetrics;

// Made with Bob
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
              ⏱️ Report completed in {formatElapsedTime(finalElapsedTime)}
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

          <div className="metrics-table-wrapper">
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>User Email</th>
                  <th>User Persona</th>
                  <th>Number of Policies Serviced</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric, index) => (
                  <tr key={index}>
                    <td>{metric.userlogin || 'N/A'}</td>
                    <td>{metric.userpersona || 'N/A'}</td>
                    <td className="number">{formatNumber(metric.countofpoliciesserviced)}</td>
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

export default UserPersonasMetrics;

// Made with Bob
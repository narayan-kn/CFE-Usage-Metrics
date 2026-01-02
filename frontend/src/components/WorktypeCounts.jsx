import { useState, useEffect } from 'react';
import { metricsAPI } from '../services/api';

const WorktypeCounts = () => {
  const [worktypes, setWorktypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('2025-04-21');
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchWorktypeCounts();
  }, [startDate]);

  const fetchWorktypeCounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await metricsAPI.getWorktypeCounts(startDate);
      
      if (response.data.success) {
        const data = response.data.data;
        setWorktypes(data);
        
        // Calculate total count
        const total = data.reduce((sum, item) => sum + parseInt(item.count), 0);
        setTotalCount(total);
      } else {
        setError(response.data.error || 'Failed to fetch worktype counts');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const formatNumber = (num) => {
    return parseInt(num).toLocaleString();
  };

  const getPercentage = (count) => {
    if (totalCount === 0) return '0.0';
    return ((parseInt(count) / totalCount) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading worktype counts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        <button onClick={fetchWorktypeCounts} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="worktype-counts-container">
      <div className="worktype-header">
        <h2>Worktype Counts</h2>
        <div className="date-filter">
          <label htmlFor="startDate">Start Date:</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={handleDateChange}
            className="date-input"
          />
        </div>
      </div>

      <div className="worktype-summary">
        <div className="summary-card">
          <h3>Total Transactions</h3>
          <p className="summary-value">{formatNumber(totalCount)}</p>
        </div>
        <div className="summary-card">
          <h3>Worktype Categories</h3>
          <p className="summary-value">{worktypes.length}</p>
        </div>
        <div className="summary-card">
          <h3>Date Range</h3>
          <p className="summary-value">Since {startDate}</p>
        </div>
      </div>

      <div className="worktype-table-container">
        <table className="worktype-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Worktype</th>
              <th>Count</th>
              <th>Percentage</th>
              <th>Visual</th>
            </tr>
          </thead>
          <tbody>
            {worktypes.map((worktype, index) => (
              <tr key={index}>
                <td className="rank-cell">{index + 1}</td>
                <td className="worktype-cell">{worktype.worktype}</td>
                <td className="count-cell">{formatNumber(worktype.count)}</td>
                <td className="percentage-cell">{getPercentage(worktype.count)}%</td>
                <td className="visual-cell">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${getPercentage(worktype.count)}%` }}
                    ></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {worktypes.length === 0 && (
        <div className="no-data">
          <p>No worktype data found for the selected date range.</p>
        </div>
      )}
    </div>
  );
};

export default WorktypeCounts;

// Made with Bob

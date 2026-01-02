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
                  textAlign: 'center',
                  borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                  width: '8%'
                }}>Rank</th>
                <th style={{
                  padding: '16px 20px',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  textAlign: 'left',
                  borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                  width: '30%'
                }}>Worktype</th>
                <th style={{
                  padding: '16px 20px',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  textAlign: 'right',
                  borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                  width: '15%'
                }}>Count</th>
                <th style={{
                  padding: '16px 20px',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  textAlign: 'right',
                  borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                  width: '12%'
                }}>Percentage</th>
                <th style={{
                  padding: '16px 20px',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  textAlign: 'left',
                  width: '35%'
                }}>Visual</th>
              </tr>
            </thead>
            <tbody>
              {worktypes.map((worktype, index) => (
                <tr key={index} style={{
                  background: index % 2 === 0 ? '#f7fafc' : 'white',
                  borderBottom: index === worktypes.length - 1 ? 'none' : '1px solid #e2e8f0',
                  transition: 'background-color 0.2s ease'
                }}>
                  <td style={{
                    padding: '16px 20px',
                    fontSize: '14px',
                    color: '#2d3748',
                    textAlign: 'center',
                    fontWeight: '600',
                    borderRight: '1px solid #e2e8f0'
                  }}>{index + 1}</td>
                  <td style={{
                    padding: '16px 20px',
                    fontSize: '14px',
                    color: '#2d3748',
                    borderRight: '1px solid #e2e8f0'
                  }}>{worktype.worktype}</td>
                  <td style={{
                    padding: '16px 20px',
                    fontSize: '14px',
                    color: '#2d3748',
                    textAlign: 'right',
                    fontWeight: '500',
                    borderRight: '1px solid #e2e8f0'
                  }}>{formatNumber(worktype.count)}</td>
                  <td style={{
                    padding: '16px 20px',
                    fontSize: '14px',
                    color: '#2d3748',
                    textAlign: 'right',
                    fontWeight: '500',
                    borderRight: '1px solid #e2e8f0'
                  }}>{getPercentage(worktype.count)}%</td>
                  <td style={{
                    padding: '16px 20px',
                    fontSize: '14px',
                    color: '#2d3748'
                  }}>
                    <div style={{
                      width: '100%',
                      height: '24px',
                      backgroundColor: '#e2e8f0',
                      borderRadius: '12px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${getPercentage(worktype.count)}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

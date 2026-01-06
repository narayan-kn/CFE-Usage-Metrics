import { useState, useEffect } from 'react';
import { metricsAPI } from '../services/api';

const WorktypeCounts = () => {
  const [allData, setAllData] = useState([]);
  const [worktypes, setWorktypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('2025-01-01');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [availableMonths, setAvailableMonths] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasRun, setHasRun] = useState(false);

  // Auto-run report on component mount
  useEffect(() => {
    fetchWorktypeCounts();
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    if (selectedMonth && selectedMonth !== '') {
      filterByMonth();
    }
  }, [selectedMonth, allData]);

  const fetchWorktypeCounts = async () => {
    if (!selectedMonth) {
      setError('Please select a month or "All Months" option');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasRun(true);
      const response = await metricsAPI.getWorktypeCounts(startDate);
      
      if (response.data.success) {
        const data = response.data.data;
        setAllData(data);
        
        // Extract unique months and filter for 2025+
        const months = [...new Set(data.map(item => item.month2))]
          .filter(month => {
            const year = new Date(month).getFullYear();
            return year >= 2025;
          })
          .sort();
        setAvailableMonths(months);
      } else {
        setError(response.data.error || 'Failed to fetch worktype counts');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const filterByMonth = () => {
    if (allData.length === 0) return;

    let filtered;
    if (selectedMonth === 'all') {
      // Aggregate all months
      const aggregated = {};
      allData.forEach(item => {
        if (aggregated[item.worktype]) {
          aggregated[item.worktype] += parseInt(item.count);
        } else {
          aggregated[item.worktype] = parseInt(item.count);
        }
      });
      filtered = Object.entries(aggregated).map(([worktype, count]) => ({
        worktype,
        count
      })).sort((a, b) => b.count - a.count);
    } else {
      // Filter by selected month
      filtered = allData
        .filter(item => item.month2 === selectedMonth)
        .sort((a, b) => parseInt(b.count) - parseInt(a.count));
    }

    setWorktypes(filtered);
    const total = filtered.reduce((sum, item) => sum + parseInt(item.count), 0);
    setTotalCount(total);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleRunReport = () => {
    fetchWorktypeCounts();
  };

  const formatNumber = (num) => {
    return parseInt(num).toLocaleString();
  };

  const formatMonthDisplay = (monthStr) => {
    if (!monthStr) return '';
    const date = new Date(monthStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const getPercentage = (count) => {
    if (totalCount === 0) return '0.0';
    return ((parseInt(count) / totalCount) * 100).toFixed(1);
  };


  return (
    <div className="worktype-counts-container">
      <div className="worktype-header">
        <h2>Worktype Counts by Month</h2>
        <div className="filters" style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="month-filter">
            <label htmlFor="monthSelect" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Select Month:
            </label>
            <select
              id="monthSelect"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="month-select"
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e0',
                fontSize: '14px',
                minWidth: '200px'
              }}
            >
              <option value="">-- Select a Month --</option>
              <option value="all">All Months (Cumulative)</option>
              {availableMonths.map(month => (
                <option key={month} value={month}>
                  {formatMonthDisplay(month)}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleRunReport}
            className="refresh-btn"
            disabled={!selectedMonth || loading}
            style={{
              padding: '8px 20px',
              opacity: (!selectedMonth || loading) ? 0.5 : 1,
              cursor: (!selectedMonth || loading) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ Loading...' : '▶️ Run Report'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading worktype counts...</p>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {!loading && !error && !hasRun && (
        <div className="no-data">
          <p>Please select a month and click "Run Report" to view worktype counts.</p>
        </div>
      )}

      {!loading && !error && hasRun && worktypes.length === 0 && (
        <div className="no-data">
          <p>No worktype data found for the selected period.</p>
        </div>
      )}

      {!loading && !error && hasRun && worktypes.length > 0 && (
        <>
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
              <h3>Period</h3>
              <p className="summary-value">
                {selectedMonth === 'all' ? `Since ${startDate}` : formatMonthDisplay(selectedMonth)}
              </p>
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
                      width: '35%'
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
                      width: '30%'
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
        </>
      )}
    </div>
  );
};

export default WorktypeCounts;

// Made with Bob

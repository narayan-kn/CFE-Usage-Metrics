import React from 'react';

const StatsOverview = ({ stats, tables }) => {
  if (!stats) {
    return <div>Loading statistics...</div>;
  }

  // Sort tables by size (convert size string to bytes for proper sorting)
  const sizeToBytes = (sizeStr) => {
    if (!sizeStr) return 0;
    const units = { 'bytes': 1, 'kB': 1024, 'MB': 1024**2, 'GB': 1024**3, 'TB': 1024**4 };
    const match = sizeStr.match(/^([\d.]+)\s*(\w+)$/);
    if (!match) return 0;
    const [, num, unit] = match;
    return parseFloat(num) * (units[unit] || 1);
  };

  const sortedTables = [...tables].sort((a, b) => sizeToBytes(b.size) - sizeToBytes(a.size));
  const top20Tables = sortedTables.slice(0, 20);

  return (
    <div className="stats-overview">
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">💾</div>
          <div className="stat-content">
            <h3>Database Size</h3>
            <p className="stat-value">{stats.totalSize}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Total Tables</h3>
            <p className="stat-value">{stats.tableCount}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📁</div>
          <div className="stat-content">
            <h3>Schemas</h3>
            <p className="stat-value">{stats.schemaCount}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Total Rows</h3>
            <p className="stat-value">
              {tables.reduce((sum, t) => sum + t.count, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="top-tables-section">
        <h2 style={{
          fontSize: '1.5rem',
          marginBottom: '20px',
          color: '#4f46e5',
          fontWeight: '600'
        }}>
          📊 Top 20 Tables by Size
        </h2>
        
        <div style={{
          overflowX: 'auto',
          marginTop: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: 'white'
          }}>
            <thead>
              <tr>
                <th style={{
                  position: 'sticky',
                  top: 0,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  zIndex: 10,
                  width: '60px'
                }}>
                  Rank
                </th>
                <th style={{
                  position: 'sticky',
                  top: 0,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  zIndex: 10
                }}>
                  Schema
                </th>
                <th style={{
                  position: 'sticky',
                  top: 0,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  zIndex: 10
                }}>
                  Table Name
                </th>
                <th style={{
                  position: 'sticky',
                  top: 0,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '12px',
                  textAlign: 'right',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  zIndex: 10
                }}>
                  Row Count
                </th>
                <th style={{
                  position: 'sticky',
                  top: 0,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '12px',
                  textAlign: 'right',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  zIndex: 10
                }}>
                  Table Size
                </th>
              </tr>
            </thead>
            <tbody>
              {top20Tables.map((table, index) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e0e7ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f9fafb' : 'white';
                  }}
                >
                  <td style={{
                    padding: '12px',
                    borderBottom: '1px solid #e5e7eb',
                    fontWeight: '700',
                    color: '#4f46e5'
                  }}>
                    #{index + 1}
                  </td>
                  <td style={{
                    padding: '12px',
                    borderBottom: '1px solid #e5e7eb',
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    {table.schema}
                  </td>
                  <td style={{
                    padding: '12px',
                    borderBottom: '1px solid #e5e7eb',
                    color: '#111827',
                    fontWeight: '600'
                  }}>
                    {table.table}
                  </td>
                  <td style={{
                    padding: '12px',
                    borderBottom: '1px solid #e5e7eb',
                    textAlign: 'right',
                    color: '#111827',
                    fontWeight: '500'
                  }}>
                    {table.count.toLocaleString()}
                  </td>
                  <td style={{
                    padding: '12px',
                    borderBottom: '1px solid #e5e7eb',
                    textAlign: 'right',
                    color: '#111827',
                    fontWeight: '600'
                  }}>
                    {table.size}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;

// Made with Bob

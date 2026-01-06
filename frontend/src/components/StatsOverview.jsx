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
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '16px',
          marginTop: '20px'
        }}>
          {top20Tables.map((table, index) => (
            <div 
              key={index} 
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '8px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <span style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  marginRight: '12px'
                }}>
                  #{index + 1}
                </span>
                <h4 style={{
                  margin: 0,
                  fontSize: '1rem',
                  fontWeight: '600',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1
                }}>
                  {table.schema}.{table.table}
                </h4>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '12px',
                borderTop: '1px solid rgba(255,255,255,0.2)'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.75rem',
                    opacity: 0.9,
                    marginBottom: '4px'
                  }}>
                    Row Count
                  </div>
                  <div style={{
                    fontSize: '1.1rem',
                    fontWeight: '700'
                  }}>
                    📊 {table.count.toLocaleString()}
                  </div>
                </div>
                
                <div style={{ 
                  flex: 1,
                  textAlign: 'right'
                }}>
                  <div style={{
                    fontSize: '0.75rem',
                    opacity: 0.9,
                    marginBottom: '4px'
                  }}>
                    Table Size
                  </div>
                  <div style={{
                    fontSize: '1.1rem',
                    fontWeight: '700'
                  }}>
                    💾 {table.size}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;

// Made with Bob

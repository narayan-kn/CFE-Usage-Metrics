import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatsOverview = ({ stats, tables }) => {
  if (!stats) {
    return <div>Loading statistics...</div>;
  }

  // Prepare data for chart - top 10 tables by row count
  const chartData = tables.slice(0, 10).map(table => ({
    name: `${table.schema}.${table.table}`,
    rows: table.count,
  }));

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

      <div className="chart-container">
        <h2>Top 10 Tables by Row Count</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={150}
              interval={0}
            />
            <YAxis />
            <Tooltip formatter={(value) => value.toLocaleString()} />
            <Legend />
            <Bar dataKey="rows" fill="#4f46e5" name="Row Count" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="tables-summary">
        <h2>All Tables Summary</h2>
        <div className="table-grid">
          {tables.map((table, index) => (
            <div key={index} className="table-summary-card">
              <h4>{table.schema}.{table.table}</h4>
              <div className="table-summary-stats">
                <span>📊 {table.count.toLocaleString()} rows</span>
                <span>💾 {table.size}</span>
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

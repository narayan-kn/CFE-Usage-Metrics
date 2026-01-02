import React, { useState, useEffect } from 'react';
import { metricsAPI } from '../services/api';

const TableDetails = ({ table }) => {
  const [columns, setColumns] = useState([]);
  const [sampleData, setSampleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sampleLimit, setSampleLimit] = useState(10);

  useEffect(() => {
    loadTableDetails();
  }, [table, sampleLimit]);

  const loadTableDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const [columnsRes, sampleRes] = await Promise.all([
        metricsAPI.getTableColumns(table.schema, table.table),
        metricsAPI.getTableSample(table.schema, table.table, sampleLimit),
      ]);

      setColumns(columnsRes.data.data);
      setSampleData(sampleRes.data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading table details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading table details...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="table-details">
      <div className="table-header">
        <h2>{table.schema}.{table.table}</h2>
        <div className="table-meta">
          <span>📊 {table.count?.toLocaleString()} rows</span>
          <span>💾 {table.size}</span>
        </div>
      </div>

      <div className="columns-section">
        <h3>Columns ({columns.length})</h3>
        <table className="columns-table">
          <thead>
            <tr>
              <th>Column Name</th>
              <th>Data Type</th>
              <th>Nullable</th>
              <th>Default</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((col, index) => (
              <tr key={index}>
                <td><strong>{col.column_name}</strong></td>
                <td><code>{col.data_type}</code></td>
                <td>{col.is_nullable === 'YES' ? '✓' : '✗'}</td>
                <td>{col.column_default || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sample-data-section">
        <div className="section-header">
          <h3>Sample Data</h3>
          <div className="sample-controls">
            <label>
              Rows:
              <select 
                value={sampleLimit} 
                onChange={(e) => setSampleLimit(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </label>
            <button onClick={loadTableDetails}>Refresh</button>
          </div>
        </div>

        {sampleData?.success ? (
          <div className="sample-data-container">
            <table className="sample-data-table">
              <thead>
                <tr>
                  {sampleData.columns?.map((col, index) => (
                    <th key={index}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleData.rows?.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {sampleData.columns?.map((col, colIndex) => (
                      <td key={colIndex}>
                        {row[col] !== null && row[col] !== undefined
                          ? String(row[col])
                          : <em>null</em>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="error">Failed to load sample data: {sampleData?.error}</div>
        )}
      </div>
    </div>
  );
};

export default TableDetails;

// Made with Bob

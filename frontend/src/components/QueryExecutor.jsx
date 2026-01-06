import React, { useState } from 'react';
import { metricsAPI } from '../services/api';

const QueryExecutor = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [executionTime, setExecutionTime] = useState(null);

  const sampleQueries = [
    {
      name: 'List all tables',
      query: `-- List all user tables with proper case-sensitive handling
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size('"' || schemaname || '"."' || tablename || '"')) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY schemaname, tablename
LIMIT 100;`
    },
    {
      name: 'Database size',
      query: `-- Get total database size
SELECT
  pg_size_pretty(pg_database_size(current_database())) as database_size;`
    },
    {
      name: 'Top 10 largest tables',
      query: `-- Find the 10 largest tables (handles case-sensitive names)
SELECT
  schemaname || '.' || tablename AS table_name,
  pg_size_pretty(pg_total_relation_size('"' || schemaname || '"."' || tablename || '"')) AS size,
  pg_total_relation_size('"' || schemaname || '"."' || tablename || '"') AS size_bytes
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY size_bytes DESC
LIMIT 10;`
    },
    {
      name: 'Table row counts',
      query: `-- Get row counts for all tables in public schema
SELECT
  schemaname,
  relname AS tablename,
  n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC
LIMIT 50;`
    },
    {
      name: 'Sample: Query a table',
      query: `-- Example: Query the Policy_Compare table
-- IMPORTANT: Table names with mixed case MUST be quoted with double quotes
-- Without quotes, PostgreSQL converts to lowercase: policy_compare (will fail!)
-- With quotes, it preserves case: "Policy_Compare" (correct!)

SELECT * FROM "Policy_Compare" LIMIT 10;

-- Other examples:
-- SELECT * FROM "public"."Policy_Compare" WHERE column_name = 'value' LIMIT 10;
-- SELECT COUNT(*) FROM "Policy_Compare";`
    }
  ];

  const executeQuery = async () => {
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      const startTime = performance.now();
      const response = await metricsAPI.executeQuery(query);
      const endTime = performance.now();
      
      setExecutionTime((endTime - startTime).toFixed(2));
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSampleQuery = (sampleQuery) => {
    setQuery(sampleQuery);
    setResult(null);
    setError(null);
  };

  const clearQuery = () => {
    setQuery('');
    setResult(null);
    setError(null);
    setExecutionTime(null);
  };

  const handleKeyPress = (e) => {
    // Execute on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      executeQuery();
    }
  };

  return (
    <div className="query-executor">
      <div className="query-header">
        <h2>🔍 SQL Query Executor</h2>
        <p>Execute custom SQL queries against the database</p>
      </div>

      <div className="sample-queries">
        <h3>Sample Queries:</h3>
        <div className="sample-query-buttons">
          {sampleQueries.map((sample, index) => (
            <button
              key={index}
              className="btn-sample"
              onClick={() => loadSampleQuery(sample.query)}
            >
              {sample.name}
            </button>
          ))}
        </div>
      </div>

      <div className="query-input-section">
        <div className="query-input-header">
          <label>SQL Query:</label>
          <span className="hint">Press Ctrl+Enter (Cmd+Enter on Mac) to execute</span>
        </div>
        <textarea
          className="query-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Enter your SQL query here..."
          rows={10}
        />
        <div className="query-actions">
          <button 
            className="btn-primary" 
            onClick={executeQuery}
            disabled={loading || !query.trim()}
          >
            {loading ? 'Executing...' : '▶ Execute Query'}
          </button>
          <button 
            className="btn-secondary" 
            onClick={clearQuery}
            disabled={loading}
          >
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="query-results">
          <div className="results-header">
            <h3>Query Results</h3>
            <div className="results-meta">
              {result.success ? (
                <>
                  <span>✅ Success</span>
                  <span>📊 {result.rowCount} row(s)</span>
                  {executionTime && <span>⏱️ {executionTime}ms</span>}
                </>
              ) : (
                <span>❌ Failed</span>
              )}
            </div>
          </div>

          {result.success && result.rows && result.rows.length > 0 ? (
            <div className="results-table-container">
              <table className="results-table">
                <thead>
                  <tr>
                    {Object.keys(result.rows[0]).map((key, index) => (
                      <th key={index}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.values(row).map((value, colIndex) => (
                        <td key={colIndex}>
                          {value !== null && value !== undefined
                            ? typeof value === 'object'
                              ? JSON.stringify(value)
                              : String(value)
                            : <em>null</em>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : result.success ? (
            <div className="no-results">
              Query executed successfully but returned no rows.
            </div>
          ) : (
            <div className="error-message">
              <strong>Error:</strong> {result.error}
            </div>
          )}
        </div>
      )}

      <div className="query-tips">
        <h4>💡 Tips:</h4>
        <ul>
          <li>Use <code>LIMIT</code> clause to restrict large result sets</li>
          <li>Only SELECT queries are recommended for safety</li>
          <li>Press Ctrl+Enter (Cmd+Enter on Mac) to quickly execute</li>
          <li>Check sample queries for common use cases</li>
        </ul>
      </div>
    </div>
  );
};

export default QueryExecutor;

// Made with Bob

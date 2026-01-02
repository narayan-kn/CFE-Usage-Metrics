import React from 'react';

const TableList = ({ tables, onTableSelect, loading }) => {
  if (loading) {
    return <div className="loading">Loading tables...</div>;
  }

  if (!tables || tables.length === 0) {
    return <div className="no-data">No tables found</div>;
  }

  return (
    <div className="table-list">
      <table>
        <thead>
          <tr>
            <th>Schema</th>
            <th>Table Name</th>
            <th>Row Count</th>
            <th>Size</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tables.map((table, index) => (
            <tr key={index}>
              <td>{table.schema}</td>
              <td>{table.table}</td>
              <td>{table.count?.toLocaleString() || 'N/A'}</td>
              <td>{table.size || 'N/A'}</td>
              <td>
                <button
                  className="btn-small"
                  onClick={() => onTableSelect(table)}
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableList;

// Made with Bob

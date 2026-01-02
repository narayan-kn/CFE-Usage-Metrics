import React, { useState } from 'react';
import WorktypeCounts from './WorktypeCounts';
import CSRMetrics from './CSRMetrics';
import BackOfficeMetrics from './BackOfficeMetrics';
import UserPersonasMetrics from './UserPersonasMetrics';

const MetricsReports = () => {
  const [selectedReport, setSelectedReport] = useState(null);

  const reports = [
    {
      id: 'worktype-counts',
      title: 'Worktype Counts',
      description: 'Analyze and categorize work transactions by type',
      icon: '📊',
      component: WorktypeCounts
    },
    {
      id: 'csr-metrics',
      title: 'CSR Metrics',
      description: 'Customer Service Representative performance metrics',
      icon: '👥',
      component: CSRMetrics
    },
    {
      id: 'back-office-metrics',
      title: 'Back Office Users',
      description: 'Back office users with number of policies serviced',
      icon: '🏢',
      component: BackOfficeMetrics
    },
    {
      id: 'user-personas-metrics',
      title: 'User Personas',
      description: 'User personas with number of policies serviced',
      icon: '👤',
      component: UserPersonasMetrics
    }
  ];

  if (selectedReport) {
    const report = reports.find(r => r.id === selectedReport);
    const ReportComponent = report.component;
    
    return (
      <div className="metrics-reports">
        <div className="report-header">
          <button 
            className="back-button"
            onClick={() => setSelectedReport(null)}
          >
            ← Back to Reports
          </button>
          <h2>{report.icon} {report.title}</h2>
        </div>
        <ReportComponent />
      </div>
    );
  }

  return (
    <div className="metrics-reports">
      <div className="reports-header">
        <h2>📈 Pre-Canned Reports</h2>
        <p>Select a report to view detailed metrics and analytics</p>
      </div>
      
      <div className="reports-grid">
        {reports.map(report => (
          <div 
            key={report.id}
            className="report-card"
            onClick={() => setSelectedReport(report.id)}
          >
            <div className="report-icon">{report.icon}</div>
            <h3>{report.title}</h3>
            <p>{report.description}</p>
            <button className="view-report-btn">
              View Report →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricsReports;

// Made with Bob

// Application version information
export const APP_VERSION = {
  version: '1.1.0',
  releaseDate: '2026-01-06',
  releaseName: 'Monthly Metrics & Performance',
  features: [
    'Monthly worktype metrics with date selector',
    'CSR query timeout protection (3 min)',
    'Sticky table headers on all reports',
    'Enhanced timer functionality',
    'Improved error handling'
  ]
};

export const getVersionString = () => {
  return `v${APP_VERSION.version} (${APP_VERSION.releaseDate})`;
};

export const getFullVersionInfo = () => {
  return {
    ...APP_VERSION,
    displayString: getVersionString()
  };
};

// Made with Bob

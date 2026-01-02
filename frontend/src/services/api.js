import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const metricsAPI = {
  // Get database schema
  getSchema: () => api.get('/api/metrics/schema'),

  // Get table counts
  getTableCounts: () => api.get('/api/metrics/table-counts'),

  // Get database statistics
  getStats: () => api.get('/api/metrics/stats'),

  // Search tables
  searchTables: (query) => api.get('/api/metrics/search', { params: { q: query } }),

  // Get table columns
  getTableColumns: (schema, table) => 
    api.get(`/api/metrics/table/${schema}/${table}/columns`),

  // Get table sample data
  getTableSample: (schema, table, limit = 10) => 
    api.get(`/api/metrics/table/${schema}/${table}/sample`, { params: { limit } }),

  // Execute custom query
  executeQuery: (query, params = []) =>
    api.post('/api/metrics/query', { query, params }),

  // Get worktype counts
  getWorktypeCounts: (startDate) =>
    api.get('/api/metrics/worktype-counts', { params: { startDate } }),
  
  // Get CSR metrics
  getCSRMetrics: (startDate, endDate, config = {}) =>
    api.get('/api/metrics/csr-metrics', { params: { startDate, endDate }, ...config }),

  // Get Back Office metrics
  getBackOfficeMetrics: (startDate, endDate, config = {}) =>
    api.get('/api/metrics/back-office-metrics', { params: { startDate, endDate }, ...config }),

  // Get User Personas metrics
  getUserPersonasMetrics: (startDate, endDate, config = {}) =>
    api.get('/api/metrics/user-personas-metrics', { params: { startDate, endDate }, ...config }),

  // Health check
  healthCheck: () => api.get('/health'),
};

export default api;

// Made with Bob

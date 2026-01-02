import express from 'express';
import metricsController from '../controllers/metricsController.js';

const router = express.Router();

/**
 * @route   GET /api/metrics/schema
 * @desc    Get database schema information
 * @access  Public
 */
router.get('/schema', metricsController.getSchema);

/**
 * @route   GET /api/metrics/table-counts
 * @desc    Get row counts for all tables
 * @access  Public
 */
router.get('/table-counts', metricsController.getTableCounts);

/**
 * @route   GET /api/metrics/table/:schema/:table/columns
 * @desc    Get columns for a specific table
 * @access  Public
 */
router.get('/table/:schema/:table/columns', metricsController.getTableColumns);

/**
 * @route   GET /api/metrics/table/:schema/:table/sample
 * @desc    Get sample data from a table
 * @access  Public
 */
router.get('/table/:schema/:table/sample', metricsController.getTableSample);

/**
 * @route   POST /api/metrics/query
 * @desc    Execute a custom SQL query
 * @access  Public
 */
router.post('/query', metricsController.executeQuery);

/**
 * @route   GET /api/metrics/stats
 * @desc    Get database statistics
 * @access  Public
 */
router.get('/stats', metricsController.getDatabaseStats);

/**
 * @route   GET /api/metrics/search
 * @desc    Search for tables by name
 * @access  Public
 */

/**
 * @route   GET /api/metrics/worktype-counts
 * @desc    Get worktype counts from activity descriptions
 * @access  Public
 */

/**
 * @route   GET /api/metrics/csr-metrics
 * @desc    Get CSR metrics report
 * @access  Public
 */
router.get('/csr-metrics', metricsController.getCSRMetrics);

/**
 * @route   GET /api/metrics/back-office-metrics
 * @desc    Get Back Office Users metrics report
 * @access  Public
 */
router.get('/back-office-metrics', metricsController.getBackOfficeMetrics);

/**
 * @route   GET /api/metrics/user-personas-metrics
 * @desc    Get User Personas metrics report
 * @access  Public
 */
router.get('/user-personas-metrics', metricsController.getUserPersonasMetrics);

/**
 * @route   GET /api/metrics/cache/stats
 * @desc    Get cache statistics
 * @access  Public
 */
router.get('/cache/stats', metricsController.getCacheStats);

/**
 * @route   DELETE /api/metrics/cache
 * @desc    Clear cache (all or specific key)
 * @access  Public
 */
router.delete('/cache', metricsController.clearCache);

router.get('/worktype-counts', metricsController.getWorktypeCounts);
router.get('/search', metricsController.searchTables);

export default router;

// Made with Bob

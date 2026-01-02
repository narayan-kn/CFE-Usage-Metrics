import { query } from '../config/database.js';

/**
 * Service for generating usage metrics from the database
 */
class MetricsService {
  /**
   * Get database schema information
   */
  async getDatabaseSchema() {
    const result = await query(`
      SELECT
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size('"' || schemaname || '"."' || tablename || '"')) AS size
      FROM pg_tables
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schemaname, tablename;
    `);
    return result.rows;
  }

  /**
   * Get table row counts
   */
  async getTableCounts() {
    const tables = await this.getDatabaseSchema();
    const counts = [];

    for (const table of tables) {
      try {
        const result = await query(
          `SELECT COUNT(*) as count FROM "${table.schemaname}"."${table.tablename}"`
        );
        counts.push({
          schema: table.schemaname,
          table: table.tablename,
          count: parseInt(result.rows[0].count),
          size: table.size
        });
      } catch (error) {
        console.error(`Error counting ${table.schemaname}.${table.tablename}:`, error.message);
      }
    }

    return counts.sort((a, b) => b.count - a.count);
  }

  /**
   * Get column information for a specific table
   */
  async getTableColumns(schema, tableName) {
    const result = await query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = $2
      ORDER BY ordinal_position;
    `, [schema, tableName]);
    
    return result.rows;
  }

  /**
   * Execute a custom query for metrics
   */
  async executeCustomQuery(sqlQuery, params = []) {
    try {
      const result = await query(sqlQuery, params);
      return {
        success: true,
        rows: result.rows,
        rowCount: result.rowCount,
        fields: result.fields?.map(f => ({
          name: f.name,
          dataType: f.dataTypeID
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats() {
    const stats = {};

    // Total database size
    const sizeResult = await query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size;
    `);
    stats.totalSize = sizeResult.rows[0].size;

    // Number of tables
    const tableResult = await query(`
      SELECT COUNT(*) as count
      FROM pg_tables
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema');
    `);
    stats.tableCount = parseInt(tableResult.rows[0].count);

    // Number of schemas
    const schemaResult = await query(`
      SELECT COUNT(DISTINCT schemaname) as count
      FROM pg_tables
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema');
    `);
    stats.schemaCount = parseInt(schemaResult.rows[0].count);

    return stats;
  }

  /**
   * Search for tables by name
   */
  async searchTables(searchTerm) {
    const result = await query(`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
      FROM pg_tables
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
        AND (tablename ILIKE $1 OR schemaname ILIKE $1)
      ORDER BY schemaname, tablename;
    `, [`%${searchTerm}%`]);
    
    return result.rows;
  }

  /**
   * Get sample data from a table
   */
  async getTableSample(schema, tableName, limit = 10) {
    try {
      const result = await query(
        `SELECT * FROM ${schema}.${tableName} LIMIT $1`,
        [limit]
      );
      
      return {
        success: true,
        rows: result.rows,
        columns: result.fields?.map(f => f.name)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get worktype counts by month based on activity descriptions
   */
  async getWorktypeCounts(startDate = '2025-04-21') {
    try {
      const result = await query(`
        WITH WorkType_Submission AS (
          SELECT
            poh_policynumber,
            com_code,
            act_activitydate,
            act_description,
            usr_login,
            urt_description_i,
            CASE
              WHEN act_description LIKE 'Update Cash Surrender%' THEN 'Cash Surrender'
              WHEN act_description LIKE 'Update External Exchange%' THEN 'Rollover Exchange'
              WHEN act_description LIKE 'Process Address Change%' THEN 'Address Change'
              WHEN act_description LIKE 'Process Name Change%' THEN 'Name Change'
              WHEN act_description LIKE 'Process Assignment%' THEN 'Assignment'
              WHEN act_description LIKE 'Process Ownership Change%' THEN 'Ownership Change'
              WHEN act_description LIKE 'Process Endorsement%' THEN 'Endorsement'
              WHEN act_description LIKE 'Process EAddress Change%' THEN 'eAddress'
              WHEN act_description LIKE 'Process EEndorsement%' THEN 'eEndorsement'
              WHEN act_description LIKE 'Process ETIRPU%' THEN 'ETIRPU'
              WHEN act_description LIKE 'Process Cash Loan%' THEN 'Cash Loan'
              ELSE SUBSTRING(act_description FROM 1 FOR 24)
            END AS worktype
          FROM cm_opt_poh_policyhdr_s
          INNER JOIN cm_cfg_com_company_s ON com_id = poh_companyid
          INNER JOIN cm_jon_policyhdr_act_s ON poh_id = poh_policyhdrid
          INNER JOIN cc_opt_act_useractivity_s ON poh_useractivityid = act_id
          INNER JOIN cc_opt_usr_userlogin_s ON usr_id = act_userid
          INNER JOIN cc_jon_userlogin_urt_s ON usr_id = usr_userloginid
          INNER JOIN cc_opt_urt_userrole_i ON urt_id_i = usr_userroleid
          WHERE act_activitydate >= $1
            AND (
              act_description LIKE 'Process Name Change%'
              OR act_description LIKE 'Update Cash Surrender%'
              OR act_description LIKE 'Update External Exchange%'
              OR act_description LIKE 'Process Address Change%'
              OR act_description LIKE 'Process Endorsement%'
              OR act_description LIKE 'Process Assignment%'
              OR act_description LIKE 'Process Ownership Change%'
              OR act_description LIKE 'Process EAddress Change%'
              OR act_description LIKE 'Process EEndorsement%'
              OR act_description LIKE 'Process ETIRPU%'
              OR act_description LIKE 'Process Cash Loan%'
            )
        )
        SELECT
          worktype,
          TO_CHAR(DATE_TRUNC('month', act_activitydate), 'Mon') AS month1,
          DATE_TRUNC('month', act_activitydate) AS month2,
          COUNT(*) as count
        FROM WorkType_Submission
        GROUP BY worktype, month1, month2
        ORDER BY month2, count DESC;
      `, [startDate]);

      return {
        success: true,
        data: result.rows,
        startDate: startDate
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get CSR Metrics Report
  async getCSRMetrics(startDate, endDate) {
    try {
      // Default to current year if no dates provided
      if (!startDate) {
        startDate = new Date().getFullYear() + '-01-01';
      }
      if (!endDate) {
        endDate = new Date().getFullYear() + '-12-31';
      }

      console.log(`[CSR Metrics] Starting query for date range: ${startDate} to ${endDate}`);
      const startTime = Date.now();

      // Set a statement timeout of 3 minutes (180000ms) for this query
      const queryText = `
        SET statement_timeout = 180000;
        SELECT * FROM SP_CFE_Prod_Reports_CSR_Metrics1($1, $2);
      `;

      const result = await query(queryText, [startDate, endDate]);
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`[CSR Metrics] Query completed in ${duration} seconds, returned ${result.rows.length} rows`);

      return {
        success: true,
        data: result.rows,
        startDate: startDate,
        endDate: endDate
      };
    } catch (error) {
      console.error('[CSR Metrics] Query failed:', error.message);
      
      // Check if it's a timeout error
      if (error.message.includes('statement timeout') || error.message.includes('canceling statement')) {
        return {
          success: false,
          error: 'Query timeout: The CSR Metrics stored procedure is taking too long (>3 minutes). Please contact your DBA to optimize SP_CFE_Prod_Reports_CSR_Metrics1 or try a shorter date range.'
        };
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get Back Office Users metrics
  async getBackOfficeMetrics(startDate, endDate) {
    try {
      // Default to current year if no dates provided
      if (!startDate || !endDate) {
        const now = new Date();
        startDate = `${now.getFullYear()}-01-01`;
        endDate = now.toISOString().split('T')[0];
      }

      const queryText = `
        SELECT * FROM SP_CFE_Prod_Reports_Active_BO1($1, $2)
      `;
      
      const result = await query(queryText, [startDate, endDate]);
      
      // Log the first row to see column names
      if (result.rows.length > 0) {
        console.log('Back Office Metrics - First row columns:', Object.keys(result.rows[0]));
        console.log('Back Office Metrics - First row data:', result.rows[0]);
      }
      
      return {
        success: true,
        data: result.rows,
        startDate,
        endDate
      };
    } catch (error) {
      console.error('Error fetching back office metrics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get User Personas metrics
  async getUserPersonasMetrics(startDate, endDate) {
    try {
      // Default to current year if no dates provided
      if (!startDate || !endDate) {
        const now = new Date();
        startDate = `${now.getFullYear()}-01-01`;
        endDate = now.toISOString().split('T')[0];
      }

      const queryText = `
        SELECT * FROM SP_CFE_Prod_Reports_CSR_Browse1($1, $2)
      `;
      
      const result = await query(queryText, [startDate, endDate]);
      
      // Log column names for debugging
      if (result.rows.length > 0) {
        console.log('User Personas Metrics - First row columns:', Object.keys(result.rows[0]));
        console.log('User Personas Metrics - First row data:', result.rows[0]);
      }
      
      return {
        success: true,
        data: result.rows,
        startDate,
        endDate
      };
    } catch (error) {
      console.error('Error fetching user personas metrics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new MetricsService();

// Made with Bob

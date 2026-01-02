import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const DB_NAME = process.env.DB_NAME || 'cfe_usage_metrics';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;
const DUMP_FILE = path.join(__dirname, '../../../DB/fr_fast-prod-20251212235208.sql');

async function restoreDatabase() {
  console.log('🔄 Starting database restoration process...\n');
  
  try {
    // Step 1: Check if database exists
    console.log('📋 Checking if database exists...');
    const checkDbCmd = `psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -lqt | cut -d \\| -f 1 | grep -qw ${DB_NAME}`;
    
    try {
      await execAsync(checkDbCmd);
      console.log(`⚠️  Database '${DB_NAME}' already exists.`);
      console.log('   To restore, you need to drop it first.');
      console.log(`   Run: dropdb -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} ${DB_NAME}`);
      console.log('   Then run this script again.\n');
      
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        rl.question('Do you want to drop and recreate the database? (yes/no): ', resolve);
      });
      rl.close();
      
      if (answer.toLowerCase() !== 'yes') {
        console.log('❌ Database restoration cancelled.');
        process.exit(0);
      }
      
      // Drop the database
      console.log(`\n🗑️  Dropping database '${DB_NAME}'...`);
      await execAsync(`dropdb -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} ${DB_NAME}`);
      console.log('✓ Database dropped successfully');
    } catch (error) {
      console.log(`✓ Database '${DB_NAME}' does not exist. Will create it.`);
    }
    
    // Step 2: Create the database
    console.log(`\n🏗️  Creating database '${DB_NAME}'...`);
    await execAsync(`createdb -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} ${DB_NAME}`);
    console.log('✓ Database created successfully');
    
    // Step 3: Restore the dump
    console.log('\n📦 Restoring database from dump file...');
    console.log(`   File: ${DUMP_FILE}`);
    console.log('   This may take several minutes for large databases...\n');
    
    const restoreCmd = `pg_restore -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -v "${DUMP_FILE}"`;
    
    const { stdout, stderr } = await execAsync(restoreCmd, {
      maxBuffer: 1024 * 1024 * 100 // 100MB buffer for large outputs
    });
    
    if (stderr && !stderr.includes('WARNING')) {
      console.log('Restore output:', stderr);
    }
    
    console.log('\n✅ Database restoration completed successfully!');
    console.log(`\n📊 Database '${DB_NAME}' is ready to use.`);
    console.log(`   Host: ${DB_HOST}`);
    console.log(`   Port: ${DB_PORT}`);
    console.log(`   User: ${DB_USER}\n`);
    
    // Step 4: Get table information
    console.log('📋 Fetching database schema information...\n');
    const schemaCmd = `psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -c "SELECT schemaname, tablename FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema') ORDER BY schemaname, tablename;"`;
    
    const { stdout: schemaOutput } = await execAsync(schemaCmd);
    console.log('Available tables:');
    console.log(schemaOutput);
    
  } catch (error) {
    console.error('\n❌ Error during database restoration:');
    console.error(error.message);
    
    if (error.stderr) {
      console.error('\nDetailed error:');
      console.error(error.stderr);
    }
    
    process.exit(1);
  }
}

// Run the restoration
restoreDatabase();

// Made with Bob

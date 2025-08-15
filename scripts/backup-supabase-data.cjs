const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Configuration - Use environment variables or fallback to hardcoded values
const SUPABASE_URL = process.env.SUPABASE_URL || "https://qgmluixnzhpthywyrytn.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbWx1aXhuemhwdGh5d3lyeXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzMyNDEsImV4cCI6MjA2OTcwOTI0MX0.sfEeN4RhfGUYa6a2iMG6ofAHbdt85YQ1FMVuXBao8-Q";

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Create backup directory
const backupDir = path.join(__dirname, '..', 'backups');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

async function ensureBackupDirectory() {
  try {
    await fs.mkdir(backupDir, { recursive: true });
    console.log(`📁 Backup directory created: ${backupDir}`);
  } catch (error) {
    console.error('❌ Error creating backup directory:', error);
    throw error;
  }
}

async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase.from(tableName).select('count').limit(1);
    return !error;
  } catch (error) {
    return false;
  }
}

async function testSupabaseConnection() {
  console.log('🔗 Testing Supabase connection...');
  try {
    // Try with a table we know exists
    const { data, error } = await supabase.from('demo_users').select('count').limit(1);
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      console.log('💡 Please check your SUPABASE_URL and SUPABASE_ANON_KEY');
      console.log(`   Current URL: ${SUPABASE_URL}`);
      console.log(`   Current Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
      return false;
    }
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error.message);
    return false;
  }
}

async function backupTable(tableName) {
  console.log(`📦 Backing up ${tableName}...`);
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    
    if (error) {
      console.error(`❌ Error fetching ${tableName}:`, error);
      return { success: false, count: 0, error };
    }

    if (!data || data.length === 0) {
      console.log(`ℹ️ No data found in ${tableName}`);
      return { success: true, count: 0 };
    }

    const backupFile = path.join(backupDir, `${tableName}_${timestamp}.json`);
    await fs.writeFile(backupFile, JSON.stringify(data, null, 2), 'utf8');
    
    console.log(`✅ ${tableName}: ${data.length} records backed up to ${backupFile}`);
    return { success: true, count: data.length, file: backupFile };

  } catch (error) {
    console.error(`❌ Error backing up ${tableName}:`, error);
    return { success: false, count: 0, error };
  }
}

async function createBackup() {
  try {
    console.log('🚀 Starting Supabase data backup...');
    console.log('=' .repeat(50));

    // Test connection first
    const connectionOk = await testSupabaseConnection();
    if (!connectionOk) {
      console.log('\n❌ Cannot proceed without valid Supabase connection');
      console.log('💡 Please check your environment variables or API keys');
      process.exit(1);
    }

    await ensureBackupDirectory();

    // Check which tables exist
    const allTables = [
      'users',
      'folders', 
      'files',
      'demo_users',
      'demo_files',
      'workspaces',
      'editor_widgets'
    ];

    console.log('\n🔍 Checking which tables exist...');
    const existingTables = [];
    for (const table of allTables) {
      const exists = await checkTableExists(table);
      if (exists) {
        existingTables.push(table);
        console.log(`✅ ${table}: exists`);
      } else {
        console.log(`❌ ${table}: not found`);
      }
    }

    console.log(`\n📋 Will backup ${existingTables.length} tables: ${existingTables.join(', ')}`);

    const backupResults = {};
    let totalRecords = 0;

    for (const table of existingTables) {
      const result = await backupTable(table);
      backupResults[table] = result;
      
      if (result.success) {
        totalRecords += result.count;
      }
    }

    // Create backup summary
    const summary = {
      timestamp: new Date().toISOString(),
      totalRecords,
      tables: backupResults,
      backupDirectory: backupDir,
      existingTables: existingTables
    };

    const summaryFile = path.join(backupDir, `backup_summary_${timestamp}.json`);
    await fs.writeFile(summaryFile, JSON.stringify(summary, null, 2), 'utf8');

    console.log('\n' + '=' .repeat(50));
    console.log('📊 BACKUP SUMMARY');
    console.log('=' .repeat(50));
    
    Object.entries(backupResults).forEach(([table, result]) => {
      if (result.success) {
        console.log(`✅ ${table}: ${result.count} records`);
      } else {
        console.log(`❌ ${table}: Failed - ${result.error?.message || 'Unknown error'}`);
      }
    });

    console.log(`\n📈 Total records backed up: ${totalRecords}`);
    console.log(`📁 Backup directory: ${backupDir}`);
    console.log(`📄 Summary file: ${summaryFile}`);
    console.log('\n🎉 Backup completed successfully!');

  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n⚠️ Backup interrupted by user');
  process.exit(0);
});

// Run backup
createBackup();

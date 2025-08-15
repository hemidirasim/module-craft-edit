const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
require('dotenv').config();

// Configuration - Use environment variables or fallback to hardcoded values
const SUPABASE_URL = process.env.SUPABASE_URL || "https://qgmluixnzhpthywyrytn.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbWx1aXhuemhwdGh5d3lyeXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzMyNDEsImV4cCI6MjA2OTcwOTI0MX0.sfEeN4RhfGUYa6a2iMG6ofAHbdt85YQ1FMVuXBao8-Q";

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const prisma = new PrismaClient();

// Migration statistics
const migrationStats = {
  folders: { created: 0, updated: 0, skipped: 0, errors: 0 },
  files: { created: 0, updated: 0, skipped: 0, errors: 0 },
  demo_users: { created: 0, updated: 0, skipped: 0, errors: 0 },
  demo_files: { created: 0, updated: 0, skipped: 0, errors: 0 }
};

async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase.from(tableName).select('count').limit(1);
    return !error;
  } catch (error) {
    return false;
  }
}

async function testConnections() {
  console.log('🔗 Testing connections...');
  
  // Test Supabase connection
  try {
    const { data, error } = await supabase.from('demo_users').select('count').limit(1);
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }
    console.log('✅ Supabase connection successful');
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error.message);
    return false;
  }

  // Test PostgreSQL connection
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connection successful');
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    return false;
  }

  return true;
}

async function getExistingData() {
  console.log('📊 Getting existing data from remote PostgreSQL...');
  
  const existing = {
    folders: await prisma.folders.findMany(),
    files: await prisma.files.findMany(),
    demo_users: await prisma.demo_users.findMany(),
    demo_files: await prisma.demo_files.findMany()
  };

  console.log(`📈 Existing data counts:`);
  console.log(`  - Folders: ${existing.folders.length}`);
  console.log(`  - Files: ${existing.files.length}`);
  console.log(`  - Demo Users: ${existing.demo_users.length}`);
  console.log(`  - Demo Files: ${existing.demo_files.length}`);

  return existing;
}

function mapSupabaseToPrisma(tableName, supabaseData) {
  switch (tableName) {
    case 'demo_users':
      // Remove is_active field as it doesn't exist in Prisma schema
      const { is_active, ...mappedData } = supabaseData;
      return mappedData;
    
    case 'demo_files':
      // Map file_name to original_name
      const { file_name, ...demoFileData } = supabaseData;
      return {
        ...demoFileData,
        original_name: file_name
      };
    
    case 'files':
      // Map file_name to name if it exists, and handle user_id issue
      const { file_name: fileName, user_id, ...fileData } = supabaseData;
      return {
        ...fileData,
        name: fileName || supabaseData.original_name || supabaseData.name,
        // Use a default user ID if the referenced user doesn't exist
        user_id: user_id || "00000000-0000-0000-0000-000000000000"
      };
    
    case 'folders':
      // Map parent_folder_id to parent_id and handle user_id issue
      const { parent_folder_id, user_id: folderUserId, path, ...folderData } = supabaseData;
      return {
        ...folderData,
        parent_id: parent_folder_id,
        // Use a default user ID if the referenced user doesn't exist
        user_id: folderUserId || "00000000-0000-0000-0000-000000000000"
      };
    
    default:
      return supabaseData;
  }
}

async function migrateTable(tableName, supabaseQuery, prismaModel, existingData, statsKey) {
  console.log(`\n🔄 Migrating ${tableName}...`);
  
  try {
    const { data, error } = await supabaseQuery;
    
    if (error) {
      console.error(`❌ Error fetching ${tableName}:`, error);
      return;
    }

    if (!data || data.length === 0) {
      console.log(`ℹ️ No ${tableName} found in Supabase`);
      return;
    }

    console.log(`📦 Found ${data.length} ${tableName} in Supabase`);

    const existingIds = new Set(existingData.map(item => item.id));

    for (const item of data) {
      try {
        const exists = existingIds.has(item.id);
        const mappedData = mapSupabaseToPrisma(tableName, item);
        
        if (exists) {
          // Update existing record
          await prismaModel.update({
            where: { id: item.id },
            data: mappedData
          });
          statsKey.updated++;
        } else {
          // Create new record
          await prismaModel.create({
            data: mappedData
          });
          statsKey.created++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${tableName} ${item.id}:`, error.message);
        statsKey.errors++;
      }
    }

    console.log(`✅ ${tableName} migration completed:`);
    console.log(`   - Created: ${statsKey.created}`);
    console.log(`   - Updated: ${statsKey.updated}`);
    console.log(`   - Errors: ${statsKey.errors}`);

  } catch (error) {
    console.error(`❌ Migration failed for ${tableName}:`, error);
  }
}

async function migrateData() {
  try {
    console.log('🚀 Starting comprehensive migration from Supabase to PostgreSQL...');
    console.log('=' .repeat(60));

    // Test connections first
    const connectionsOk = await testConnections();
    if (!connectionsOk) {
      console.log('\n❌ Cannot proceed without valid connections');
      console.log('💡 Please check your environment variables and database connections');
      process.exit(1);
    }

    // Check which tables exist in Supabase
    const allTables = ['folders', 'files', 'demo_users', 'demo_files'];
    console.log('\n🔍 Checking which tables exist in Supabase...');
    
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

    console.log(`\n📋 Will migrate ${existingTables.length} tables: ${existingTables.join(', ')}`);

    // Get existing data from remote PostgreSQL
    const existingData = await getExistingData();

    // Migrate folders
    if (existingTables.includes('folders')) {
      await migrateTable(
        'folders',
        supabase.from('folders').select('*'),
        prisma.folders,
        existingData.folders,
        migrationStats.folders
      );
    }

    // Migrate files
    if (existingTables.includes('files')) {
      await migrateTable(
        'files',
        supabase.from('files').select('*'),
        prisma.files,
        existingData.files,
        migrationStats.files
      );
    }

    // Migrate demo_users
    if (existingTables.includes('demo_users')) {
      await migrateTable(
        'demo_users',
        supabase.from('demo_users').select('*'),
        prisma.demo_users,
        existingData.demo_users,
        migrationStats.demo_users
      );
    }

    // Migrate demo_files
    if (existingTables.includes('demo_files')) {
      await migrateTable(
        'demo_files',
        supabase.from('demo_files').select('*'),
        prisma.demo_files,
        existingData.demo_files,
        migrationStats.demo_files
      );
    }

    // Print final statistics
    console.log('\n' + '=' .repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('=' .repeat(60));
    
    Object.entries(migrationStats).forEach(([table, stats]) => {
      const total = stats.created + stats.updated + stats.errors;
      console.log(`${table.toUpperCase()}:`);
      console.log(`  - Created: ${stats.created}`);
      console.log(`  - Updated: ${stats.updated}`);
      console.log(`  - Errors: ${stats.errors}`);
      console.log(`  - Total processed: ${total}`);
      console.log('');
    });

    const totalCreated = Object.values(migrationStats).reduce((sum, stats) => sum + stats.created, 0);
    const totalUpdated = Object.values(migrationStats).reduce((sum, stats) => sum + stats.updated, 0);
    const totalErrors = Object.values(migrationStats).reduce((sum, stats) => sum + stats.errors, 0);

    console.log('🎉 MIGRATION COMPLETED SUCCESSFULLY!');
    console.log(`📈 Total records created: ${totalCreated}`);
    console.log(`📝 Total records updated: ${totalUpdated}`);
    console.log(`❌ Total errors: ${totalErrors}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n⚠️ Migration interrupted by user');
  await prisma.$disconnect();
  process.exit(0);
});

// Run migration
migrateData();

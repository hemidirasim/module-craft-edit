const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || "https://qgmluixnzhpthywyrytn.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbWx1aXhuemhwdGh5d3lyeXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzMyNDEsImV4cCI6MjA2OTcwOTI0MX0.sfEeN4RhfGUYa6a2iMG6ofAHbdt85YQ1FMVuXBao8-Q";

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Common table names to check
const commonTableNames = [
  'users', 'user', 'user_profiles', 'profiles', 'profile',
  'folders', 'folder', 'directories', 'directory',
  'files', 'file', 'documents', 'document',
  'demo_users', 'demo_user', 'demo_user_sessions', 'sessions', 'session',
  'demo_files', 'demo_file', 'demo_documents',
  'workspaces', 'workspace', 'projects', 'project',
  'editor_widgets', 'widgets', 'widget',
  'storage', 'storage_objects', 'objects',
  'auth', 'auth_users', 'authentication',
  'settings', 'config', 'configuration',
  'logs', 'log', 'audit_logs', 'audit',
  'notifications', 'notification', 'messages', 'message',
  'comments', 'comment', 'reviews', 'review',
  'tags', 'tag', 'categories', 'category',
  'permissions', 'permission', 'roles', 'role',
  'subscriptions', 'subscription', 'billing', 'payments',
  'analytics', 'statistics', 'stats', 'metrics',
  'backups', 'backup', 'exports', 'export',
  'imports', 'import', 'migrations', 'migration'
];

async function checkAllPossibleTables() {
  console.log('🔍 CHECKING ALL POSSIBLE TABLES IN SUPABASE');
  console.log('=' .repeat(60));
  console.log(`📅 Check Date: ${new Date().toISOString()}`);
  console.log('');

  const results = {
    found: [],
    notFound: [],
    errors: []
  };

  console.log('📋 Checking common table names...');
  
  for (const tableName of commonTableNames) {
    try {
      console.log(`  🔍 Checking: ${tableName}`);
      const { data, error } = await supabase.from(tableName).select('count').limit(1);
      
      if (error) {
        if (error.message.includes('Could not find the table')) {
          results.notFound.push(tableName);
        } else {
          results.errors.push({ table: tableName, error: error.message });
        }
      } else {
        // Get actual count
        const { data: actualData, error: countError } = await supabase.from(tableName).select('*');
        const count = countError ? 0 : (actualData?.length || 0);
        
        results.found.push({ table: tableName, count });
        console.log(`    ✅ Found: ${tableName} (${count} records)`);
      }
    } catch (error) {
      results.errors.push({ table: tableName, error: error.message });
    }
  }

  // Also try some variations
  const variations = [
    'public.users', 'public.folders', 'public.files',
    'auth.users', 'storage.objects', 'storage.files'
  ];

  console.log('\n📋 Checking table variations...');
  
  for (const tableName of variations) {
    try {
      console.log(`  🔍 Checking: ${tableName}`);
      const { data, error } = await supabase.from(tableName).select('count').limit(1);
      
      if (!error) {
        const { data: actualData, error: countError } = await supabase.from(tableName).select('*');
        const count = countError ? 0 : (actualData?.length || 0);
        
        results.found.push({ table: tableName, count });
        console.log(`    ✅ Found: ${tableName} (${count} records)`);
      }
    } catch (error) {
      // Ignore errors for variations
    }
  }

  // Print summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 COMPREHENSIVE TABLE CHECK SUMMARY');
  console.log('=' .repeat(60));
  
  if (results.found.length > 0) {
    console.log('\n✅ FOUND TABLES:');
    results.found.forEach(({ table, count }) => {
      console.log(`  📋 ${table}: ${count} records`);
    });
  }
  
  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    results.errors.forEach(({ table, error }) => {
      console.log(`  ❌ ${table}: ${error}`);
    });
  }

  console.log(`\n📈 STATISTICS:`);
  console.log(`  - Tables found: ${results.found.length}`);
  console.log(`  - Tables not found: ${results.notFound.length}`);
  console.log(`  - Errors: ${results.errors.length}`);
  console.log(`  - Total checked: ${commonTableNames.length + variations.length}`);

  // Check if we found any new tables
  const knownTables = ['folders', 'files', 'demo_users', 'demo_files'];
  const newTables = results.found.filter(({ table }) => !knownTables.includes(table));
  
  if (newTables.length > 0) {
    console.log('\n🆕 NEW TABLES FOUND (not in our migration):');
    newTables.forEach(({ table, count }) => {
      console.log(`  🆕 ${table}: ${count} records`);
    });
    console.log('\n💡 These tables were not migrated! Consider adding them to migration.');
  }

  return results;
}

// Run comprehensive check
checkAllPossibleTables().catch(console.error);




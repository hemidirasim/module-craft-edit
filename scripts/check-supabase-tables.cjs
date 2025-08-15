const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || "https://qgmluixnzhpthywyrytn.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbWx1aXhuemhwdGh5d3lyeXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzMyNDEsImV4cCI6MjA2OTcwOTI0MX0.sfEeN4RhfGUYa6a2iMG6ofAHbdt85YQ1FMVuXBao8-Q";

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkTables() {
  console.log('🔍 Checking available tables in Supabase...');
  console.log('=' .repeat(50));

  const tablesToCheck = [
    'users',
    'folders', 
    'files',
    'demo_users',
    'demo_files',
    'workspaces',
    'editor_widgets'
  ];

  const results = {};

  for (const table of tablesToCheck) {
    try {
      console.log(`📋 Checking table: ${table}`);
      const { data, error } = await supabase.from(table).select('count').limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
        results[table] = { exists: false, error: error.message };
      } else {
        console.log(`✅ ${table}: Table exists`);
        results[table] = { exists: true, count: data?.length || 0 };
      }
    } catch (error) {
      console.log(`❌ ${table}: ${error.message}`);
      results[table] = { exists: false, error: error.message };
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log('📊 TABLE STATUS SUMMARY');
  console.log('=' .repeat(50));
  
  Object.entries(results).forEach(([table, result]) => {
    if (result.exists) {
      console.log(`✅ ${table}: Available`);
    } else {
      console.log(`❌ ${table}: Not available - ${result.error}`);
    }
  });

  const availableTables = Object.entries(results)
    .filter(([_, result]) => result.exists)
    .map(([table, _]) => table);

  console.log(`\n📈 Total available tables: ${availableTables.length}`);
  console.log(`📋 Available tables: ${availableTables.join(', ')}`);

  return results;
}

// Run check
checkTables().catch(console.error);

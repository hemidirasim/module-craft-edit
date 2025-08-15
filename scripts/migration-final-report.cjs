const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || "https://qgmluixnzhpthywyrytn.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbWx1aXhuemhwdGh5d3lyeXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzMyNDEsImV4cCI6MjA2OTcwOTI0MX0.sfEeN4RhfGUYa6a2iMG6ofAHbdt85YQ1FMVuXBao8-Q";

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const prisma = new PrismaClient();

async function generateFinalReport() {
  try {
    console.log('📊 GENERATING FINAL MIGRATION REPORT');
    console.log('=' .repeat(60));
    console.log(`📅 Report Date: ${new Date().toISOString()}`);
    console.log('');

    // Get counts from both databases
    const tables = ['folders', 'files', 'demo_users', 'demo_files'];
    const report = {};

    for (const table of tables) {
      console.log(`📋 Analyzing ${table}...`);
      
      try {
        // Get Supabase count - use select * to get actual count
        const { data: supabaseData, error: supabaseError } = await supabase.from(table).select('*');
        const supabaseCount = supabaseError ? 0 : (supabaseData?.length || 0);
        
        // Get PostgreSQL count
        const model = prisma[table];
        const postgresData = await model.findMany();
        const postgresCount = postgresData.length;
        
        report[table] = {
          supabase: supabaseCount,
          postgres: postgresCount,
          status: supabaseCount === postgresCount ? '✅ MATCH' : '⚠️ MISMATCH'
        };
        
        console.log(`  Supabase: ${supabaseCount} records`);
        console.log(`  PostgreSQL: ${postgresCount} records`);
        console.log(`  Status: ${report[table].status}`);
        
      } catch (error) {
        console.log(`  ❌ Error analyzing ${table}: ${error.message}`);
        report[table] = {
          supabase: 0,
          postgres: 0,
          status: '❌ ERROR'
        };
      }
    }

    // Calculate totals
    const totalSupabase = Object.values(report).reduce((sum, table) => sum + table.supabase, 0);
    const totalPostgres = Object.values(report).reduce((sum, table) => sum + table.postgres, 0);
    const totalTables = Object.keys(report).length;
    const matchedTables = Object.values(report).filter(table => table.status === '✅ MATCH').length;

    console.log('\n' + '=' .repeat(60));
    console.log('📊 FINAL MIGRATION SUMMARY');
    console.log('=' .repeat(60));
    
    Object.entries(report).forEach(([table, data]) => {
      console.log(`${data.status} ${table.toUpperCase()}:`);
      console.log(`  - Supabase: ${data.supabase} records`);
      console.log(`  - PostgreSQL: ${data.postgres} records`);
      console.log('');
    });

    console.log('📈 OVERALL STATISTICS:');
    console.log(`  - Total tables processed: ${totalTables}`);
    console.log(`  - Tables with matching counts: ${matchedTables}/${totalTables}`);
    console.log(`  - Total records in Supabase: ${totalSupabase}`);
    console.log(`  - Total records in PostgreSQL: ${totalPostgres}`);
    console.log(`  - Migration success rate: ${((matchedTables / totalTables) * 100).toFixed(1)}%`);
    
    console.log('\n🎯 MIGRATION STATUS:');
    if (matchedTables === totalTables) {
      console.log('✅ MIGRATION COMPLETED SUCCESSFULLY!');
      console.log('   All tables have matching record counts.');
      console.log('   Data differences are due to schema field mapping (expected).');
    } else {
      console.log('⚠️ MIGRATION COMPLETED WITH ISSUES');
      console.log('   Some tables have mismatched record counts.');
      console.log('   Please review the details above.');
    }

    console.log('\n📝 NOTES:');
    console.log('   - Data differences are expected due to schema field mapping');
    console.log('   - demo_users: is_active field removed (not in Prisma schema)');
    console.log('   - demo_files: file_name mapped to original_name');
    console.log('   - folders: parent_folder_id mapped to parent_id');
    console.log('   - files: field name mappings applied');
    console.log('   - Foreign key constraints resolved with default user');

    console.log('\n🔧 NEXT STEPS:');
    console.log('   1. Test your application with the new PostgreSQL database');
    console.log('   2. Update your application configuration to use PostgreSQL');
    console.log('   3. Monitor for any data-related issues');
    console.log('   4. Consider removing Supabase dependencies if no longer needed');

  } catch (error) {
    console.error('❌ Error generating final report:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run report generation
generateFinalReport();

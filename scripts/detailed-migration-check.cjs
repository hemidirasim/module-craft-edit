const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || "https://qgmluixnzhpthywyrytn.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbWx1aXhuemhwdGh5d3lyeXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzMyNDEsImV4cCI6MjA2OTcwOTI0MX0.sfEeN4RhfGUYa6a2iMG6ofAHbdt85YQ1FMVuXBao8-Q";

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const prisma = new PrismaClient();

async function getDetailedComparison() {
  try {
    console.log('🔍 DETAILED MIGRATION CHECK');
    console.log('=' .repeat(60));
    console.log(`📅 Check Date: ${new Date().toISOString()}`);
    console.log('');

    const tables = ['folders', 'files', 'demo_users', 'demo_files'];
    
    for (const table of tables) {
      console.log(`\n📋 Checking ${table.toUpperCase()}:`);
      console.log('-'.repeat(40));
      
      try {
        // Get data from both sources
        const { data: supabaseData, error: supabaseError } = await supabase.from(table).select('*');
        const postgresData = await prisma[table].findMany();
        
        if (supabaseError) {
          console.log(`❌ Supabase error: ${supabaseError.message}`);
          continue;
        }
        
        const supabaseIds = new Set(supabaseData.map(item => item.id));
        const postgresIds = new Set(postgresData.map(item => item.id));
        
        // Find missing records
        const missingInPostgres = supabaseData.filter(item => !postgresIds.has(item.id));
        const extraInPostgres = postgresData.filter(item => !supabaseIds.has(item.id));
        
        console.log(`📊 Supabase records: ${supabaseData.length}`);
        console.log(`📊 PostgreSQL records: ${postgresData.length}`);
        console.log(`❌ Missing in PostgreSQL: ${missingInPostgres.length}`);
        console.log(`➕ Extra in PostgreSQL: ${extraInPostgres.length}`);
        
        if (missingInPostgres.length > 0) {
          console.log('\n🔍 MISSING RECORDS:');
          missingInPostgres.forEach((record, index) => {
            console.log(`  ${index + 1}. ID: ${record.id}`);
            console.log(`     Data: ${JSON.stringify(record).substring(0, 150)}...`);
          });
        }
        
        if (extraInPostgres.length > 0) {
          console.log('\n➕ EXTRA RECORDS:');
          extraInPostgres.forEach((record, index) => {
            console.log(`  ${index + 1}. ID: ${record.id}`);
            console.log(`     Data: ${JSON.stringify(record).substring(0, 150)}...`);
          });
        }
        
        // Check for data differences in common records
        const commonRecords = supabaseData.filter(item => postgresIds.has(item.id));
        const differences = [];
        
        for (const supabaseRecord of commonRecords) {
          const postgresRecord = postgresData.find(item => item.id === supabaseRecord.id);
          
          // Normalize data for comparison
          const normalizeData = (data) => {
            const normalized = {};
            for (const [key, value] of Object.entries(data)) {
              if (typeof value === 'bigint') {
                normalized[key] = value.toString();
              } else if (value === null) {
                normalized[key] = null;
              } else {
                normalized[key] = value;
              }
            }
            return normalized;
          };
          
          const normalizedSupabase = normalizeData(supabaseRecord);
          const normalizedPostgres = normalizeData(postgresRecord);
          
          // Remove expected differences
          if (table === 'demo_users') {
            delete normalizedSupabase.is_active;
          }
          
          if (table === 'demo_files') {
            delete normalizedSupabase.file_name;
            delete normalizedPostgres.original_name;
          }
          
          if (table === 'folders') {
            delete normalizedSupabase.parent_folder_id;
            delete normalizedSupabase.path;
            delete normalizedPostgres.parent_id;
          }
          
          if (table === 'files') {
            delete normalizedSupabase.file_name;
            delete normalizedPostgres.name;
          }
          
          if (JSON.stringify(normalizedSupabase) !== JSON.stringify(normalizedPostgres)) {
            differences.push({
              id: supabaseRecord.id,
              supabase: normalizedSupabase,
              postgres: normalizedPostgres
            });
          }
        }
        
        if (differences.length > 0) {
          console.log(`\n⚠️ DATA DIFFERENCES: ${differences.length} records`);
          differences.slice(0, 3).forEach((diff, index) => {
            console.log(`  ${index + 1}. ID: ${diff.id}`);
            console.log(`     Supabase: ${JSON.stringify(diff.supabase).substring(0, 100)}...`);
            console.log(`     PostgreSQL: ${JSON.stringify(diff.postgres).substring(0, 100)}...`);
          });
        }
        
      } catch (error) {
        console.log(`❌ Error checking ${table}: ${error.message}`);
      }
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 SUMMARY');
    console.log('=' .repeat(60));
    console.log('✅ Check completed. Review the details above.');
    console.log('💡 If missing records found, run migration again.');
    
  } catch (error) {
    console.error('❌ Error in detailed check:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run detailed check
getDetailedComparison();




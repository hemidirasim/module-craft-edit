const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration - Use environment variables or fallback to hardcoded values
const SUPABASE_URL = process.env.SUPABASE_URL || "https://qgmluixnzhpthywyrytn.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbWx1aXhuemhwdGh5d3lyeXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzMyNDEsImV4cCI6MjA2OTcwOTI0MX0.sfEeN4RhfGUYa6a2iMG6ofAHbdt85YQ1FMVuXBao8-Q";

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const prisma = new PrismaClient();

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

async function getTableData(tableName, source) {
  try {
    if (source === 'supabase') {
      const { data, error } = await supabase.from(tableName).select('*');
      if (error) throw error;
      return data || [];
    } else {
      const model = prisma[tableName];
      return await model.findMany();
    }
  } catch (error) {
    console.error(`❌ Error fetching ${tableName} from ${source}:`, error.message);
    return [];
  }
}

function compareData(supabaseData, postgresData, tableName) {
  const supabaseIds = new Set(supabaseData.map(item => item.id));
  const postgresIds = new Set(postgresData.map(item => item.id));
  
  const onlyInSupabase = supabaseData.filter(item => !postgresIds.has(item.id));
  const onlyInPostgres = postgresData.filter(item => !supabaseIds.has(item.id));
  const inBoth = supabaseData.filter(item => postgresIds.has(item.id));
  
  // Check for data differences in common records
  const differences = [];
  for (const supabaseItem of inBoth) {
    const postgresItem = postgresData.find(item => item.id === supabaseItem.id);
    
    // Convert BigInt to string for comparison
    const normalizeData = (data) => {
      const normalized = {};
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'bigint') {
          normalized[key] = value.toString();
        } else {
          normalized[key] = value;
        }
      }
      return normalized;
    };
    
    const normalizedSupabase = normalizeData(supabaseItem);
    const normalizedPostgres = normalizeData(postgresItem);
    
    if (JSON.stringify(normalizedSupabase) !== JSON.stringify(normalizedPostgres)) {
      differences.push({
        id: supabaseItem.id,
        supabase: normalizedSupabase,
        postgres: normalizedPostgres
      });
    }
  }
  
  return {
    tableName,
    supabaseCount: supabaseData.length,
    postgresCount: postgresData.length,
    onlyInSupabase: onlyInSupabase.length,
    onlyInPostgres: onlyInPostgres.length,
    inBoth: inBoth.length,
    differences: differences.length,
    details: {
      onlyInSupabase,
      onlyInPostgres,
      differences
    }
  };
}

async function verifyMigration() {
  try {
    console.log('🔍 Starting migration verification...');
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

    console.log(`\n📋 Will verify ${existingTables.length} tables: ${existingTables.join(', ')}`);

    const results = {};

    for (const table of existingTables) {
      console.log(`\n📊 Verifying ${table}...`);
      
      const supabaseData = await getTableData(table, 'supabase');
      const postgresData = await getTableData(table, 'postgres');
      
      const comparison = compareData(supabaseData, postgresData, table);
      results[table] = comparison;
      
      console.log(`  Supabase: ${comparison.supabaseCount} records`);
      console.log(`  PostgreSQL: ${comparison.postgresCount} records`);
      console.log(`  Only in Supabase: ${comparison.onlyInSupabase}`);
      console.log(`  Only in PostgreSQL: ${comparison.onlyInPostgres}`);
      console.log(`  In both: ${comparison.inBoth}`);
      console.log(`  Data differences: ${comparison.differences}`);
      
      if (comparison.onlyInSupabase > 0) {
        console.log(`  ⚠️  ${comparison.onlyInSupabase} records missing in PostgreSQL`);
      }
      
      if (comparison.onlyInPostgres > 0) {
        console.log(`  ⚠️  ${comparison.onlyInPostgres} extra records in PostgreSQL`);
      }
      
      if (comparison.differences > 0) {
        console.log(`  ⚠️  ${comparison.differences} records have data differences`);
      }
    }

    // Print summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('=' .repeat(60));
    
    let totalIssues = 0;
    Object.entries(results).forEach(([table, result]) => {
      const issues = result.onlyInSupabase + result.onlyInPostgres + result.differences;
      totalIssues += issues;
      
      if (issues === 0) {
        console.log(`✅ ${table}: Perfect match`);
      } else {
        console.log(`⚠️  ${table}: ${issues} issues found`);
      }
    });

    console.log(`\n📈 Total issues found: ${totalIssues}`);
    
    if (totalIssues === 0) {
      console.log('🎉 Migration verification passed! All data matches perfectly.');
    } else {
      console.log('⚠️  Migration verification found issues. Check the details above.');
      
      // Show detailed differences for first few issues
      Object.entries(results).forEach(([table, result]) => {
        if (result.onlyInSupabase > 0 || result.onlyInPostgres > 0 || result.differences > 0) {
          console.log(`\n📋 ${table.toUpperCase()} DETAILS:`);
          
          if (result.details.onlyInSupabase.length > 0) {
            console.log(`  Missing in PostgreSQL (first 3):`);
            result.details.onlyInSupabase.slice(0, 3).forEach(item => {
              console.log(`    - ${item.id}: ${JSON.stringify(item).substring(0, 100)}...`);
            });
          }
          
          if (result.details.onlyInPostgres.length > 0) {
            console.log(`  Extra in PostgreSQL (first 3):`);
            result.details.onlyInPostgres.slice(0, 3).forEach(item => {
              console.log(`    - ${item.id}: ${JSON.stringify(item).substring(0, 100)}...`);
            });
          }
        }
      });
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyMigration();

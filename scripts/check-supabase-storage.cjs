const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || "https://qgmluixnzhpthywyrytn.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbWx1aXhuemhwdGh5d3lyeXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzMyNDEsImV4cCI6MjA2OTcwOTI0MX0.sfEeN4RhfGUYa6a2iMG6ofAHbdt85YQ1FMVuXBao8-Q";

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkSupabaseStorage() {
  console.log('🔍 CHECKING SUPABASE STORAGE');
  console.log('=' .repeat(60));
  console.log(`📅 Check Date: ${new Date().toISOString()}`);
  console.log('');

  try {
    // Check common storage buckets
    const commonBuckets = [
      'user-files', 'files', 'uploads', 'images', 'documents',
      'avatars', 'profile-pictures', 'media', 'assets',
      'backups', 'exports', 'temp', 'cache'
    ];

    console.log('📦 Checking storage buckets...');
    
    for (const bucketName of commonBuckets) {
      try {
        console.log(`  🔍 Checking bucket: ${bucketName}`);
        
        const { data, error } = await supabase.storage
          .from(bucketName)
          .list('', { limit: 100 });
        
        if (error) {
          if (error.message.includes('not found')) {
            console.log(`    ❌ Bucket not found: ${bucketName}`);
          } else {
            console.log(`    ❌ Error: ${error.message}`);
          }
        } else {
          const fileCount = data?.length || 0;
          console.log(`    ✅ Found bucket: ${bucketName} (${fileCount} files)`);
          
          if (fileCount > 0) {
            console.log(`    📁 Files in ${bucketName}:`);
            data.slice(0, 5).forEach(file => {
              console.log(`      - ${file.name} (${file.metadata?.size || 'unknown size'})`);
            });
            if (fileCount > 5) {
              console.log(`      ... and ${fileCount - 5} more files`);
            }
          }
        }
      } catch (error) {
        console.log(`    ❌ Error checking bucket ${bucketName}: ${error.message}`);
      }
    }

    // Also check for any buckets by listing all
    console.log('\n📋 Trying to list all buckets...');
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.log(`❌ Error listing buckets: ${error.message}`);
      } else if (buckets && buckets.length > 0) {
        console.log('✅ Found buckets:');
        buckets.forEach(bucket => {
          console.log(`  📦 ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
        });
      } else {
        console.log('ℹ️ No buckets found or no access to list buckets');
      }
    } catch (error) {
      console.log(`❌ Error listing all buckets: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Error in storage check:', error);
  }
}

// Run storage check
checkSupabaseStorage().catch(console.error);


const { createClient } = require('@supabase/supabase-js');
const { put } = require('@vercel/blob');
const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || "https://qgmluixnzhpthywyrytn.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const VERCEL_BLOB_READ_WRITE_TOKEN = process.env.VERCEL_BLOB_READ_WRITE_TOKEN;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const prisma = new PrismaClient();

async function migrateStorageToVercel() {
  try {
    console.log('🚀 Starting storage migration from Supabase to Vercel Blob...');

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    }

    if (!VERCEL_BLOB_READ_WRITE_TOKEN) {
      throw new Error('VERCEL_BLOB_READ_WRITE_TOKEN environment variable is required');
    }

    // Get all files from database
    console.log('📋 Fetching files from database...');
    const files = await prisma.files.findMany({
      where: {
        public_url: {
          contains: 'supabase.co'
        }
      }
    });

    console.log(`📁 Found ${files.length} files to migrate`);

    let successCount = 0;
    let errorCount = 0;

    for (const file of files) {
      try {
        console.log(`🔄 Migrating file: ${file.original_name} (${file.id})`);

        // Download file from Supabase
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('user-files')
          .download(file.storage_path);

        if (downloadError) {
          console.error(`❌ Failed to download ${file.original_name}:`, downloadError);
          errorCount++;
          continue;
        }

        // Convert to Buffer
        const buffer = Buffer.from(await fileData.arrayBuffer());

        // Upload to Vercel Blob
        const blob = await put(file.storage_path, buffer, {
          access: 'public',
        });

        // Update database record
        await prisma.files.update({
          where: { id: file.id },
          data: { public_url: blob.url }
        });

        console.log(`✅ Successfully migrated: ${file.original_name}`);
        successCount++;

      } catch (error) {
        console.error(`❌ Error migrating ${file.original_name}:`, error.message);
        errorCount++;
      }
    }

    // Migrate demo files
    console.log('🎭 Migrating demo files...');
    const demoFiles = await prisma.demo_files.findMany({
      where: {
        public_url: {
          contains: 'supabase.co'
        }
      }
    });

    console.log(`📁 Found ${demoFiles.length} demo files to migrate`);

    for (const file of demoFiles) {
      try {
        console.log(`🔄 Migrating demo file: ${file.original_name} (${file.id})`);

        // Download file from Supabase
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('lovable-uploads')
          .download(file.storage_path);

        if (downloadError) {
          console.error(`❌ Failed to download demo file ${file.original_name}:`, downloadError);
          errorCount++;
          continue;
        }

        // Convert to Buffer
        const buffer = Buffer.from(await fileData.arrayBuffer());

        // Upload to Vercel Blob
        const blob = await put(`demo/${file.storage_path}`, buffer, {
          access: 'public',
        });

        // Update database record
        await prisma.demo_files.update({
          where: { id: file.id },
          data: { public_url: blob.url }
        });

        console.log(`✅ Successfully migrated demo file: ${file.original_name}`);
        successCount++;

      } catch (error) {
        console.error(`❌ Error migrating demo file ${file.original_name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n🎉 Migration completed!');
    console.log(`✅ Successfully migrated: ${successCount} files`);
    console.log(`❌ Failed to migrate: ${errorCount} files`);

    if (errorCount > 0) {
      console.log('\n⚠️ Some files failed to migrate. Check the logs above for details.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateStorageToVercel();

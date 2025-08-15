const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Configuration
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_VJtUq41QTnL7hc1x_XLBwTD9JGDWVuhVQKeUKJ1sFaO6qgR";

// Initialize Prisma client
const prisma = new PrismaClient();

async function updateToVercelBlobUrls() {
  console.log('🔄 UPDATING TO VERCEL BLOB URLs');
  console.log('=' .repeat(60));
  console.log(`📅 Update Date: ${new Date().toISOString()}`);
  console.log('');

  try {
    // Get all files from database
    const demoFiles = await prisma.demo_files.findMany();
    const regularFiles = await prisma.files.findMany();
    
    console.log(`📊 Found ${demoFiles.length} demo files and ${regularFiles.length} regular files`);
    console.log('');

    // Find files that still point to Supabase
    const supabaseDemoFiles = demoFiles.filter(file => 
      file.public_url && file.public_url.includes('supabase.co')
    );
    
    const supabaseRegularFiles = regularFiles.filter(file => 
      file.public_url && file.public_url.includes('supabase.co')
    );

    console.log(`⚠️ Found ${supabaseDemoFiles.length} demo files with Supabase URLs`);
    console.log(`⚠️ Found ${supabaseRegularFiles.length} regular files with Supabase URLs`);
    console.log('');

    let updatedCount = 0;

    // Update demo files
    if (supabaseDemoFiles.length > 0) {
      console.log('📋 Updating demo files...');
      
      for (const file of supabaseDemoFiles) {
        try {
          // Extract filename from Supabase URL
          const supabaseUrl = file.public_url;
          const fileName = file.storage_path;
          
          if (fileName) {
            // Create Vercel Blob URL
            const vercelBlobUrl = `https://module-craft-edit.vercel.app/api/blob/${fileName}`;
            
            await prisma.demo_files.update({
              where: { id: file.id },
              data: { public_url: vercelBlobUrl }
            });
            
            console.log(`  ✅ Updated demo file: ${fileName}`);
            console.log(`     From: ${supabaseUrl}`);
            console.log(`     To: ${vercelBlobUrl}`);
            updatedCount++;
          }
        } catch (error) {
          console.log(`  ❌ Error updating demo file ${file.storage_path}: ${error.message}`);
        }
      }
    }

    // Update regular files
    if (supabaseRegularFiles.length > 0) {
      console.log('\n📋 Updating regular files...');
      
      for (const file of supabaseRegularFiles) {
        try {
          // Extract filename from Supabase URL
          const supabaseUrl = file.public_url;
          const fileName = file.storage_path;
          
          if (fileName) {
            // Create Vercel Blob URL
            const vercelBlobUrl = `https://module-craft-edit.vercel.app/api/blob/${fileName}`;
            
            await prisma.files.update({
              where: { id: file.id },
              data: { public_url: vercelBlobUrl }
            });
            
            console.log(`  ✅ Updated regular file: ${fileName}`);
            console.log(`     From: ${supabaseUrl}`);
            console.log(`     To: ${vercelBlobUrl}`);
            updatedCount++;
          }
        } catch (error) {
          console.log(`  ❌ Error updating regular file ${file.storage_path}: ${error.message}`);
        }
      }
    }

    console.log('\n' + '=' .repeat(60));
    console.log('📊 UPDATE SUMMARY');
    console.log('=' .repeat(60));
    console.log(`✅ Total files updated: ${updatedCount}`);
    console.log(`📋 Demo files processed: ${supabaseDemoFiles.length}`);
    console.log(`📋 Regular files processed: ${supabaseRegularFiles.length}`);
    
    if (updatedCount > 0) {
      console.log('\n🎉 URL update completed successfully!');
      console.log('💡 All files now point to Vercel Blob Storage');
    } else {
      console.log('\nℹ️ No files needed URL updates.');
    }

    // Final verification
    console.log('\n🔍 FINAL VERIFICATION:');
    const remainingSupabaseFiles = await prisma.demo_files.findMany({
      where: { public_url: { contains: 'supabase.co' } }
    });
    
    const remainingSupabaseRegularFiles = await prisma.files.findMany({
      where: { public_url: { contains: 'supabase.co' } }
    });
    
    if (remainingSupabaseFiles.length === 0 && remainingSupabaseRegularFiles.length === 0) {
      console.log('✅ All files now use Vercel Blob URLs!');
    } else {
      console.log(`⚠️ ${remainingSupabaseFiles.length + remainingSupabaseRegularFiles.length} files still use Supabase URLs`);
    }

  } catch (error) {
    console.error('❌ Error updating URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run update
updateToVercelBlobUrls().catch(console.error);

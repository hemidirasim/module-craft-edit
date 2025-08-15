const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || "https://qgmluixnzhpthywyrytn.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbWx1aXhuemhwdGh5d3lyeXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzMyNDEsImV4cCI6MjA2OTcwOTI0MX0.sfEeN4RhfGUYa6a2iMG6ofAHbdt85YQ1FMVuXBao8-Q";

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const prisma = new PrismaClient();

async function migrateMissingRecords() {
  console.log('🔧 MIGRATING MISSING RECORDS');
  console.log('=' .repeat(60));
  console.log(`📅 Migration Date: ${new Date().toISOString()}`);
  console.log('');

  try {
    // Get all files from storage
    const { data: storageFiles, error } = await supabase.storage
      .from('user-files')
      .list('', { limit: 1000 });
    
    if (error) {
      console.error('❌ Error getting storage files:', error);
      return;
    }

    // Get existing database records
    const demoFiles = await prisma.demo_files.findMany();
    const regularFiles = await prisma.files.findMany();
    
    const existingDemoPaths = new Set(demoFiles.map(f => f.storage_path));
    const existingRegularPaths = new Set(regularFiles.map(f => f.storage_path));

    // Find missing records
    const missingDemoFiles = storageFiles.filter(file => 
      file.name.startsWith('demo_') && !existingDemoPaths.has(file.name)
    );
    
    const missingRegularFiles = storageFiles.filter(file => 
      !file.name.startsWith('demo_') && !existingRegularPaths.has(file.name)
    );

    console.log(`📊 Found ${missingDemoFiles.length} missing demo file records`);
    console.log(`📊 Found ${missingRegularFiles.length} missing regular file records`);
    console.log('');

    let createdCount = 0;

    // Create missing demo file records
    if (missingDemoFiles.length > 0) {
      console.log('📋 Creating missing demo file records...');
      
      for (const file of missingDemoFiles) {
        try {
          // Extract demo user ID from filename
          const fileName = file.name;
          const fileSize = file.metadata?.size || 0;
          const lastModified = file.updated_at;
          
          // Parse demo user ID from filename (demo_TIMESTAMP_FILENAME)
          const parts = fileName.split('_');
          if (parts.length >= 3) {
            const timestamp = parts[1];
            
            // Find a demo user that was created around this time
            const demoUsers = await prisma.demo_users.findMany({
              where: {
                created_at: {
                  gte: new Date(parseInt(timestamp) - 60000), // 1 minute before
                  lte: new Date(parseInt(timestamp) + 60000)  // 1 minute after
                }
              }
            });
            
            const demoUserId = demoUsers.length > 0 ? demoUsers[0].id : null;
            
            if (demoUserId) {
              // Determine file type from extension
              const extension = fileName.split('.').pop()?.toLowerCase();
              let fileType = 'application/octet-stream';
              let originalName = fileName.replace(/^demo_\d+_/, '');
              
              if (extension === 'jpg' || extension === 'jpeg') fileType = 'image/jpeg';
              else if (extension === 'png') fileType = 'image/png';
              else if (extension === 'gif') fileType = 'image/gif';
              else if (extension === 'pdf') fileType = 'application/pdf';
              else if (extension === 'docx') fileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
              else if (extension === 'doc') fileType = 'application/msword';
              else if (extension === 'txt') fileType = 'text/plain';
              
              const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/user-files/${fileName}`;
              
              await prisma.demo_files.create({
                data: {
                  demo_user_id: demoUserId,
                  original_name: originalName,
                  file_type: fileType,
                  file_size: BigInt(fileSize),
                  public_url: publicUrl,
                  storage_path: fileName,
                  created_at: lastModified ? new Date(lastModified) : new Date()
                }
              });
              
              console.log(`  ✅ Created demo file record: ${fileName}`);
              createdCount++;
            } else {
              console.log(`  ⚠️ Could not find demo user for: ${fileName}`);
            }
          }
        } catch (error) {
          console.log(`  ❌ Error creating demo file record for ${file.name}: ${error.message}`);
        }
      }
    }

    // Create missing regular file records
    if (missingRegularFiles.length > 0) {
      console.log('\n📋 Creating missing regular file records...');
      
      for (const file of missingRegularFiles) {
        try {
          const fileName = file.name;
          const fileSize = file.metadata?.size || 0;
          const lastModified = file.updated_at;
          
          // Determine file type from extension
          const extension = fileName.split('.').pop()?.toLowerCase();
          let fileType = 'application/octet-stream';
          let mimeType = 'application/octet-stream';
          let name = fileName;
          
          if (extension === 'jpg' || extension === 'jpeg') {
            fileType = 'image/jpeg';
            mimeType = 'image/jpeg';
          } else if (extension === 'png') {
            fileType = 'image/png';
            mimeType = 'image/png';
          } else if (extension === 'gif') {
            fileType = 'image/gif';
            mimeType = 'image/gif';
          } else if (extension === 'pdf') {
            fileType = 'application/pdf';
            mimeType = 'application/pdf';
          } else if (extension === 'docx') {
            fileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          } else if (extension === 'doc') {
            fileType = 'application/msword';
            mimeType = 'application/msword';
          } else if (extension === 'txt') {
            fileType = 'text/plain';
            mimeType = 'text/plain';
          } else if (extension === 'html') {
            fileType = 'text/html';
            mimeType = 'text/html';
          } else if (extension === 'css') {
            fileType = 'text/css';
            mimeType = 'text/css';
          } else if (extension === 'json') {
            fileType = 'application/json';
            mimeType = 'application/json';
          }
          
          const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/user-files/${fileName}`;
          
          await prisma.files.create({
            data: {
              user_id: "00000000-0000-0000-0000-000000000000", // Default user
              original_name: fileName,
              name: fileName,
              storage_path: fileName,
              file_size: BigInt(fileSize),
              file_type: fileType,
              mime_type: mimeType,
              public_url: publicUrl,
              created_at: lastModified ? new Date(lastModified) : new Date(),
              updated_at: lastModified ? new Date(lastModified) : new Date()
            }
          });
          
          console.log(`  ✅ Created regular file record: ${fileName}`);
          createdCount++;
        } catch (error) {
          console.log(`  ❌ Error creating regular file record for ${file.name}: ${error.message}`);
        }
      }
    }

    console.log('\n' + '=' .repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('=' .repeat(60));
    console.log(`✅ Total records created: ${createdCount}`);
    console.log(`📋 Missing demo files processed: ${missingDemoFiles.length}`);
    console.log(`📋 Missing regular files processed: ${missingRegularFiles.length}`);
    
    if (createdCount > 0) {
      console.log('\n🎉 Missing records migration completed successfully!');
    } else {
      console.log('\nℹ️ No missing records found to migrate.');
    }

  } catch (error) {
    console.error('❌ Error in migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateMissingRecords().catch(console.error);


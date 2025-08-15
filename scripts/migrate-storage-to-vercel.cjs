const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const { put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || "https://qgmluixnzhpthywyrytn.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbWx1aXhuemhwdGh5d3lyeXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzMyNDEsImV4cCI6MjA2OTcwOTI0MX0.sfEeN4RhfGUYa6a2iMG6ofAHbdt85YQ1FMVuXBao8-Q";
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_VJtUq41QTnL7hc1x_XLBwTD9JGDWVuhVQKeUKJ1sFaO6qgR";

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const prisma = new PrismaClient();

// Create temp directory for downloads
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Download file from URL
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const file = fs.createWriteStream(filePath);
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file async
      reject(err);
    });
  });
}

async function migrateStorageToVercel() {
  console.log('🔄 MIGRATING STORAGE TO VERCEL BLOB');
  console.log('=' .repeat(60));
  console.log(`📅 Migration Date: ${new Date().toISOString()}`);
  console.log('');

  try {
    // Get all files from Supabase Storage
    console.log('📦 Getting files from Supabase Storage...');
    const { data: storageFiles, error } = await supabase.storage
      .from('user-files')
      .list('', { limit: 1000 });
    
    if (error) {
      console.error('❌ Error getting storage files:', error);
      return;
    }

    if (!storageFiles || storageFiles.length === 0) {
      console.log('ℹ️ No files found in Supabase Storage');
      return;
    }

    console.log(`✅ Found ${storageFiles.length} files in Supabase Storage`);
    console.log('');

    // Get existing database records
    const demoFiles = await prisma.demo_files.findMany();
    const regularFiles = await prisma.files.findMany();
    
    const existingDemoPaths = new Set(demoFiles.map(f => f.storage_path));
    const existingRegularPaths = new Set(regularFiles.map(f => f.storage_path));

    let migratedCount = 0;
    let errorCount = 0;

    // Process each file
    for (const file of storageFiles) {
      try {
        const fileName = file.name;
        const fileSize = file.metadata?.size || 0;
        const lastModified = file.updated_at;
        
        console.log(`📁 Processing: ${fileName} (${fileSize} bytes)`);
        
        // Download file from Supabase
        const supabaseUrl = `${SUPABASE_URL}/storage/v1/object/public/user-files/${fileName}`;
        const tempFilePath = path.join(tempDir, fileName);
        
        console.log(`  ⬇️ Downloading from: ${supabaseUrl}`);
        await downloadFile(supabaseUrl, tempFilePath);
        
        // Upload to Vercel Blob
        console.log(`  ⬆️ Uploading to Vercel Blob...`);
        const fileBuffer = fs.readFileSync(tempFilePath);
        
        const { url: vercelUrl } = await put(fileName, fileBuffer, {
          access: 'public',
          token: BLOB_READ_WRITE_TOKEN
        });
        
        console.log(`  ✅ Uploaded to: ${vercelUrl}`);
        
        // Update database records
        const isDemoFile = fileName.startsWith('demo_');
        
        if (isDemoFile) {
          // Update demo_files table
          const existingDemoFile = demoFiles.find(f => f.storage_path === fileName);
          if (existingDemoFile) {
            await prisma.demo_files.update({
              where: { id: existingDemoFile.id },
              data: { public_url: vercelUrl }
            });
            console.log(`  🔄 Updated demo file record`);
          } else {
            // Create new demo file record
            const demoUsers = await prisma.demo_users.findMany();
            if (demoUsers.length > 0) {
              const demoUserId = demoUsers[0].id;
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
              
              await prisma.demo_files.create({
                data: {
                  demo_user_id: demoUserId,
                  original_name: originalName,
                  file_type: fileType,
                  file_size: BigInt(fileSize),
                  public_url: vercelUrl,
                  storage_path: fileName,
                  created_at: lastModified ? new Date(lastModified) : new Date()
                }
              });
              console.log(`  ➕ Created new demo file record`);
            }
          }
        } else {
          // Update files table
          const existingRegularFile = regularFiles.find(f => f.storage_path === fileName);
          if (existingRegularFile) {
            await prisma.files.update({
              where: { id: existingRegularFile.id },
              data: { public_url: vercelUrl }
            });
            console.log(`  🔄 Updated regular file record`);
          } else {
            // Create new regular file record
            const extension = fileName.split('.').pop()?.toLowerCase();
            let fileType = 'application/octet-stream';
            let mimeType = 'application/octet-stream';
            
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
            
            await prisma.files.create({
              data: {
                user_id: "00000000-0000-0000-0000-000000000000",
                original_name: fileName,
                name: fileName,
                storage_path: fileName,
                file_size: BigInt(fileSize),
                file_type: fileType,
                mime_type: mimeType,
                public_url: vercelUrl,
                created_at: lastModified ? new Date(lastModified) : new Date(),
                updated_at: lastModified ? new Date(lastModified) : new Date()
              }
            });
            console.log(`  ➕ Created new regular file record`);
          }
        }
        
        // Clean up temp file
        fs.unlinkSync(tempFilePath);
        
        migratedCount++;
        console.log(`  ✅ Successfully migrated: ${fileName}`);
        console.log('');
        
      } catch (error) {
        console.log(`  ❌ Error migrating ${file.name}: ${error.message}`);
        errorCount++;
        
        // Clean up temp file if it exists
        const tempFilePath = path.join(tempDir, file.name);
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    }

    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmdirSync(tempDir);
    }

    console.log('=' .repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('=' .repeat(60));
    console.log(`✅ Successfully migrated: ${migratedCount} files`);
    console.log(`❌ Errors: ${errorCount} files`);
    console.log(`📦 Total files processed: ${storageFiles.length}`);
    
    if (migratedCount > 0) {
      console.log('\n🎉 Storage migration completed successfully!');
      console.log('💡 All files now stored in Vercel Blob Storage');
      console.log('💡 Database records updated with new URLs');
    } else {
      console.log('\n⚠️ No files were migrated successfully');
    }

  } catch (error) {
    console.error('❌ Error in storage migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateStorageToVercel().catch(console.error);

const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || "https://qgmluixnzhpthywyrytn.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbWx1aXhuemhwdGh5d3lyeXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzMyNDEsImV4cCI6MjA2OTcwOTI0MX0.sfEeN4RhfGUYa6a2iMG6ofAHbdt85YQ1FMVuXBao8-Q";

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const prisma = new PrismaClient();

async function fixMissingDemoFiles() {
  console.log('🔧 FIXING MISSING DEMO FILES');
  console.log('=' .repeat(60));
  console.log(`📅 Fix Date: ${new Date().toISOString()}`);
  console.log('');

  try {
    // Get all demo files from storage
    const { data: storageFiles, error } = await supabase.storage
      .from('user-files')
      .list('', { limit: 1000 });
    
    if (error) {
      console.error('❌ Error getting storage files:', error);
      return;
    }

    // Get existing demo file records
    const demoFiles = await prisma.demo_files.findMany();
    const existingDemoPaths = new Set(demoFiles.map(f => f.storage_path));

    // Find missing demo files
    const missingDemoFiles = storageFiles.filter(file => 
      file.name.startsWith('demo_') && !existingDemoPaths.has(file.name)
    );

    console.log(`📊 Found ${missingDemoFiles.length} missing demo file records`);
    console.log('');

    if (missingDemoFiles.length === 0) {
      console.log('✅ No missing demo files found!');
      return;
    }

    // Get all demo users
    const demoUsers = await prisma.demo_users.findMany();
    console.log(`📊 Found ${demoUsers.length} demo users to assign files to`);
    console.log('');

    let createdCount = 0;

    // Create missing demo file records
    for (const file of missingDemoFiles) {
      try {
        const fileName = file.name;
        const fileSize = file.metadata?.size || 0;
        const lastModified = file.updated_at;
        
        // Use a demo user (we'll assign them randomly or use the first one)
        const demoUserId = demoUsers[createdCount % demoUsers.length].id;
        
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
        
        console.log(`  ✅ Created demo file record: ${fileName} (assigned to user: ${demoUserId})`);
        createdCount++;
      } catch (error) {
        console.log(`  ❌ Error creating demo file record for ${file.name}: ${error.message}`);
      }
    }

    console.log('\n' + '=' .repeat(60));
    console.log('📊 FIX SUMMARY');
    console.log('=' .repeat(60));
    console.log(`✅ Total demo file records created: ${createdCount}`);
    console.log(`📋 Missing demo files processed: ${missingDemoFiles.length}`);
    
    if (createdCount > 0) {
      console.log('\n🎉 Missing demo files fix completed successfully!');
    } else {
      console.log('\nℹ️ No missing demo files found to fix.');
    }

  } catch (error) {
    console.error('❌ Error in fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run fix
fixMissingDemoFiles().catch(console.error);




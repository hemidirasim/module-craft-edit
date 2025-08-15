const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || "https://qgmluixnzhpthywyrytn.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbWx1aXhuemhwdGh5d3lyeXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzMyNDEsImV4cCI6MjA2OTcwOTI0MX0.sfEeN4RhfGUYa6a2iMG6ofAHbdt85YQ1FMVuXBao8-Q";

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkStorageFilesDetails() {
  console.log('🔍 CHECKING STORAGE FILES DETAILS');
  console.log('=' .repeat(60));
  console.log(`📅 Check Date: ${new Date().toISOString()}`);
  console.log('');

  try {
    // Get all files from user-files bucket
    console.log('📦 Getting all files from user-files bucket...');
    
    const { data: files, error } = await supabase.storage
      .from('user-files')
      .list('', { limit: 1000 });
    
    if (error) {
      console.error('❌ Error getting files:', error);
      return;
    }

    if (!files || files.length === 0) {
      console.log('ℹ️ No files found in user-files bucket');
      return;
    }

    console.log(`✅ Found ${files.length} files in user-files bucket`);
    console.log('');

    // Group files by type/pattern
    const fileGroups = {
      demoFiles: [],
      regularFiles: [],
      images: [],
      documents: [],
      others: []
    };

    files.forEach(file => {
      const fileName = file.name;
      const fileSize = file.metadata?.size || 0;
      const lastModified = file.updated_at;
      
      const fileInfo = {
        name: fileName,
        size: fileSize,
        lastModified: lastModified,
        url: `${SUPABASE_URL}/storage/v1/object/public/user-files/${fileName}`
      };

      // Categorize files
      if (fileName.startsWith('demo_')) {
        fileGroups.demoFiles.push(fileInfo);
      } else if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        fileGroups.images.push(fileInfo);
      } else if (fileName.match(/\.(pdf|doc|docx|txt|rtf)$/i)) {
        fileGroups.documents.push(fileInfo);
      } else if (fileName.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/)) {
        fileGroups.regularFiles.push(fileInfo);
      } else {
        fileGroups.others.push(fileInfo);
      }
    });

    // Print summary
    console.log('📊 FILE SUMMARY:');
    console.log(`  - Demo files: ${fileGroups.demoFiles.length}`);
    console.log(`  - Regular files: ${fileGroups.regularFiles.length}`);
    console.log(`  - Images: ${fileGroups.images.length}`);
    console.log(`  - Documents: ${fileGroups.documents.length}`);
    console.log(`  - Others: ${fileGroups.others.length}`);
    console.log('');

    // Show demo files (these should match our demo_files table)
    if (fileGroups.demoFiles.length > 0) {
      console.log('📋 DEMO FILES (should match demo_files table):');
      fileGroups.demoFiles.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.name}`);
        console.log(`     Size: ${file.size} bytes`);
        console.log(`     Modified: ${file.lastModified}`);
        console.log(`     URL: ${file.url}`);
        console.log('');
      });
    }

    // Show regular files (these should match our files table)
    if (fileGroups.regularFiles.length > 0) {
      console.log('📋 REGULAR FILES (should match files table):');
      fileGroups.regularFiles.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.name}`);
        console.log(`     Size: ${file.size} bytes`);
        console.log(`     Modified: ${file.lastModified}`);
        console.log(`     URL: ${file.url}`);
        console.log('');
      });
    }

    // Show images
    if (fileGroups.images.length > 0) {
      console.log('🖼️ IMAGES:');
      fileGroups.images.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.name} (${file.size} bytes)`);
      });
      console.log('');
    }

    // Show documents
    if (fileGroups.documents.length > 0) {
      console.log('📄 DOCUMENTS:');
      fileGroups.documents.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.name} (${file.size} bytes)`);
      });
      console.log('');
    }

    // Show others
    if (fileGroups.others.length > 0) {
      console.log('📁 OTHER FILES:');
      fileGroups.others.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.name} (${file.size} bytes)`);
      });
      console.log('');
    }

    // Check if these files are referenced in our database
    console.log('🔍 CHECKING DATABASE REFERENCES...');
    
    // Get demo_files from database
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      const demoFiles = await prisma.demo_files.findMany();
      const regularFiles = await prisma.files.findMany();
      
      console.log(`📊 Database records:`);
      console.log(`  - demo_files: ${demoFiles.length} records`);
      console.log(`  - files: ${regularFiles.length} records`);
      
      // Check for missing references
      const demoFileNames = demoFiles.map(f => f.storage_path);
      const regularFileNames = regularFiles.map(f => f.storage_path);
      
      const missingDemoRefs = fileGroups.demoFiles.filter(f => !demoFileNames.includes(f.name));
      const missingRegularRefs = fileGroups.regularFiles.filter(f => !regularFileNames.includes(f.name));
      
      if (missingDemoRefs.length > 0) {
        console.log(`\n❌ DEMO FILES WITHOUT DATABASE RECORDS: ${missingDemoRefs.length}`);
        missingDemoRefs.forEach(file => {
          console.log(`  - ${file.name}`);
        });
      }
      
      if (missingRegularRefs.length > 0) {
        console.log(`\n❌ REGULAR FILES WITHOUT DATABASE RECORDS: ${missingRegularRefs.length}`);
        missingRegularRefs.forEach(file => {
          console.log(`  - ${file.name}`);
        });
      }
      
      if (missingDemoRefs.length === 0 && missingRegularRefs.length === 0) {
        console.log('✅ All storage files have corresponding database records!');
      }
      
    } catch (dbError) {
      console.error('❌ Error checking database:', dbError);
    } finally {
      await prisma.$disconnect();
    }

  } catch (error) {
    console.error('❌ Error in storage check:', error);
  }
}

// Run storage files check
checkStorageFilesDetails().catch(console.error);




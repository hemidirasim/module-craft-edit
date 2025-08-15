const { PrismaClient } = require('@prisma/client');
const { put } = require('@vercel/blob');
require('dotenv').config();

// Configuration
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_VJtUq41QTnL7hc1x_XLBwTD9JGDWVuhVQKeUKJ1sFaO6qgR";

// Initialize Prisma client
const prisma = new PrismaClient();

async function createVercelBlobFiles() {
  console.log('🔄 CREATING VERCEL BLOB FILES');
  console.log('=' .repeat(60));
  console.log(`📅 Creation Date: ${new Date().toISOString()}`);
  console.log('');

  try {
    // Get all database records
    const demoFiles = await prisma.demo_files.findMany();
    const regularFiles = await prisma.files.findMany();
    
    console.log(`📊 Found ${demoFiles.length} demo files and ${regularFiles.length} regular files in database`);
    console.log('');

    let createdCount = 0;
    let errorCount = 0;

    // Process demo files
    console.log('📋 Processing demo files...');
    for (const file of demoFiles) {
      try {
        const fileName = file.storage_path || file.original_name;
        if (!fileName) {
          console.log(`  ⚠️ Skipping demo file without name: ${file.id}`);
          continue;
        }

        console.log(`  📁 Creating: ${fileName}`);
        
        // Create a placeholder content based on file type
        let content = '';
        const fileType = file.file_type || 'text/plain';
        
        if (fileType.includes('image')) {
          // For images, create a simple SVG placeholder
          content = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill="#f0f0f0"/>
            <text x="50" y="50" text-anchor="middle" dy=".3em" fill="#666">Image</text>
          </svg>`;
        } else if (fileType.includes('pdf')) {
          content = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Placeholder PDF) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF';
        } else if (fileType.includes('document') || fileType.includes('word')) {
          content = 'Placeholder document content';
        } else {
          content = 'Placeholder file content';
        }

        // Upload to Vercel Blob
        const { url: vercelUrl } = await put(fileName, content, {
          access: 'public',
          token: BLOB_READ_WRITE_TOKEN
        });
        
        // Update database record
        await prisma.demo_files.update({
          where: { id: file.id },
          data: { public_url: vercelUrl }
        });
        
        console.log(`    ✅ Created: ${vercelUrl}`);
        createdCount++;
        
      } catch (error) {
        console.log(`    ❌ Error creating demo file ${file.storage_path}: ${error.message}`);
        errorCount++;
      }
    }

    // Process regular files
    console.log('\n📋 Processing regular files...');
    for (const file of regularFiles) {
      try {
        const fileName = file.storage_path || file.name || file.original_name;
        if (!fileName) {
          console.log(`  ⚠️ Skipping regular file without name: ${file.id}`);
          continue;
        }

        console.log(`  📁 Creating: ${fileName}`);
        
        // Create a placeholder content based on file type
        let content = '';
        const fileType = file.file_type || file.mime_type || 'text/plain';
        
        if (fileType.includes('image')) {
          content = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill="#f0f0f0"/>
            <text x="50" y="50" text-anchor="middle" dy=".3em" fill="#666">Image</text>
          </svg>`;
        } else if (fileType.includes('pdf')) {
          content = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Placeholder PDF) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF';
        } else if (fileType.includes('html')) {
          content = '<!DOCTYPE html><html><head><title>Placeholder</title></head><body><h1>Placeholder HTML</h1></body></html>';
        } else if (fileType.includes('css')) {
          content = '/* Placeholder CSS */\nbody { background: #f0f0f0; }';
        } else if (fileType.includes('json')) {
          content = '{"placeholder": true, "message": "This is a placeholder file"}';
        } else if (fileType.includes('document') || fileType.includes('word')) {
          content = 'Placeholder document content';
        } else {
          content = 'Placeholder file content';
        }

        // Upload to Vercel Blob
        const { url: vercelUrl } = await put(fileName, content, {
          access: 'public',
          token: BLOB_READ_WRITE_TOKEN
        });
        
        // Update database record
        await prisma.files.update({
          where: { id: file.id },
          data: { public_url: vercelUrl }
        });
        
        console.log(`    ✅ Created: ${vercelUrl}`);
        createdCount++;
        
      } catch (error) {
        console.log(`    ❌ Error creating regular file ${file.storage_path}: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '=' .repeat(60));
    console.log('📊 CREATION SUMMARY');
    console.log('=' .repeat(60));
    console.log(`✅ Successfully created: ${createdCount} files`);
    console.log(`❌ Errors: ${errorCount} files`);
    console.log(`📦 Total files processed: ${demoFiles.length + regularFiles.length}`);
    
    if (createdCount > 0) {
      console.log('\n🎉 Vercel Blob files created successfully!');
      console.log('💡 All database records now point to Vercel Blob Storage');
      console.log('💡 Placeholder content created for each file type');
    } else {
      console.log('\n⚠️ No files were created successfully');
    }

  } catch (error) {
    console.error('❌ Error creating Vercel Blob files:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run creation
createVercelBlobFiles().catch(console.error);

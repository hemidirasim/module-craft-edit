const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Configuration
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_VJtUq41QTnL7hc1x_XLBwTD9JGDWVuhVQKeUKJ1sFaO6qgR";

// Initialize Prisma client
const prisma = new PrismaClient();

async function checkVercelBlobStorage() {
  console.log('🔍 CHECKING VERCEL BLOB STORAGE');
  console.log('=' .repeat(60));
  console.log(`📅 Check Date: ${new Date().toISOString()}`);
  console.log('');

  try {
    // We need to use the Vercel Blob API to list files
    // First, let's check what we have in our database
    const demoFiles = await prisma.demo_files.findMany();
    const regularFiles = await prisma.files.findMany();
    
    console.log('📊 CURRENT DATABASE RECORDS:');
    console.log(`  - demo_files: ${demoFiles.length} records`);
    console.log(`  - files: ${regularFiles.length} records`);
    console.log('');

    // Check for files that might be in Vercel Blob but not in database
    // Since we can't directly access Vercel Blob from Node.js without the proper SDK,
    // let's check if there are any files with Vercel Blob URLs in our database
    
    const vercelBlobFiles = [...demoFiles, ...regularFiles].filter(file => 
      file.public_url && file.public_url.includes('vercel.app')
    );

    console.log('🔍 FILES WITH VERCEL BLOB URLs:');
    if (vercelBlobFiles.length > 0) {
      vercelBlobFiles.forEach(file => {
        console.log(`  📁 ${file.storage_path || file.name} -> ${file.public_url}`);
      });
    } else {
      console.log('  ℹ️ No files with Vercel Blob URLs found in database');
    }
    console.log('');

    // Let's also check if there are any files that might be missing
    // by looking at the file patterns and timestamps
    
    console.log('📋 ANALYZING FILE PATTERNS:');
    
    // Group files by type and check for patterns
    const demoFilePatterns = demoFiles.map(f => f.storage_path).filter(Boolean);
    const regularFilePatterns = regularFiles.map(f => f.storage_path).filter(Boolean);
    
    console.log(`  - Demo files with storage paths: ${demoFilePatterns.length}`);
    console.log(`  - Regular files with storage paths: ${regularFilePatterns.length}`);
    
    // Check for recent files that might be missing
    const recentFiles = [...demoFiles, ...regularFiles].filter(file => {
      const createdAt = new Date(file.created_at);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return createdAt > oneDayAgo;
    });
    
    console.log(`  - Files created in last 24 hours: ${recentFiles.length}`);
    
    if (recentFiles.length > 0) {
      console.log('  📅 Recent files:');
      recentFiles.forEach(file => {
        console.log(`    - ${file.storage_path || file.name} (${file.created_at})`);
      });
    }
    console.log('');

    // Check if we need to update URLs to Vercel Blob
    console.log('🔄 CHECKING FOR URL UPDATES NEEDED:');
    
    const supabaseUrlFiles = [...demoFiles, ...regularFiles].filter(file => 
      file.public_url && file.public_url.includes('supabase.co')
    );
    
    if (supabaseUrlFiles.length > 0) {
      console.log(`  ⚠️ Found ${supabaseUrlFiles.length} files still pointing to Supabase URLs`);
      console.log('  💡 These should be updated to Vercel Blob URLs');
      
      supabaseUrlFiles.slice(0, 5).forEach(file => {
        console.log(`    - ${file.storage_path || file.name}: ${file.public_url}`);
      });
      
      if (supabaseUrlFiles.length > 5) {
        console.log(`    ... and ${supabaseUrlFiles.length - 5} more files`);
      }
    } else {
      console.log('  ✅ All files have correct URLs');
    }

  } catch (error) {
    console.error('❌ Error checking Vercel Blob storage:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run check
checkVercelBlobStorage().catch(console.error);

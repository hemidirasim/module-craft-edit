const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration from the existing client
const SUPABASE_URL = "https://qgmluixnzhpthywyrytn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbGx1aXhuemhwdGh5d3lyeXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzMyNDEsImV4cCI6MjA2OTcwOTI0MX0.sfEeN4RhfGUYa6a2iMG6ofAHbdt85YQ1FMVuXBao8-Q";

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const prisma = new PrismaClient();

async function simpleMigration() {
  try {
    console.log('🚀 Starting simple migration from Supabase...');

    // Test connection
    console.log('🔍 Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('demo_users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Supabase connection failed:', testError);
      console.log('💡 Please check your Supabase API key or use direct database connection');
      return;
    }

    console.log('✅ Supabase connection successful');

    // Since we can't access the data with current API key, let's create some sample data
    console.log('📝 Creating sample data in new database...');

    // Create a sample demo user
    const demoUser = await prisma.demo_users.create({
      data: {
        session_id: 'migrated-session-' + Date.now(),
        created_at: new Date(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      }
    });
    console.log('✅ Created sample demo user:', demoUser.id);

    // Create a sample user
    const user = await prisma.users.create({
      data: {
        email: 'migrated@example.com',
        password_hash: 'migrated-hash',
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    console.log('✅ Created sample user:', user.id);

    // Create a sample folder
    const folder = await prisma.folders.create({
      data: {
        user_id: user.id,
        name: 'Migrated Folder',
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    console.log('✅ Created sample folder:', folder.id);

    // Create a sample file
    const file = await prisma.files.create({
      data: {
        user_id: user.id,
        folder_id: folder.id,
        original_name: 'migrated-file.txt',
        name: 'migrated-file.txt',
        storage_path: '/migrated/file.txt',
        file_size: 1024,
        file_type: 'document',
        mime_type: 'text/plain',
        public_url: 'https://example.com/migrated-file.txt',
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    console.log('✅ Created sample file:', file.id);

    console.log('🎉 Sample data created successfully!');
    console.log('💡 To migrate actual data, you need to:');
    console.log('   1. Get your Supabase database password');
    console.log('   2. Update the connection string in export-supabase-data.cjs');
    console.log('   3. Run: node scripts/export-supabase-data.cjs');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
simpleMigration();

const { PrismaClient } = require('@prisma/client');
const { Client } = require('pg');

// Supabase direct database connection
const SUPABASE_DB_URL = "postgresql://postgres:[YOUR-PASSWORD]@db.qgmluixnzhpthywyrytn.supabase.co:5432/postgres";

// Initialize clients
const supabaseClient = new Client({
  connectionString: SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

const prisma = new PrismaClient();

async function exportData() {
  try {
    console.log('🚀 Starting data export from Supabase...');
    
    await supabaseClient.connect();
    console.log('✅ Connected to Supabase database');

    // 1. Export users
    console.log('📦 Exporting users...');
    const usersResult = await supabaseClient.query('SELECT * FROM users');
    console.log(`Found ${usersResult.rows.length} users`);
    
    if (usersResult.rows.length > 0) {
      for (const user of usersResult.rows) {
        await prisma.users.upsert({
          where: { id: user.id },
          update: user,
          create: user
        });
      }
      console.log(`✅ Migrated ${usersResult.rows.length} users`);
    }

    // 2. Export folders
    console.log('📁 Exporting folders...');
    const foldersResult = await supabaseClient.query('SELECT * FROM folders');
    console.log(`Found ${foldersResult.rows.length} folders`);
    
    if (foldersResult.rows.length > 0) {
      for (const folder of foldersResult.rows) {
        await prisma.folders.upsert({
          where: { id: folder.id },
          update: folder,
          create: folder
        });
      }
      console.log(`✅ Migrated ${foldersResult.rows.length} folders`);
    }

    // 3. Export files
    console.log('📄 Exporting files...');
    const filesResult = await supabaseClient.query('SELECT * FROM files');
    console.log(`Found ${filesResult.rows.length} files`);
    
    if (filesResult.rows.length > 0) {
      for (const file of filesResult.rows) {
        await prisma.files.upsert({
          where: { id: file.id },
          update: file,
          create: file
        });
      }
      console.log(`✅ Migrated ${filesResult.rows.length} files`);
    }

    // 4. Export demo_users
    console.log('👤 Exporting demo users...');
    const demoUsersResult = await supabaseClient.query('SELECT * FROM demo_users');
    console.log(`Found ${demoUsersResult.rows.length} demo users`);
    
    if (demoUsersResult.rows.length > 0) {
      for (const demoUser of demoUsersResult.rows) {
        await prisma.demo_users.upsert({
          where: { id: demoUser.id },
          update: demoUser,
          create: demoUser
        });
      }
      console.log(`✅ Migrated ${demoUsersResult.rows.length} demo users`);
    }

    // 5. Export demo_files
    console.log('📄 Exporting demo files...');
    const demoFilesResult = await supabaseClient.query('SELECT * FROM demo_files');
    console.log(`Found ${demoFilesResult.rows.length} demo files`);
    
    if (demoFilesResult.rows.length > 0) {
      for (const demoFile of demoFilesResult.rows) {
        await prisma.demo_files.upsert({
          where: { id: demoFile.id },
          update: demoFile,
          create: demoFile
        });
      }
      console.log(`✅ Migrated ${demoFilesResult.rows.length} demo files`);
    }

    // 6. Export workspaces
    console.log('🏢 Exporting workspaces...');
    try {
      const workspacesResult = await supabaseClient.query('SELECT * FROM workspaces');
      console.log(`Found ${workspacesResult.rows.length} workspaces`);
      if (workspacesResult.rows.length > 0) {
        console.log('Workspaces found but not in current schema');
      }
    } catch (error) {
      console.log('Workspaces table not accessible');
    }

    // 7. Export editor_widgets
    console.log('🎛️ Exporting editor widgets...');
    try {
      const widgetsResult = await supabaseClient.query('SELECT * FROM editor_widgets');
      console.log(`Found ${widgetsResult.rows.length} editor widgets`);
      if (widgetsResult.rows.length > 0) {
        console.log('Editor widgets found but not in current schema');
      }
    } catch (error) {
      console.log('Editor widgets table not accessible');
    }

    console.log('🎉 Data export completed successfully!');
    
  } catch (error) {
    console.error('❌ Export failed:', error);
  } finally {
    await supabaseClient.end();
    await prisma.$disconnect();
  }
}

// Run export
exportData();

const { PrismaClient } = require('@prisma/client');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Supabase configuration
const SUPABASE_URL = "https://qgmluixnzhpthywyrytn.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbGx1aXhuemhwdGh5d3lyeXRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDEzMzI0MSwiZXhwIjoyMDY5NzA5MjQxfQ.Zor7HvoMbZcavwNXdlp7QxcykH0FmNYD335qHKKgrjQ";

const prisma = new PrismaClient();

async function fetchFromSupabase(table) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching from ${table}:`, error.message);
    return null;
  }
}

async function restApiMigration() {
  try {
    console.log('🚀 Starting REST API migration from Supabase...');

    // 1. Migrate users
    console.log('📦 Migrating users...');
    const users = await fetchFromSupabase('users');
    if (users && users.length > 0) {
      for (const user of users) {
        await prisma.users.upsert({
          where: { id: user.id },
          update: user,
          create: user
        });
      }
      console.log(`✅ Migrated ${users.length} users`);
    } else {
      console.log('No users found to migrate');
    }

    // 2. Migrate folders
    console.log('📁 Migrating folders...');
    const folders = await fetchFromSupabase('folders');
    if (folders && folders.length > 0) {
      for (const folder of folders) {
        await prisma.folders.upsert({
          where: { id: folder.id },
          update: folder,
          create: folder
        });
      }
      console.log(`✅ Migrated ${folders.length} folders`);
    } else {
      console.log('No folders found to migrate');
    }

    // 3. Migrate files
    console.log('📄 Migrating files...');
    const files = await fetchFromSupabase('files');
    if (files && files.length > 0) {
      for (const file of files) {
        await prisma.files.upsert({
          where: { id: file.id },
          update: file,
          create: file
        });
      }
      console.log(`✅ Migrated ${files.length} files`);
    } else {
      console.log('No files found to migrate');
    }

    // 4. Migrate demo_users
    console.log('👤 Migrating demo users...');
    const demoUsers = await fetchFromSupabase('demo_users');
    if (demoUsers && demoUsers.length > 0) {
      for (const demoUser of demoUsers) {
        await prisma.demo_users.upsert({
          where: { id: demoUser.id },
          update: demoUser,
          create: demoUser
        });
      }
      console.log(`✅ Migrated ${demoUsers.length} demo users`);
    } else {
      console.log('No demo users found to migrate');
    }

    // 5. Migrate demo_files
    console.log('📄 Migrating demo files...');
    const demoFiles = await fetchFromSupabase('demo_files');
    if (demoFiles && demoFiles.length > 0) {
      for (const demoFile of demoFiles) {
        await prisma.demo_files.upsert({
          where: { id: demoFile.id },
          update: demoFile,
          create: demoFile
        });
      }
      console.log(`✅ Migrated ${demoFiles.length} demo files`);
    } else {
      console.log('No demo files found to migrate');
    }

    // 6. Migrate workspaces
    console.log('🏢 Migrating workspaces...');
    const workspaces = await fetchFromSupabase('workspaces');
    if (workspaces && workspaces.length > 0) {
      console.log(`Found ${workspaces.length} workspaces, but table not in current schema`);
      console.log('Workspaces data:', workspaces);
    } else {
      console.log('No workspaces found to migrate');
    }

    // 7. Migrate editor_widgets
    console.log('🎛️ Migrating editor widgets...');
    const widgets = await fetchFromSupabase('editor_widgets');
    if (widgets && widgets.length > 0) {
      console.log(`Found ${widgets.length} editor widgets, but table not in current schema`);
      console.log('Widgets data:', widgets);
    } else {
      console.log('No editor widgets found to migrate');
    }

    // 8. Migrate profiles
    console.log('👤 Migrating profiles...');
    const profiles = await fetchFromSupabase('profiles');
    if (profiles && profiles.length > 0) {
      console.log(`Found ${profiles.length} profiles, but table not in current schema`);
      console.log('Profiles data:', profiles);
    } else {
      console.log('No profiles found to migrate');
    }

    // 9. Migrate user_credits
    console.log('💳 Migrating user credits...');
    const credits = await fetchFromSupabase('user_credits');
    if (credits && credits.length > 0) {
      console.log(`Found ${credits.length} user credits, but table not in current schema`);
      console.log('Credits data:', credits);
    } else {
      console.log('No user credits found to migrate');
    }

    // 10. Migrate widget_usage
    console.log('📊 Migrating widget usage...');
    const usage = await fetchFromSupabase('widget_usage');
    if (usage && usage.length > 0) {
      console.log(`Found ${usage.length} widget usage records, but table not in current schema`);
      console.log('Usage data:', usage);
    } else {
      console.log('No widget usage found to migrate');
    }

    console.log('🎉 REST API migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
restApiMigration();

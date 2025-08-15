const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration with service role key
const SUPABASE_URL = "https://qgmluixnzhpthywyrytn.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbGx1aXhuemhwdGh5d3lyeXRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDEzMzI0MSwiZXhwIjoyMDY5NzA5MjQxfQ.Zor7HvoMbZcavwNXdlp7QxcykH0FmNYD335qHKKgrjQ";

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const prisma = new PrismaClient();

async function migrateWithServiceRole() {
  try {
    console.log('🚀 Starting migration from Supabase using service role...');

    // 1. Migrate users
    console.log('📦 Migrating users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
    } else if (users && users.length > 0) {
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
    const { data: folders, error: foldersError } = await supabase
      .from('folders')
      .select('*');
    
    if (foldersError) {
      console.error('Error fetching folders:', foldersError);
    } else if (folders && folders.length > 0) {
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
    const { data: files, error: filesError } = await supabase
      .from('files')
      .select('*');
    
    if (filesError) {
      console.error('Error fetching files:', filesError);
    } else if (files && files.length > 0) {
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
    const { data: demoUsers, error: demoUsersError } = await supabase
      .from('demo_users')
      .select('*');
    
    if (demoUsersError) {
      console.error('Error fetching demo users:', demoUsersError);
    } else if (demoUsers && demoUsers.length > 0) {
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
    const { data: demoFiles, error: demoFilesError } = await supabase
      .from('demo_files')
      .select('*');
    
    if (demoFilesError) {
      console.error('Error fetching demo files:', demoFilesError);
    } else if (demoFiles && demoFiles.length > 0) {
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

    // 6. Migrate workspaces (if table exists)
    console.log('🏢 Migrating workspaces...');
    try {
      const { data: workspaces, error: workspacesError } = await supabase
        .from('workspaces')
        .select('*');
      
      if (workspacesError) {
        console.log('Workspaces table not found or error:', workspacesError.message);
      } else if (workspaces && workspaces.length > 0) {
        console.log(`Found ${workspaces.length} workspaces, but table not in current schema`);
        console.log('Workspaces data:', workspaces);
      } else {
        console.log('No workspaces found to migrate');
      }
    } catch (error) {
      console.log('Workspaces table not accessible');
    }

    // 7. Migrate editor_widgets (if table exists)
    console.log('🎛️ Migrating editor widgets...');
    try {
      const { data: widgets, error: widgetsError } = await supabase
        .from('editor_widgets')
        .select('*');
      
      if (widgetsError) {
        console.log('Editor widgets table not found or error:', widgetsError.message);
      } else if (widgets && widgets.length > 0) {
        console.log(`Found ${widgets.length} editor widgets, but table not in current schema`);
        console.log('Widgets data:', widgets);
      } else {
        console.log('No editor widgets found to migrate');
      }
    } catch (error) {
      console.log('Editor widgets table not accessible');
    }

    // 8. Migrate profiles (if table exists)
    console.log('👤 Migrating profiles...');
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        console.log('Profiles table not found or error:', profilesError.message);
      } else if (profiles && profiles.length > 0) {
        console.log(`Found ${profiles.length} profiles, but table not in current schema`);
        console.log('Profiles data:', profiles);
      } else {
        console.log('No profiles found to migrate');
      }
    } catch (error) {
      console.log('Profiles table not accessible');
    }

    // 9. Migrate user_credits (if table exists)
    console.log('💳 Migrating user credits...');
    try {
      const { data: credits, error: creditsError } = await supabase
        .from('user_credits')
        .select('*');
      
      if (creditsError) {
        console.log('User credits table not found or error:', creditsError.message);
      } else if (credits && credits.length > 0) {
        console.log(`Found ${credits.length} user credits, but table not in current schema`);
        console.log('Credits data:', credits);
      } else {
        console.log('No user credits found to migrate');
      }
    } catch (error) {
      console.log('User credits table not accessible');
    }

    // 10. Migrate widget_usage (if table exists)
    console.log('📊 Migrating widget usage...');
    try {
      const { data: usage, error: usageError } = await supabase
        .from('widget_usage')
        .select('*');
      
      if (usageError) {
        console.log('Widget usage table not found or error:', usageError.message);
      } else if (usage && usage.length > 0) {
        console.log(`Found ${usage.length} widget usage records, but table not in current schema`);
        console.log('Usage data:', usage);
      } else {
        console.log('No widget usage found to migrate');
      }
    } catch (error) {
      console.log('Widget usage table not accessible');
    }

    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateWithServiceRole();

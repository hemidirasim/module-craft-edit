import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');

    // Check if database is connected
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Create tables if they don't exist (Prisma will handle this)
    console.log('📋 Creating database schema...');
    
    // Push the schema to the database
    try {
      execSync('npx prisma db push', { stdio: 'inherit' });
      console.log('✅ Database schema created successfully');
    } catch (error) {
      console.log('⚠️ Schema push failed, trying migrate...');
      try {
        execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
        console.log('✅ Database migration completed successfully');
      } catch (migrateError) {
        console.error('❌ Migration failed:', migrateError.message);
        throw migrateError;
      }
    }

    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated successfully');

    // Create a test user if none exists
    const existingUsers = await prisma.users.findMany();
    if (existingUsers.length === 0) {
      console.log('👤 Creating test user...');
      const hashedPassword = await bcrypt.hash('test123', 12);
      
      await prisma.users.create({
        data: {
          email: 'test@example.com',
          password_hash: hashedPassword,
        },
      });
      console.log('✅ Test user created: test@example.com / test123');
    } else {
      console.log('ℹ️ Users already exist, skipping test user creation');
    }

    // Create demo user if none exists
    const existingDemoUsers = await prisma.demo_users.findMany();
    if (existingDemoUsers.length === 0) {
      console.log('🎭 Creating demo user...');
      await prisma.demo_users.create({
        data: {
          session_id: 'demo_initial_session',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });
      console.log('✅ Demo user created');
    } else {
      console.log('ℹ️ Demo users already exist, skipping demo user creation');
    }

    console.log('🎉 Database setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Database schema created');
    console.log('- Prisma client generated');
    console.log('- Test user: test@example.com / test123');
    console.log('- Demo user created');
    console.log('\n🚀 You can now start the application!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupDatabase();

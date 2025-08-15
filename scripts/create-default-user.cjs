const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function createDefaultUser() {
  try {
    console.log('🔧 Creating default user for foreign key references...');
    
    const defaultUserId = "00000000-0000-0000-0000-000000000000";
    
    // Check if default user already exists
    const existingUser = await prisma.users.findUnique({
      where: { id: defaultUserId }
    });
    
    if (existingUser) {
      console.log('✅ Default user already exists');
      return;
    }
    
    // Create default user
    const defaultUser = await prisma.users.create({
      data: {
        id: defaultUserId,
        email: "default@migration.com",
        password_hash: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log('✅ Default user created successfully:', defaultUser.id);
    
  } catch (error) {
    console.error('❌ Error creating default user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run script
createDefaultUser();

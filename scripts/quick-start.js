const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 EditorCraft - Quick Start Setup');
console.log('=====================================\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  const envExample = fs.readFileSync(path.join(process.cwd(), 'env.example'), 'utf8');
  fs.writeFileSync(envPath, envExample);
  console.log('✅ .env file created');
  console.log('⚠️  Please update the .env file with your actual values before continuing!\n');
} else {
  console.log('✅ .env file already exists\n');
}

// Check if node_modules exists
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully\n');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Dependencies already installed\n');
}

// Check if Prisma client is generated
const prismaClientPath = path.join(process.cwd(), 'node_modules', '.prisma');
if (!fs.existsSync(prismaClientPath)) {
  console.log('🔧 Generating Prisma client...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated\n');
  } catch (error) {
    console.error('❌ Failed to generate Prisma client:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Prisma client already generated\n');
}

console.log('🎉 Quick start setup completed!');
console.log('\n📋 Next steps:');
console.log('1. Update your .env file with actual values');
console.log('2. Run: npm run db:setup');
console.log('3. Run: npm run dev');
console.log('\n📚 For more information, see MIGRATION_GUIDE.md');

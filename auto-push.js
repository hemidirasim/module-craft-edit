#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const WATCH_INTERVAL = 3000; // 3 seconds
const IGNORE_PATTERNS = [
    '.git',
    'node_modules',
    'dist',
    'build',
    '.DS_Store',
    '*.log'
];

let isCommitting = false;
let lastCommitTime = 0;
const COMMIT_COOLDOWN = 10000; // 10 seconds between commits

console.log('🚀 Starting auto-push script for module-craft-edit...');
console.log('🔍 Monitoring for changes...');
console.log('💡 Press Ctrl+C to stop the auto-push script');

// Function to check if file should be ignored
function shouldIgnore(filePath) {
    return IGNORE_PATTERNS.some(pattern => {
        if (pattern.includes('*')) {
            const regex = new RegExp(pattern.replace('*', '.*'));
            return regex.test(filePath);
        }
        return filePath.includes(pattern);
    });
}

// Function to execute git commands
function executeCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Error executing command: ${command}`);
                console.error(`Error: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.warn(`⚠️  Warning: ${stderr}`);
            }
            resolve(stdout);
        });
    });
}

// Function to commit and push changes
async function commitAndPush() {
    if (isCommitting) {
        console.log('⏳ Already committing, skipping...');
        return;
    }

    const now = Date.now();
    if (now - lastCommitTime < COMMIT_COOLDOWN) {
        console.log('⏳ Too soon since last commit, waiting...');
        return;
    }

    try {
        isCommitting = true;
        console.log('📝 Changes detected! Committing and pushing...');

        // Check if there are any changes
        const status = await executeCommand('git status --porcelain');
        if (!status.trim()) {
            console.log('📊 No changes to commit');
            return;
        }

        // Add all changes
        await executeCommand('git add .');
        console.log('✅ Files added to staging');

        // Get current timestamp
        const timestamp = new Date().toLocaleString('az-AZ');
        
        // Commit with timestamp
        await executeCommand(`git commit -m "Auto-commit: Changes made at ${timestamp}"`);
        console.log('✅ Changes committed');

        // Push to origin main
        await executeCommand('git push origin main');
        console.log('✅ Changes pushed successfully!');

        lastCommitTime = now;
        console.log(`⏰ Next check in ${WATCH_INTERVAL/1000} seconds...`);

    } catch (error) {
        console.error('❌ Error during commit/push:', error.message);
    } finally {
        isCommitting = false;
    }
}

// Function to check for changes using git
async function checkForChanges() {
    try {
        const status = await executeCommand('git status --porcelain');
        if (status.trim()) {
            await commitAndPush();
        } else {
            console.log('📊 No changes detected. Checking again...');
        }
    } catch (error) {
        console.error('❌ Error checking for changes:', error.message);
    }
}

// Main loop
async function main() {
    while (true) {
        await checkForChanges();
        await new Promise(resolve => setTimeout(resolve, WATCH_INTERVAL));
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Auto-push script stopped');
    process.exit(0);
});

// Start the monitoring
main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});

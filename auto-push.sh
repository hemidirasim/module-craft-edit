#!/bin/bash

# Auto-push script for module-craft-edit
# This script will automatically commit and push changes to the repository

echo "🚀 Starting auto-push script for module-craft-edit..."

# Function to commit and push changes
commit_and_push() {
    echo "📝 Changes detected! Committing and pushing..."
    
    # Add all changes
    git add .
    
    # Get current timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Commit with timestamp
    git commit -m "Auto-commit: Changes made at $timestamp"
    
    # Push to origin main
    git push origin main
    
    echo "✅ Changes pushed successfully!"
    echo "⏰ Next check in 5 seconds..."
}

# Function to check for changes
check_changes() {
    if ! git diff-index --quiet HEAD --; then
        commit_and_push
    else
        echo "📊 No changes detected. Checking again in 5 seconds..."
    fi
}

echo "🔍 Monitoring for changes..."
echo "💡 Press Ctrl+C to stop the auto-push script"

# Main loop - check for changes every 5 seconds
while true; do
    check_changes
    sleep 5
done

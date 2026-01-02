#!/bin/bash

# Script to commit and push CFE Usage Metrics to GitHub
# This script properly handles large files and respects .gitignore

cd "/Users/narayan/Documents/IBM/AI Training Nov 2025/AI Projects/CFE Usage Metrics"

# Remove git lock if it exists
rm -f .git/index.lock

# Add files in stages to avoid memory issues
echo "Adding documentation files..."
git add README.md DEPLOYMENT.md .gitignore

echo "Adding backend configuration files..."
git add backend/.env.example backend/package.json backend/package-lock.json

echo "Adding backend source files..."
git add backend/src/

echo "Adding frontend source files..."
git add frontend/src/
git add frontend/package.json frontend/vite.config.js frontend/index.html frontend/package-lock.json

echo "Adding DB folder structure (excluding backup file)..."
git add DB/

echo "Committing changes..."
git commit -m "Enhanced User Personas report with consolidated summary panel

- Replaced 3 separate stat cards with single consolidated summary panel
- Added professional gradient styling and hover animations
- Implemented sticky table header for better UX
- Created comprehensive deployment documentation
- Added README.md with project overview
- Added DEPLOYMENT.md with detailed setup instructions
- Added .gitignore to exclude sensitive files and DB backup
- Added .env.example template for configuration"

echo "Pushing to GitHub..."
git branch -M main
git push -u origin main

echo "Done! Code pushed to https://github.com/narayan-kn/CFE-Usage-Metrics.git"

# Made with Bob

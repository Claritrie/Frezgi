#!/bin/bash

# Build script for Vue app deployment to GitHub Pages

echo "🚀 Building Vue app for GitHub Pages..."

# Clean up previous build
if [ -d "dist" ]; then
    echo "📁 Removing existing dist folder..."
    rm -rf dist
fi

# Install dependencies (optional - uncomment if needed)
# echo "📦 Installing dependencies..."
# npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📂 Files in dist folder:"
    ls -la dist/
    echo ""
    echo "🌐 Your GitHub Pages files are ready in the dist folder"
    echo "💡 You can now commit and push the dist folder to deploy"
else
    echo "❌ Build failed!"
    exit 1
fi
#!/bin/bash

# Function to copy JS files from dist to public
copy_files() {
    if [ -d "dist" ]; then
        cp dist/*.js public/ 2>/dev/null
        echo "✅ $(date '+%H:%M:%S') - Copied JS files to public/"
    fi
}

# Initial build and copy
echo "🔄 Starting development mode..."
npm run build

# Start TypeScript compiler in watch mode in background
npx tsc --watch &
TSC_PID=$!

# Start HTTP server in background
http-server public -p 3000 -o -c-1 &
SERVER_PID=$!

echo "👀 Watching for changes... (Press Ctrl+C to stop)"

# Watch for changes in dist directory
if command -v fswatch >/dev/null 2>&1; then
    # Use fswatch if available (macOS)
    fswatch -o dist/ | while read f; do copy_files; done
else
    # Fallback to polling
    while true; do
        if [ -d "dist" ]; then
            # Check if any .js file in dist is newer than the corresponding file in public
            for file in dist/*.js; do
                if [ -f "$file" ]; then
                    filename=$(basename "$file")
                    if [ ! -f "public/$filename" ] || [ "$file" -nt "public/$filename" ]; then
                        copy_files
                        break
                    fi
                fi
            done
        fi
        sleep 1
    done
fi

# Cleanup function
cleanup() {
    echo "🛑 Shutting down..."
    kill $TSC_PID 2>/dev/null
    kill $SERVER_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup INT TERM

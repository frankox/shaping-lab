# Hot Reload Setup

This project now has hot reload functionality set up for development. Here's what has been implemented:

## Features Added

1. **Automatic TypeScript Compilation**: Files are automatically compiled when you save changes
2. **File Watching**: The system watches for changes in your TypeScript files and automatically copies compiled JavaScript to the public folder
3. **Browser Auto-Reload**: The browser automatically refreshes when JavaScript files are updated
4. **Cache Busting**: All local scripts are loaded with timestamps to prevent browser caching issues

## How to Use

### Start Development Mode
```bash
npm run dev
```

This will:
- Build your TypeScript files
- Start watching for changes
- Copy compiled JS files to the public folder
- Start the HTTP server on port 3000
- Automatically reload the browser when files change

### What Happens When You Edit Code

1. Save a TypeScript file in the `src/` directory
2. TypeScript compiler automatically recompiles the file
3. The watch script copies the new JS files to `public/`
4. The browser detects the file change and automatically reloads
5. No more need for incognito windows or manual cache clearing!

## Files Modified

- `package.json`: Updated dev script
- `dev-watch.sh`: Custom watch script for file monitoring
- `public/auto-reload.js`: Browser-side auto-reload functionality
- `public/index.html`: Added auto-reload script and cache busting
- `public/pretrain.html`: Added auto-reload script

## Technical Details

- Uses `fswatch` on macOS for efficient file watching (falls back to polling if not available)
- Cache busting implemented with timestamps on script URLs
- Auto-reload checks for file changes every 2 seconds
- HTTP server runs with cache disabled (`-c-1`)

## Troubleshooting

If hot reload isn't working:
1. Make sure you're running `npm run dev` (not `npm start`)
2. Check that the auto-reload script is loaded (check browser console)
3. Ensure your browser isn't forcing cache (try hard refresh: Cmd+Shift+R)
4. Make sure port 3000 isn't blocked by firewall

The console will show messages like "🔄 Auto-reload enabled" when it's working properly.

#!/usr/bin/env node

const { spawn } = require('child_process');
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');

function copyJsFiles() {
  try {
    const distDir = path.join(__dirname, '../dist');
    const publicDir = path.join(__dirname, '../public');
    
    if (!fs.existsSync(distDir)) {
      console.log('⚠️  dist directory not found, skipping copy');
      return;
    }
    
    const files = fs.readdirSync(distDir).filter(file => file.endsWith('.js'));
    
    files.forEach(file => {
      const srcPath = path.join(distDir, file);
      const destPath = path.join(publicDir, file);
      fs.copyFileSync(srcPath, destPath);
    });
    
    if (files.length > 0) {
      console.log(`✅ Copied ${files.length} JS files to public/`);
    }
  } catch (error) {
    console.error('❌ Error copying files:', error.message);
  }
}

// Start TypeScript compiler in watch mode
console.log('🔄 Starting TypeScript compiler in watch mode...');
const tsc = spawn('npx', ['tsc', '--watch'], {
  stdio: 'pipe'
});

tsc.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output.trim());
  
  // Check if compilation was successful
  if (output.includes('Found 0 errors')) {
    copyJsFiles();
  }
});

tsc.stderr.on('data', (data) => {
  console.error(data.toString());
});

// Watch for changes in dist directory and copy files
const watcher = chokidar.watch(path.join(__dirname, '../dist/*.js'), {
  ignored: /^\./, 
  persistent: true
});

watcher.on('change', () => {
  copyJsFiles();
});

watcher.on('add', () => {
  copyJsFiles();
});

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down watcher...');
  tsc.kill();
  watcher.close();
  process.exit(0);
});

console.log('👀 Watching for TypeScript changes...');

const fs = require('fs');

// Copy _redirects file to dist folder
try {
  fs.copyFileSync('_redirects', 'dist/_redirects');
  console.log('_redirects file copied to dist/');
} catch (error) {
  console.error('Error copying _redirects file:', error);
  process.exit(1);
}

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const password = process.env.WEDDING_PASSWORD || 'welcome2026';

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

html = html.replace(
  /const AUTH_PASSWORD = '[^']*';/,
  `const AUTH_PASSWORD = '${password}';`
);

fs.writeFileSync(indexPath, html);
console.log('✓ Build script: index.html updated with password from WEDDING_PASSWORD env var');

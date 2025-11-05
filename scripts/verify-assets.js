#!/usr/bin/env node
/*
 * Quick asset reference verifier.
 * Scans frontend source for "/api/assets/<filename>" patterns and checks that each file exists under backend/src/assets.
 */
const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.resolve(__dirname, '..', 'frontend', 'src');
const ASSETS_DIR = path.resolve(__dirname, '..', 'backend', 'src', 'assets');

function walk(dir, list=[]) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, list); else list.push(full);
  }
  return list;
}

const files = walk(FRONTEND_DIR).filter(f => /\.(jsx?|css|md)$/i.test(f));
const pattern = /\/api\/assets\/([^"')\s]+)/g;
const referenced = new Set();
for (const f of files) {
  const txt = fs.readFileSync(f, 'utf8');
  let m; while ((m = pattern.exec(txt))) { referenced.add(m[1]); }
}

const missing = [];
const present = [];
for (const name of referenced) {
  const assetPath = path.join(ASSETS_DIR, name);
  if (fs.existsSync(assetPath)) present.push(name); else missing.push(name);
}

console.log('Asset Verification Report');
console.log('==========================');
console.log('Referenced count:', referenced.size);
console.log('Present:', present.length);
console.log('Missing:', missing.length);
if (missing.length) {
  console.log('\nMissing files:');
  missing.forEach(n => console.log(' -', n));
  process.exitCode = 1;
} else {
  console.log('\nAll referenced assets are present.');
}

// Suggest normalization opportunities
const needNormalization = [...present].filter(n => /[A-Z ]/.test(n));
if (needNormalization.length) {
  console.log('\nFiles recommended for normalization (spaces or uppercase found):');
  needNormalization.forEach(n => console.log(' -', n));
}

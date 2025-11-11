#!/usr/bin/env node

/**
 * UnityBoard Deployment Readiness Checker
 * This script validates that all environment variables and configurations
 * are properly set for deployment.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Load .env file manually
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const checks = [];
let passed = 0;
let failed = 0;

function check(name, condition, message, required = true) {
  const status = condition ? '✅' : (required ? '❌' : '⚠️');
  const result = {
    name,
    status: condition,
    message: `${status} ${name}: ${message}`,
    required
  };
  
  checks.push(result);
  
  if (condition) {
    passed++;
  } else if (required) {
    failed++;
  }
}

console.log('🚀 UnityBoard Deployment Readiness Check\n');

// Environment
check(
  'Environment', 
  process.env.NODE_ENV === 'production',
  process.env.NODE_ENV === 'production' ? 'Production mode enabled' : 'Set NODE_ENV=production for deployment',
  false
);

// Database
check(
  'MongoDB URI',
  process.env.MONGO_URI && process.env.MONGO_URI !== 'mongodb://127.0.0.1:27017',
  process.env.MONGO_URI ? 'Database configured' : 'Set MONGO_URI to MongoDB Atlas connection string'
);

check(
  'MongoDB Database Name',
  process.env.MONGO_DB_NAME,
  process.env.MONGO_DB_NAME ? `Database: ${process.env.MONGO_DB_NAME}` : 'Set MONGO_DB_NAME'
);

// Authentication
check(
  'JWT Secret',
  process.env.JWT_SECRET && process.env.JWT_SECRET !== 'change_me' && process.env.JWT_SECRET.length >= 32,
  process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32 ? 'JWT secret is secure' : 'Set a strong JWT_SECRET (32+ characters)'
);

// File Storage
check(
  'File Storage',
  process.env.FILE_STORAGE === 'cloudinary',
  process.env.FILE_STORAGE === 'cloudinary' ? 'Cloudinary enabled for deployment' : 'Set FILE_STORAGE=cloudinary for deployment'
);

check(
  'Cloudinary Cloud Name',
  process.env.CLOUDINARY_CLOUD_NAME,
  process.env.CLOUDINARY_CLOUD_NAME ? 'Cloudinary cloud name configured' : 'Set CLOUDINARY_CLOUD_NAME'
);

check(
  'Cloudinary API Key',
  process.env.CLOUDINARY_API_KEY,
  process.env.CLOUDINARY_API_KEY ? 'Cloudinary API key configured' : 'Set CLOUDINARY_API_KEY'
);

check(
  'Cloudinary API Secret',
  process.env.CLOUDINARY_API_SECRET,
  process.env.CLOUDINARY_API_SECRET ? 'Cloudinary API secret configured' : 'Set CLOUDINARY_API_SECRET'
);

// AI Services
check(
  'Cohere API Key',
  process.env.COHERE_API_KEY,
  process.env.COHERE_API_KEY ? 'Cohere AI configured' : 'Set COHERE_API_KEY for AI features'
);

// URLs
check(
  'Frontend URL',
  process.env.FRONTEND_URL && !process.env.FRONTEND_URL.includes('localhost'),
  process.env.FRONTEND_URL && !process.env.FRONTEND_URL.includes('localhost') ? `Frontend: ${process.env.FRONTEND_URL}` : 'Set FRONTEND_URL to production domain',
  false
);

check(
  'Client URLs',
  process.env.CLIENT_URL,
  process.env.CLIENT_URL ? 'CORS origins configured' : 'Set CLIENT_URL for CORS'
);

// Admin Panel
check(
  'Admin Panel Built',
  existsSync(resolve(process.cwd(), 'dist/admin/index.html')),
  existsSync(resolve(process.cwd(), 'dist/admin/index.html')) ? 'Admin panel built and ready' : 'Run: cd admin && npm run build'
);

check(
  'Admin Credentials',
  process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD !== 'admin123',
  process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD !== 'admin123' ? 'Admin credentials secured' : 'Change default ADMIN_PASSWORD'
);

// Security
check(
  'Rate Limiting',
  process.env.RATE_LIMIT_MAX && Number(process.env.RATE_LIMIT_MAX) > 0,
  process.env.RATE_LIMIT_MAX ? `Rate limit: ${process.env.RATE_LIMIT_MAX} requests/minute` : 'Configure RATE_LIMIT_MAX',
  false
);

// Print Results
console.log('\n📋 Deployment Checklist Results:\n');

checks.forEach(check => {
  console.log(check.message);
});

console.log(`\n📊 Summary: ${passed} passed, ${failed} failed, ${checks.length - passed - failed} warnings\n`);

if (failed > 0) {
  console.log('❌ Deployment readiness: FAIL');
  console.log('Please fix the failed checks before deploying.\n');
  console.log('💡 Quick fixes:');
  console.log('1. Set up MongoDB Atlas and update MONGO_URI');
  console.log('2. Create Cloudinary account and add credentials');
  console.log('3. Get Cohere API key for AI features');
  console.log('4. Generate strong JWT_SECRET (32+ characters)');
  console.log('5. Change default admin password');
  console.log('6. Build admin panel: cd admin && npm run build');
  process.exit(1);
} else {
  console.log('✅ Deployment readiness: PASS');
  console.log('Your UnityBoard instance is ready for deployment!');
  
  if (checks.some(c => !c.status && !c.required)) {
    console.log('\n⚠️  Some optional configurations could be improved for production.');
  }
  
  console.log('\n🚀 Next steps:');
  console.log('1. Deploy backend to Railway/Render');
  console.log('2. Deploy frontend to Vercel/Netlify');
  console.log('3. Update frontend VITE_API_URL to backend URL');
  console.log('4. Test all functionality in production');
}
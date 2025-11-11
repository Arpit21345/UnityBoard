/**
 * Migration script to upload existing local files to Cloudinary
 * Run this once before deployment to preserve existing uploads
 */

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import env from '../backend/src/config/env.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret
});

const uploadsDir = path.join(process.cwd(), 'backend', 'uploads');

async function migrateUploads() {
  try {
    console.log('🚀 Starting uploads migration to Cloudinary...');
    
    const files = fs.readdirSync(uploadsDir).filter(file => 
      file !== '.gitkeep' && !file.startsWith('.')
    );
    
    if (files.length === 0) {
      console.log('✅ No files to migrate');
      return;
    }
    
    console.log(`📁 Found ${files.length} files to migrate:`);
    files.forEach(file => console.log(`   - ${file}`));
    
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isFile()) {
        try {
          console.log(`⬆️  Uploading ${file}...`);
          
          const result = await cloudinary.uploader.upload(filePath, {
            folder: env.cloudinary.folder || 'unityboard',
            public_id: path.parse(file).name, // Use original filename without extension
            use_filename: true,
            unique_filename: false
          });
          
          console.log(`✅ Uploaded: ${file} → ${result.secure_url}`);
          
          // Optionally, you could delete the local file after successful upload
          // fs.unlinkSync(filePath);
          
        } catch (uploadError) {
          console.error(`❌ Failed to upload ${file}:`, uploadError.message);
        }
      }
    }
    
    console.log('🎉 Migration completed!');
    console.log('💡 You can now safely deploy - all files are in Cloudinary');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
migrateUploads();
import User from '../models/User.js';
import env from '../config/env.js';
import { makeFileRecord } from '../services/uploads.js';
import { uploadToCloudinary } from '../services/cloudinary.js';

export async function updateMe(req, res){
	try {
		const userId = req.user?.id;
		if(!userId) return res.status(401).json({ ok:false, error:'Unauthorized' });
		const { name, avatar } = req.body || {};
		
		const updateData = {};
		
		if(typeof name === 'string'){
			const trimmed = name.trim();
			if(!trimmed) return res.status(400).json({ ok:false, error:'Name required' });
			if(trimmed.length > 80) return res.status(400).json({ ok:false, error:'Name too long' });
			updateData.name = trimmed;
		}
		
		if(typeof avatar === 'string'){
			updateData.avatar = avatar;
		}
		
		if(Object.keys(updateData).length > 0) {
			await User.findByIdAndUpdate(userId, updateData);
		}
		
		const fresh = await User.findById(userId).select('name email avatar');
		res.json({ ok:true, user: fresh });
	} catch (e){
		res.status(500).json({ ok:false, error:'Failed to update profile' });
	}
}

export async function uploadAvatar(req, res) {
	try {
		const userId = req.user?.id;
		if(!userId) return res.status(401).json({ ok:false, error:'Unauthorized' });
		
		if (!req.file) {
			return res.status(400).json({ ok: false, error: 'No file uploaded' });
		}

		let avatarUrl;
		
		if (env.fileStorage === 'local') {
			const record = makeFileRecord(req.file);
			avatarUrl = record.url;
		} else {
			// Upload to Cloudinary
			const result = await uploadToCloudinary(
				req.file.buffer, 
				`avatar_${userId}_${Date.now()}`,
				`${env.cloudinary.folder}/avatars`
			);
			avatarUrl = result.secure_url;
		}

		// Update user avatar
		await User.findByIdAndUpdate(userId, { avatar: avatarUrl });
		const fresh = await User.findById(userId).select('name email avatar');
		
		res.json({ 
			ok: true, 
			user: fresh,
			avatarUrl: avatarUrl
		});
	} catch (e) {
		console.error('Avatar upload error:', e);
		res.status(500).json({ ok: false, error: 'Failed to upload avatar' });
	}
}

export async function getUserById(req, res){
	try {
		const { userId } = req.params;
		const user = await User.findById(userId).select('name email avatar analytics createdAt');
		if (!user) return res.status(404).json({ ok: false, error: 'User not found' });
		
		res.json({ 
			ok: true, 
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				avatar: user.avatar,
				analytics: user.analytics || {
					totalProjectsCreated: 0,
					totalTasksCompleted: 0,
					totalContributions: 0,
					lifetimeSolutions: 0
				},
				createdAt: user.createdAt
			}
		});
	} catch (e){
		res.status(500).json({ ok: false, error: 'Failed to get user profile' });
	}
}

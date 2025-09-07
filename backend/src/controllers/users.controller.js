import User from '../models/User.js';

export async function updateMe(req, res){
	try {
		const userId = req.user?.id;
		if(!userId) return res.status(401).json({ ok:false, error:'Unauthorized' });
		const { name } = req.body || {};
		if(typeof name === 'string'){
			const trimmed = name.trim();
			if(!trimmed) return res.status(400).json({ ok:false, error:'Name required' });
			if(trimmed.length > 80) return res.status(400).json({ ok:false, error:'Name too long' });
			await User.findByIdAndUpdate(userId, { name: trimmed });
		}
		const fresh = await User.findById(userId).select('name email');
		res.json({ ok:true, user: fresh });
	} catch (e){
		res.status(500).json({ ok:false, error:'Failed to update profile' });
	}
}

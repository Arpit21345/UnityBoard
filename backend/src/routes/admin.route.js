import express from 'express';
import User from '../models/User.js';
import Project from '../models/Project.js';
import env from '../config/env.js';

const router = express.Router();

// Simple admin auth - checks against environment variables
const adminAuth = (req, res, next) => {
  try {
    console.log('🛡️ Admin auth attempt:', { 
      path: req.path, 
      method: req.method,
      body: req.body,
      headers: req.headers.authorization 
    });
    
    // Get admin credentials from env
    const adminEmail = env.adminEmail || 'admin@unityboard.com';
    const adminPassword = env.adminPassword || 'admin123';
    
    console.log('🔑 Expected credentials:', { adminEmail, adminPassword });
    
    // For login endpoint, check credentials in body
    if (req.path === '/login' && req.method === 'POST') {
      const { email, password } = req.body;
      console.log('📝 Login attempt:', { 
        receivedEmail: email, 
        receivedPassword: password,
        expectedEmail: adminEmail,
        expectedPassword: adminPassword
      });
      
      if (email === adminEmail && password === adminPassword) {
        console.log('✅ Admin login successful');
        return next();
      }
      console.log('❌ Admin login failed - invalid credentials');
      return res.status(401).json({ ok: false, error: 'Invalid admin credentials' });
    }
    
    // For other endpoints, check admin token (simple check)
    const adminToken = req.headers.authorization;
    if (adminToken === 'admin-authenticated') {
      return next();
    }
    
    console.log('❌ Admin authentication required');
    return res.status(401).json({ ok: false, error: 'Admin authentication required' });
  } catch (error) {
    console.error('💥 Admin auth error:', error);
    return res.status(500).json({ ok: false, error: 'Admin authentication failed' });
  }
};

// Admin login
router.post('/login', adminAuth, (req, res) => {
  res.json({ ok: true, message: 'Admin authenticated successfully' });
});

// Get all users for admin
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({}, {
      name: 1,
      email: 1,
      avatar: 1,
      createdAt: 1,
      analytics: 1
    }).sort({ createdAt: -1 });
    
    res.json({ ok: true, users });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch users' });
  }
});

// Get all projects for admin
router.get('/projects', adminAuth, async (req, res) => {
  try {
    const projects = await Project.find({})
      .populate('members.user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ ok: true, projects });
  } catch (error) {
    console.error('Admin projects fetch error:', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch projects' });
  }
});

// Get admin dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const publicProjects = await Project.countDocuments({ visibility: 'public' });
    const privateProjects = await Project.countDocuments({ visibility: 'private' });
    
    res.json({
      ok: true,
      stats: {
        totalUsers,
        totalProjects,
        publicProjects,
        privateProjects
      }
    });
  } catch (error) {
    console.error('Admin stats fetch error:', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch stats' });
  }
});

export default router;
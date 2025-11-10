import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import env from './config/env.js';
import rateLimiter from './middleware/rateLimit.js';
import jwt from 'jsonwebtoken';
import authRouter from './routes/auth.route.js';
import uploadsRouter from './routes/uploads.route.js';
import aiRouter from './routes/ai.route.js';
import projectsRouter from './routes/projects.route.js';
import exploreRouter from './routes/explore.route.js';
import tasksRouter from './routes/tasks.route.js';
import resourcesRouter from './routes/resources.route.js';
import learningRouter from './routes/learning.route.js';
import snippetsRouter from './routes/snippets.route.js';
import solutionsRouter from './routes/solutions.route.js';
import threadsRouter from './routes/threads.route.js';
import dashboardRouter from './routes/dashboard.route.js';
import notificationsRouter from './routes/notifications.route.js';
import usersRouter from './routes/users.route.js';
import adminRouter from './routes/admin.route.js';
import Project from './models/Project.js';
import { setIo } from './socketHub.js';
import { startTaskScheduler } from './services/taskScheduler.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = env.port;

// Middlewares
// Allow comma-separated CLIENT_URL (e.g., http://localhost:5173,http://localhost:5174) or '*'.
// If CLIENT_URL contains plain 'http://localhost' (no port), allow any localhost port.
const allowedOrigins = String(env.clientUrl || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true; // non-browser or same-origin
  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return true;
  const allowAnyLocalhost = allowedOrigins.includes('http://localhost') || allowedOrigins.includes('https://localhost');
  if (allowAnyLocalhost && /^https?:\/\/localhost(?::\d+)?$/.test(origin)) return true;
  return false;
}

app.use(cors({
  origin: (origin, cb) => (isAllowedOrigin(origin) ? cb(null, true) : cb(new Error('CORS: origin not allowed'), false)),
  credentials: true
}));
app.use(express.json({ limit: `${env.maxUploadSizeMb}mb` }));
app.use(morgan('dev'));
app.use(rateLimiter);
// Static serving for local uploads
app.use(`/${env.uploadsDir}`, express.static(path.resolve(process.cwd(), env.uploadsDir)));
// Static serving for app assets (logo, illustrations)
app.use('/api/assets', express.static(path.resolve(process.cwd(), 'src/assets')));

// Routes - Fixed order to prevent conflicts
app.use('/api/auth', authRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/projects', resourcesRouter); // Resource routes must come BEFORE projects to match specific paths first
app.use('/api/projects', projectsRouter);
app.use('/api/explore', exploreRouter);
app.use('/api', learningRouter);
app.use('/api', snippetsRouter);
app.use('/api', solutionsRouter);
app.use('/api', threadsRouter);
app.use('/api', dashboardRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api', usersRouter);
app.use('/api/admin', adminRouter);

// Serve admin panel (built from admin folder)
app.use('/admin', express.static(path.resolve(process.cwd(), 'dist/admin')));
app.get('/admin/*', (_req, res) => {
  res.sendFile(path.resolve(process.cwd(), 'dist/admin/index.html'));
});

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'UnityBoard API' });
});

// Start server after DB connect (if MONGO_URI present)
(async () => {
  if (env.mongoUri) {
    await connectDB(env.mongoUri);
    // Start task scheduler after DB connection
    startTaskScheduler();
  }
  // Setup Socket.IO (optional)
  if (env.enableSocket) {
    const { Server } = await import('socket.io');
    const io = new Server(server, {
      cors: {
        origin: (origin, cb) => (isAllowedOrigin(origin) ? cb(null, true) : cb(new Error('CORS: origin not allowed'), false)),
        credentials: true
      }
    });
    setIo(io);

    io.use((socket, next) => {
      try {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '') || '';
        if (!token) return next(new Error('Unauthorized'));
        const payload = jwt.verify(token, env.jwtSecret);
        socket.user = { id: payload.sub || payload.id || payload._id };
        next();
      } catch {
        next(new Error('Unauthorized'));
      }
    });

    io.on('connection', (socket) => {
      socket.on('join', async ({ projectId }) => {
        try {
          if (!projectId) return;
          // For development: skip membership check if no database
          if (!env.mongoUri) {
            socket.join(`project:${projectId}`);
            return;
          }
          const project = await Project.findById(projectId).select('members');
          if (!project) return;
          const isMember = project.members?.some(m => String(m.user) === String(socket.user.id));
          if (!isMember) return;
          socket.join(`project:${projectId}`);
        } catch {
          // ignore
        }
      });
    });
    console.log('Socket.IO enabled');
  }
  server.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
})();

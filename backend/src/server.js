import express from 'express';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import env from './config/env.js';
import rateLimiter from './middleware/rateLimit.js';
import healthRouter from './routes/health.route.js';
import authRouter from './routes/auth.route.js';
import uploadsRouter from './routes/uploads.route.js';
import aiRouter from './routes/ai.route.js';
import projectsRouter from './routes/projects.route.js';
import invitesRouter from './routes/invites.route.js';
import exploreRouter from './routes/explore.route.js';
import tasksRouter from './routes/tasks.route.js';
import resourcesRouter from './routes/resources.route.js';
import learningRouter from './routes/learning.route.js';
import snippetsRouter from './routes/snippets.route.js';
import solutionsRouter from './routes/solutions.route.js';
import threadsRouter from './routes/threads.route.js';
import dashboardRouter from './routes/dashboard.route.js';
import usersRouter from './routes/users.route.js';

dotenv.config();

const app = express();
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

// Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/projects', resourcesRouter);
app.use('/api', invitesRouter);
app.use('/api/explore', exploreRouter);
app.use('/api', learningRouter);
app.use('/api', snippetsRouter);
app.use('/api', solutionsRouter);
app.use('/api', threadsRouter);
app.use('/api', dashboardRouter);
app.use('/api/users', usersRouter);

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'UnityBoard API' });
});

// Start server after DB connect (if MONGO_URI present)
(async () => {
  if (env.mongoUri) {
    await connectDB(env.mongoUri);
  }
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
})();

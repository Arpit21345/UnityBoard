import rateLimit from 'express-rate-limit';
import env from '../config/env.js';

export default rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false
});

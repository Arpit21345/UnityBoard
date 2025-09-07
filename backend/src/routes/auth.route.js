import { Router } from 'express';
import { register, login, me } from '../controllers/auth.controller.js';
import auth from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, me);
router.post('/logout', auth, (req, res) => {
	// Stateless JWT: client just discards token. Endpoint provided for consistency & future blacklist.
	res.json({ ok: true });
});

export default router;

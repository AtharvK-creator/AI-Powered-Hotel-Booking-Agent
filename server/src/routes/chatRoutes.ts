import { Router } from 'express';
import { chatController } from '../controllers/chatController';
import { authenticate } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticate);

router.post('/message', rateLimiter, chatController.sendMessage);
router.get('/history', chatController.getHistory);
router.delete('/history', chatController.clearHistory);

export default router;

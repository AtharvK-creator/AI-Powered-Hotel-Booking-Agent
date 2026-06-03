import { Router } from 'express';
import { bookingController } from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', bookingController.create);
router.get('/my', bookingController.getMyBookings);
router.get('/:id', bookingController.getById);
router.put('/:id', bookingController.modify);
router.delete('/:id', bookingController.cancel);

export default router;

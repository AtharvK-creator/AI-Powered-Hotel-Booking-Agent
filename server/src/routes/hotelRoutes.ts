import { Router } from 'express';
import { hotelController } from '../controllers/hotelController';

const router = Router();

router.get('/', hotelController.getAll);
router.get('/search', hotelController.search);
router.get('/:id', hotelController.getById);

export default router;

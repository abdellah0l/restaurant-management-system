import { Router } from 'express';
import * as stockController from '../controllers/stockController';

const router = Router();

router.get('/low', stockController.getLowStockProducts);
router.post('/in', stockController.addStockIn);
router.post('/out', stockController.addStockOut);
router.get('/history', stockController.getStockHistory);

export default router; 
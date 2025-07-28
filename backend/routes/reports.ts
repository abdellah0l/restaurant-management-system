import { Router } from 'express';
import * as reportController from '../controllers/reportController';

const router = Router();

router.get('/daily', reportController.getDailyReport);
router.get('/monthly', reportController.getMonthlyReport);

export default router; 
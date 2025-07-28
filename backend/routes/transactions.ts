import { Router } from 'express';
import { getAllTransactions, createTransaction, updateTransaction, deleteTransaction } from '../controllers/transactionController';

const router = Router();

router.route('/').get(getAllTransactions).post(createTransaction);
router.route('/:id').put(updateTransaction).delete(deleteTransaction);

export default router; 
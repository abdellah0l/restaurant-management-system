import { Router } from 'express';
import { 
    getAllSuppliers, createSupplier, updateSupplier, deleteSupplier 
} from '../controllers/supplierController';

const router = Router();

router.route('/').get(getAllSuppliers).post(createSupplier)
router.route('/:id').put(updateSupplier).delete(deleteSupplier)

export default router; 
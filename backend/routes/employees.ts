import { Router } from 'express';
import { 
    getAllEmployees, createEmployee, updateEmployee, deleteEmployee 
} from '../controllers/employeeController';

const router = Router();

router.route('/').get(getAllEmployees).post(createEmployee);
router.route('/:id').put(updateEmployee).delete(deleteEmployee);

export default router; 
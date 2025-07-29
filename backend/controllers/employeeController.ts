import { Request, Response, NextFunction } from 'express';
import pool from '../db/pool';
import { BadRequestError, NotFoundError } from '../errors';

export const getAllEmployees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query('SELECT * FROM employees ORDER BY hire_date DESC');
    res.json(result.rows);
  } catch (error: any) {
    error.customMessage = 'Failed to fetch employees';
    next(error);
  }
};

export const createEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phone, position, salary, advances = 0, bonus = 0, penalties = 0, hire_date } = req.body;

    if (!name || !phone || !position || salary === undefined) {
      throw new BadRequestError('Please provide all required fields: name, phone, position, salary');
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new BadRequestError('Employee name is required and must be a non-empty string');
    }

    if (typeof phone !== 'string' || phone.trim().length === 0) {
      throw new BadRequestError('Phone number is required and must be a non-empty string');
    }

    if (typeof position !== 'string' || position.trim().length === 0) {
      throw new BadRequestError('Position is required and must be a non-empty string');
    }

    if (typeof salary !== 'number' || salary < 0) {
      throw new BadRequestError('Salary must be a non-negative number');
    }

    if (typeof advances !== 'number' || advances < 0) {
      throw new BadRequestError('Advances must be a non-negative number');
    }

    if (typeof bonus !== 'number' || bonus < 0) {
      throw new BadRequestError('Bonus must be a non-negative number');
    }

    if (typeof penalties !== 'number' || penalties < 0) {
      throw new BadRequestError('Penalties must be a non-negative number');
    }

    if (!hire_date || !Date.parse(hire_date)) {
      throw new BadRequestError('Valid hire date is required');
    }

    const net_salary = Number(salary) + Number(bonus) - Number(advances) - Number(penalties);
    
    const result = await pool.query(
      `INSERT INTO employees (name, phone, position, salary, advances, bonus, penalties, hire_date, net_salary) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name.trim(), phone.trim(), position.trim(), salary, advances, bonus, penalties, hire_date, net_salary]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    error.customMessage = 'Failed to add employee';
    next(error);
  }
};

export const updateEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, phone, position, salary, advances, bonus, penalties, hire_date } = req.body;

    if (!id) {
      throw new BadRequestError('Employee ID is required');
    }

    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      throw new BadRequestError('Employee name must be a non-empty string');
    }

    if (phone !== undefined && (typeof phone !== 'string' || phone.trim().length === 0)) {
      throw new BadRequestError('Phone number must be a non-empty string');
    }

    if (position !== undefined && (typeof position !== 'string' || position.trim().length === 0)) {
      throw new BadRequestError('Position must be a non-empty string');
    }

    if (salary !== undefined && (typeof salary !== 'number' || salary < 0)) {
      throw new BadRequestError('Salary must be a non-negative number');
    }

    if (advances !== undefined && (typeof advances !== 'number' || advances < 0)) {
      throw new BadRequestError('Advances must be a non-negative number');
    }

    if (bonus !== undefined && (typeof bonus !== 'number' || bonus < 0)) {
      throw new BadRequestError('Bonus must be a non-negative number');
    }

    if (penalties !== undefined && (typeof penalties !== 'number' || penalties < 0)) {
      throw new BadRequestError('Penalties must be a non-negative number');
    }

    if (hire_date !== undefined && !Date.parse(hire_date)) {
      throw new BadRequestError('Valid hire date is required');
    }

    const net_salary = Number(salary || 0) + Number(bonus || 0) - Number(advances || 0) - Number(penalties || 0);
    
    const result = await pool.query(
      `UPDATE employees SET name = $1, phone = $2, position = $3, salary = $4, advances = $5, bonus = $6, penalties = $7, hire_date = $8, net_salary = $9 WHERE id = $10 RETURNING *`,
      [
        name?.trim() || null, 
        phone?.trim() || null, 
        position?.trim() || null, 
        salary, 
        advances, 
        bonus, 
        penalties, 
        hire_date, 
        net_salary, 
        id
      ]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`Employee with ID ${id} not found`);
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    error.customMessage = 'Failed to update employee';
    next(error);
  }
};

export const deleteEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Employee ID is required');
    }

    const result = await pool.query('DELETE FROM employees WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      throw new NotFoundError(`Employee with ID ${id} not found`);
    }

    res.json({ message: 'Employee deleted successfully' });
  } catch (error: any) {
    error.customMessage = 'Failed to delete employee';
    next(error);
  }
}; 
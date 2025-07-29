import { Request, Response, NextFunction } from 'express';
import pool from '../db/pool';
import { BadRequestError, NotFoundError } from '../errors';

export const getAllSuppliers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query('SELECT * FROM suppliers ORDER BY name ASC');
    res.json(result.rows);
  } catch (error: any) {
    error.customMessage = 'Failed to fetch suppliers';
    next(error);
  }
};

export const createSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phone, email, address, total_debt = 0, total_paid = 0 } = req.body;

    if (!name || !phone || !address) {
      throw new BadRequestError('Please provide all required fields: name, phone, address');
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new BadRequestError('Supplier name is required and must be a non-empty string');
    }

    if (typeof phone !== 'string' || phone.trim().length === 0) {
      throw new BadRequestError('Phone number is required and must be a non-empty string');
    }

    if (typeof address !== 'string' || address.trim().length === 0) {
      throw new BadRequestError('Address is required and must be a non-empty string');
    }

    if (email !== undefined && email !== null && email !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new BadRequestError('Please provide a valid email address');
      }
    }

    if (typeof total_debt !== 'number' || total_debt < 0) {
      throw new BadRequestError('Total debt must be a non-negative number');
    }

    if (typeof total_paid !== 'number' || total_paid < 0) {
      throw new BadRequestError('Total paid must be a non-negative number');
    }

    const result = await pool.query(
      `INSERT INTO suppliers (name, phone, email, address, total_debt, total_paid) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name.trim(), phone.trim(), email?.trim() || null, address.trim(), total_debt, total_paid]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    error.customMessage = 'Failed to add supplier';
    next(error);
  }
};

export const updateSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address, total_debt, total_paid } = req.body;

    if (!id) {
      throw new BadRequestError('Supplier ID is required');
    }

    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      throw new BadRequestError('Supplier name must be a non-empty string');
    }

    if (phone !== undefined && (typeof phone !== 'string' || phone.trim().length === 0)) {
      throw new BadRequestError('Phone number must be a non-empty string');
    }

    if (address !== undefined && (typeof address !== 'string' || address.trim().length === 0)) {
      throw new BadRequestError('Address must be a non-empty string');
    }

    if (email !== undefined && email !== null && email !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new BadRequestError('Please provide a valid email address');
      }
    }

    if (total_debt !== undefined && (typeof total_debt !== 'number' || total_debt < 0)) {
      throw new BadRequestError('Total debt must be a non-negative number');
    }

    if (total_paid !== undefined && (typeof total_paid !== 'number' || total_paid < 0)) {
      throw new BadRequestError('Total paid must be a non-negative number');
    }

    const result = await pool.query(
      `UPDATE suppliers SET name = $1, phone = $2, email = $3, address = $4, total_debt = $5, total_paid = $6 WHERE id = $7 RETURNING *`,
      [
        name?.trim() || null, 
        phone?.trim() || null, 
        email?.trim() || null, 
        address?.trim() || null, 
        total_debt, 
        total_paid, 
        id
      ]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`Supplier with ID ${id} not found`);
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    error.customMessage = 'Failed to update supplier';
    next(error);
  }
};

export const deleteSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Supplier ID is required');
    }

    const result = await pool.query('DELETE FROM suppliers WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      throw new NotFoundError(`Supplier with ID ${id} not found`);
    }

    res.json({ message: 'Supplier deleted successfully' });
  } catch (error: any) {
    error.customMessage = 'Failed to delete supplier';
    next(error);
  }
}; 
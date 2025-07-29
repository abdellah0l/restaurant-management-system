import { Request, Response, NextFunction } from 'express';
import pool from '../db/pool';
import { BadRequestError, NotFoundError } from '../errors';

export const getAllTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query("SELECT * FROM transactions ORDER BY date DESC");
    res.json(result.rows);
  } catch (error: any) {
    error.customMessage = "Failed to fetch transactions";
    next(error);
  }
};

export const createTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, amount, description, date } = req.body;

    if (!type || amount === undefined || !description || !date) {
      throw new BadRequestError('Please provide all required fields: type, amount, description, date');
    }

    if (!['sale', 'purchase', 'expense'].includes(type)) {
      throw new BadRequestError('Transaction type must be one of: sale, purchase, expense');
    }

    if (typeof amount !== 'number' || amount <= 0) {
      throw new BadRequestError('Amount must be a positive number');
    }

    if (typeof description !== 'string' || description.trim().length === 0) {
      throw new BadRequestError('Description is required and must be a non-empty string');
    }

    if (!Date.parse(date)) {
      throw new BadRequestError('Valid date is required');
    }

    const result = await pool.query(
      `INSERT INTO transactions (type, amount, description, date) VALUES ($1, $2, $3, $4) RETURNING *`,
      [type, amount, description.trim(), date]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    error.customMessage = 'Failed to add transaction';
    next(error);
  }
};

export const updateTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { type, amount, description, date } = req.body;

    if (!id) {
      throw new BadRequestError('Transaction ID is required');
    }

    if (type !== undefined && !['sale', 'purchase', 'expense'].includes(type)) {
      throw new BadRequestError('Transaction type must be one of: sale, purchase, expense');
    }

    if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
      throw new BadRequestError('Amount must be a positive number');
    }

    if (description !== undefined && (typeof description !== 'string' || description.trim().length === 0)) {
      throw new BadRequestError('Description must be a non-empty string');
    }

    if (date !== undefined && !Date.parse(date)) {
      throw new BadRequestError('Valid date is required');
    }

    const result = await pool.query(
      `UPDATE transactions SET type = $1, amount = $2, description = $3, date = $4 WHERE id = $5 RETURNING *`,
      [
        type || null, 
        amount, 
        description?.trim() || null, 
        date, 
        id
      ]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`Transaction with ID ${id} not found`);
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    error.customMessage = "Failed to update transaction";
    next(error);
  }
};

export const deleteTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Transaction ID is required');
    }

    const result = await pool.query("DELETE FROM transactions WHERE id = $1 RETURNING *", [id]);
    
    if (result.rows.length === 0) {
      throw new NotFoundError(`Transaction with ID ${id} not found`);
    }

    res.json({ message: "Transaction deleted successfully" });
  } catch (error: any) {
    error.customMessage = "Failed to delete transaction";
    next(error);
  }
}; 
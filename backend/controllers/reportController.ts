import { Request, Response, NextFunction } from 'express';
import pool from '../db/pool';

export const getDailyReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const result = await pool.query(
      `SELECT type, SUM(amount) as total FROM transactions WHERE date >= $1 AND date < $2 GROUP BY type`,
      [today, tomorrow]
    );
    
    const transactions = await pool.query(
      `SELECT * FROM transactions WHERE date >= $1 AND date < $2 ORDER BY date DESC`,
      [today, tomorrow]
    );
    
    let sales = 0, purchases = 0, expenses = 0;
    result.rows.forEach(row => {
      if (row.type === 'sale') sales = Number(row.total);
      if (row.type === 'purchase') purchases = Number(row.total);
      if (row.type === 'expense') expenses = Number(row.total);
    });
    
    res.json({
      sales,
      purchases,
      expenses,
      netProfit: sales - purchases - expenses,
      transactions: transactions.rows
    });
  } catch (error: any) {
    error.customMessage = 'Failed to generate daily report';
    next(error);
  }
};

export const getMonthlyReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    const result = await pool.query(
      `SELECT type, SUM(amount) as total FROM transactions WHERE date >= $1 AND date < $2 GROUP BY type`,
      [firstDay, nextMonth]
    );
    
    const transactions = await pool.query(
      `SELECT * FROM transactions WHERE date >= $1 AND date < $2 ORDER BY date DESC`,
      [firstDay, nextMonth]
    );
    
    let sales = 0, purchases = 0, expenses = 0;
    result.rows.forEach(row => {
      if (row.type === 'sale') sales = Number(row.total);
      if (row.type === 'purchase') purchases = Number(row.total);
      if (row.type === 'expense') expenses = Number(row.total);
    });
    
    res.json({
      sales,
      purchases,
      expenses,
      netProfit: sales - purchases - expenses,
      transactions: transactions.rows
    });
  } catch (error: any) {
    error.customMessage = 'Failed to generate monthly report';
    next(error);
  }
}; 
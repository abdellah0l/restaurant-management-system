import pool from "../db/pool";
import { Request, Response, NextFunction } from "express";
import { BadRequestError, NotFoundError } from "../errors";

// Get all products
export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await pool.query("SELECT * FROM products ORDER BY last_updated DESC");
        res.json(result.rows);
    } catch (error: any) {
        error.customMessage = "Failed to fetch products";
        next(error);
    }
};

// Add new product
export const addProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, category, stock, unit, price, min_stock } = req.body;

        // Validation
        if (!name || !category || stock === undefined || !unit || price === undefined || min_stock === undefined) {
            throw new BadRequestError("Please provide all required fields: name, category, stock, unit, price, min_stock");
        }

        if (typeof name !== 'string' || name.trim().length === 0) {
            throw new BadRequestError("Product name is required and must be a non-empty string");
        }

        if (typeof category !== 'string' || category.trim().length === 0) {
            throw new BadRequestError("Product category is required and must be a non-empty string");
        }

        if (typeof stock !== 'number' || stock < 0) {
            throw new BadRequestError("Stock must be a non-negative number");
        }

        if (typeof unit !== 'string' || unit.trim().length === 0) {
            throw new BadRequestError("Unit is required and must be a non-empty string");
        }

        if (typeof price !== 'number' || price < 0) {
            throw new BadRequestError("Price must be a non-negative number");
        }

        if (typeof min_stock !== 'number' || min_stock < 0) {
            throw new BadRequestError("Minimum stock must be a non-negative number");
        }

        const result = await pool.query(
            `INSERT INTO products (name, category, stock, unit, price, min_stock) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [name.trim(), category.trim(), stock, unit.trim(), price, min_stock]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        error.customMessage = "Failed to add product";
        next(error);
    }
};

// Update product by ID
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, category, stock, unit, price, min_stock } = req.body;

        // Validation
        if (!id) {
            throw new BadRequestError("Product ID is required");
        }

        if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
            throw new BadRequestError("Product name must be a non-empty string");
        }

        if (category !== undefined && (typeof category !== 'string' || category.trim().length === 0)) {
            throw new BadRequestError("Product category must be a non-empty string");
        }

        if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
            throw new BadRequestError("Stock must be a non-negative number");
        }

        if (unit !== undefined && (typeof unit !== 'string' || unit.trim().length === 0)) {
            throw new BadRequestError("Unit must be a non-empty string");
        }

        if (price !== undefined && (typeof price !== 'number' || price < 0)) {
            throw new BadRequestError("Price must be a non-negative number");
        }

        if (min_stock !== undefined && (typeof min_stock !== 'number' || min_stock < 0)) {
            throw new BadRequestError("Minimum stock must be a non-negative number");
        }

        const result = await pool.query(
            `UPDATE products SET name = $1, category = $2, stock = $3, unit = $4, price = $5, min_stock = $6, last_updated = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *`,
            [
                name?.trim() || null, 
                category?.trim() || null, 
                stock, 
                unit?.trim() || null, 
                price, 
                min_stock, 
                id
            ]
        );

        if (result.rows.length === 0) {
            throw new NotFoundError(`Product with ID ${id} not found`);
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        error.customMessage = "Failed to update product";
        next(error);
    }
};

// Delete product by ID
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new BadRequestError("Product ID is required");
        }

        const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);
        
        if (result.rows.length === 0) {
            throw new NotFoundError(`Product with ID ${id} not found`);
        }

        res.json({ message: "Product deleted successfully" });
    } catch (error: any) {
        error.customMessage = "Failed to delete product";
        next(error);
    }
}; 
import { Request, Response, NextFunction } from "express";
import pool from "../db/pool";
import bcrypt from "bcrypt";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../errors";

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { password, email } = req.body;
        const userId = (req as any).user?.id;

        if (!userId) {
            throw new UnauthorizedError("User not authenticated");
        }

        if (!password && !email) {
            throw new BadRequestError("Please provide email or password to update");
        }

        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new BadRequestError("Please provide a valid email address");
            }
        }

        if (password) {
            if (password.length < 6) {
                throw new BadRequestError("Password must be at least 6 characters long");
            }
        }

        let query = "UPDATE users SET ";
        const values = [];
        let valueIndex = 1;

        if (email) {
            query += `email = $${valueIndex}, `;
            values.push(email.trim());
            valueIndex++;
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += `hashedpassword = $${valueIndex}, `;
            values.push(hashedPassword);
            valueIndex++;
        }

        query = query.slice(0, -2);
        query += ` WHERE id = $${valueIndex}`;
        values.push(userId);

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            throw new NotFoundError("User not found");
        }

        const updatedUser = await pool.query(
            "SELECT id, email FROM users WHERE id = $1",
            [userId]
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser.rows[0],
        });
    } catch (error: any) {
        error.customMessage = "Failed to update profile information";
        next(error);
    }
};  

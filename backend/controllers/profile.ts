import { Request, Response, NextFunction } from "express";
import pool from "../db/pool";
import bcrypt from "bcrypt";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../errors";
import { generateVerificationCode, sendVerificationEmail } from "../services/emailService";
import { storeVerificationCode, verifyCode } from "../services/verificationStore";

export const requestVerificationCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const userId = (req as any).user?.id;

        if (!userId) {
            throw new UnauthorizedError("User not authenticated");
        }

        if (!email && !password) {
            throw new BadRequestError("Please provide email or password to update");
        }

        const currentUser = await pool.query(
            "SELECT email FROM users WHERE id = $1",
            [userId]
        );

        if (currentUser.rowCount === 0) {
            throw new NotFoundError("User not found");
        }

        const currentEmail = currentUser.rows[0].email;
        
        // SECURITY FIX: Always send verification code to CURRENT email in database
        // This prevents unauthorized email changes
        const verificationEmail = currentEmail;

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

        const verificationCode = generateVerificationCode();
        const emailSent = await sendVerificationEmail(verificationEmail, verificationCode);

        if (!emailSent) {
            throw new BadRequestError("Failed to send verification email");
        }

        storeVerificationCode(verificationEmail, verificationCode);

        return res.status(200).json({
            success: true,
            message: "Verification code sent to your email",
            email: verificationEmail
        });
    } catch (error: any) {
        error.customMessage = "Failed to send verification code";
        next(error);
    }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { password, email, verificationCode } = req.body;
        const userId = (req as any).user?.id;

        console.log('Profile update request:', { password: !!password, email, verificationCode: !!verificationCode, userId });

        if (!userId) {
            throw new UnauthorizedError("User not authenticated");
        }

        if (!verificationCode) {
            throw new BadRequestError("Verification code is required");
        }

        if (!password && !email) {
            throw new BadRequestError("Please provide email or password to update");
        }

        const currentUser = await pool.query(
            "SELECT email FROM users WHERE id = $1",
            [userId]
        );

        if (currentUser.rowCount === 0) {
            throw new NotFoundError("User not found");
        }

        const currentEmail = currentUser.rows[0].email;
        
        // SECURITY FIX: Always verify against current email in database
        // This ensures only the legitimate user can make changes
        const verificationEmail = currentEmail;

        console.log('Attempting to verify code for email:', verificationEmail);
        console.log('Verification code received:', verificationCode);
        
        const isCodeValid = verifyCode(verificationEmail, verificationCode);
        console.log('Code verification result:', isCodeValid);
        
        if (!isCodeValid) {
            throw new BadRequestError("Invalid or expired verification code");
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

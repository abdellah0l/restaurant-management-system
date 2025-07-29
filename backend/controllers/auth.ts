import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db/pool";
import { BadRequestError, UnauthorizedError } from "../errors";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
    }
  }
}

export const Login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError("Please provide email and password");
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.hashedpassword);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Login successful",
    });
  } catch (error: any) {
    error.customMessage = "Login failed";
    next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("User not authenticated");
    }

    const result = await pool.query("SELECT id, email FROM users WHERE id = $1", [req.user.id]);

    if (result.rows.length === 0) {
      throw new UnauthorizedError("User not found");
    }

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error: any) {
    error.customMessage = "Failed to get current user";
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error: any) {
    error.customMessage = "Logout failed";
    next(error);
  }
};


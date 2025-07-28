import { Request, Response, NextFunction } from "express";
import pool from "../db/pool";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../errors";

// Extend Express Request to allow req.user
interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

const Login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      throw new BadRequestError("Please provide all required fields");
    }

    const query =
      "SELECT id, email, hashedpassword FROM users WHERE email = $1";
    const { rows } = await pool.query(query, [email]);
    const user = rows[0];

    if (!user) {
      throw new NotFoundError(`This email: ${email} does not exist`);
    }

    const doesPasswordMatch = await bcrypt.compare(
      password,
      user.hashedpassword
    );

    if (!doesPasswordMatch) {
      throw new UnauthorizedError("Incorrect password");
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in the environment");
    }

    const token = jwt.sign({ id: user.id }, secret);

    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: "Welcome back",
      });
  } catch (error: any) {
    error.customMessage = "Failed to login as admin";
    next(error);
  }
};

const getCurrentUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user || {};
    if (!id) {
      throw new UnauthorizedError("User not authenticated");
    }

    return res.status(200).json({
      success: true,
      user: { id },
    });
  } catch (error: any) {
    error.customMessage = "Failed to get current user information";
    next(error);
  }
};

// the logout function must be like this
const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error: any) {
    error.customMessage = "Failed to logout";
    next(error);
  }
};


export { Login, getCurrentUser, logout };


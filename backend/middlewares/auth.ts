import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors";

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      throw new UnauthorizedError("No token provided");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as any;
    req.user = { id: decoded.id, email: decoded.email };

    next();
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      error = new UnauthorizedError("Invalid token");
    } else if (error.name === "TokenExpiredError") {
      error = new UnauthorizedError("Token expired");
    }
    next(error);
  }
};


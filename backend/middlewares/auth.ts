import  jwt  from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import UnauthorizedErr from "../errors/Unauthorized";

// Extend the Request interface to include `user`
interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  try {
    if (!token) {
      throw new UnauthorizedErr("You're not authorized to make this request");
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const decoded = jwt.verify(token, secret) as { id: string };
    req.user = decoded;

    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export { isAuth };


import { CustomError } from "../errors/index";
import { Request, Response, NextFunction } from "express";

const errorHandlingMiddleware = (
  err: CustomError | any, // fallback to `any` for non-CustomError
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    return res
      .status(err.status)
      .json({ success: false, message: err.message });
  }

  return res
    .status(500)
    .json({
      success: false,
      message: err.customMessage || "Internal server error...",
    });
};

export default errorHandlingMiddleware;

import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  // Handle Prisma Unique Constraint Error
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: "The custom code is already taken.",
        code: "CONFLICT_ERROR"
      });
    }
  }

  // Handle Custom Errors mapped manually
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code || "API_ERROR"
    });
  }

  // Default to 500
  return res.status(500).json({
    success: false,
    error: err.message || "Internal Server Error",
    code: "INTERNAL_SERVER_ERROR",
    stack: process.env.NODE_ENV === 'development' ? err.stack : err.stack // temporarily expose stack
  });
};

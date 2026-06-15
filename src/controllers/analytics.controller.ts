import { Request, Response, NextFunction } from 'express';
import { getAnalytics } from '../services/analytics.service';

export const getUrlAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shortCode } = req.params;

    const analytics = await getAnalytics(shortCode);

    if (!analytics) {
      return res.status(404).json({
        success: false,
        error: "Short URL not found",
        code: "NOT_FOUND"
      });
    }

    return res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

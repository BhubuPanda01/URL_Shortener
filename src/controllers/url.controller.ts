import { Request, Response, NextFunction } from 'express';
import { shortenUrl, resolveUrl } from '../services/url.service';
import { trackClick } from '../services/analytics.service';
import { ShortenUrlRequest } from '../types';

export const createUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url, customCode } = req.body as ShortenUrlRequest;
    
    const newUrl = await shortenUrl(url, customCode);
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    res.status(201).json({
      success: true,
      data: {
        shortCode: newUrl.shortCode,
        shortUrl: `${baseUrl}/${newUrl.shortCode}`,
        originalUrl: newUrl.originalUrl,
        createdAt: newUrl.createdAt,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const redirectUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shortCode } = req.params;

    const result = await resolveUrl(shortCode);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: "Short URL not found",
        code: "NOT_FOUND"
      });
    }

    // Step 2: Check if URL is expired (only possible if we fetched from DB, cache implies valid)
    if (!result.isCached && result.dbUrl?.expiresAt) {
      if (new Date() > result.dbUrl.expiresAt) {
        return res.status(410).json({
          success: false,
          error: "URL has expired",
          code: "GONE"
        });
      }
    }

    // Step 3: Track click asynchronously (fire and forget)
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';
    
    // We need the URL ID to track the click. 
    // If it was a cache hit, we don't have the ID, only the originalUrl.
    // However, the spec says "Insert a new Click record: { urlId, ipAddress, userAgent }"
    // To do this properly without blocking, we might need to fetch the ID asynchronously if not present.
    const urlIdPromise = result.isCached 
      ? import('../config/database').then(m => m.default.url.findUnique({ where: { shortCode } }).then(u => u?.id))
      : Promise.resolve(result.dbUrl!.id);

    urlIdPromise.then(id => {
      if (id) {
        trackClick(id, ip, userAgent).catch(err => {
          console.error("Failed to track click async:", err);
        });
      }
    }).catch(err => {
      console.error("Failed to resolve URL ID for click tracking:", err);
    });

    // Step 4: Send HTTP 302 redirect
    return res.redirect(302, result.originalUrl);
  } catch (error) {
    next(error);
  }
};

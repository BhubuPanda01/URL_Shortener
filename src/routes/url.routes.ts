import { Router } from 'express';
import { z } from 'zod';
import { createUrl } from '../controllers/url.controller';
import { validate } from '../middleware/validate';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

const shortenSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  customCode: z
    .string()
    .min(3, "Custom code must be at least 3 characters")
    .max(20, "Custom code must be at most 20 characters")
    .regex(/^[a-zA-Z0-9-]+$/, "Custom code can only contain alphanumeric characters and hyphens")
    .optional(),
});

router.post('/shorten', rateLimiter, validate(shortenSchema), createUrl);

export default router;

import { Router } from 'express';
import { getUrlAnalytics } from '../controllers/analytics.controller';

const router = Router();

router.get('/:shortCode', getUrlAnalytics);

export default router;

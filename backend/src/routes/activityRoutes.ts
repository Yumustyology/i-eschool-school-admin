import { Router } from 'express';
import { getActivities } from '../controllers/activityController';
import { validateQuery } from '../middleware/validateRequest';
import { activityQuerySchema } from '../validation/schemas';

const router = Router();

/**
 * @openapi
 * /activity:
 *   get:
 *     tags: [Activity]
 *     summary: Get activity log
 *     description: Retrieve paginated activity log entries
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: Paginated activity log
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Activity'
 *                 total:
 *                   type: number
 *                 page:
 *                   type: number
 *                 limit:
 *                   type: number
 */
router.get('/', validateQuery(activityQuerySchema), getActivities);

export default router;

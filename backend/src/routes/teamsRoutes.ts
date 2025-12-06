import { Router } from 'express';
import { sendTeamsMessage } from '../controllers/teamsController';
import { validateBody } from '../middleware/validateRequest';
import { sendTeamsMessageSchema } from '../validation/schemas';
import { strictLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @swagger
 * /api/teams/send-message:
 *   post:
 *     summary: Send a Microsoft Teams message
 *     description: Send a message to Microsoft Teams channel (rate limited to 20 requests per 15 minutes)
 *     tags: [Teams Integration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 minLength: 1
 *                 example: Attendance marked for Computer Science - 5 students present
 *     responses:
 *       200:
 *         description: Message sent successfully to Teams
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Message sent successfully
 *       400:
 *         description: Invalid message format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Rate limit exceeded (max 20 requests per 15 minutes)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error or Teams integration failure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.post('/send-message', strictLimiter, validateBody(sendTeamsMessageSchema), sendTeamsMessage);

export default router;

import express from 'express';
import {
  getAllClasses,
  createClass,
  deleteClass,
  updateClass,
} from '../controllers/classController';
import { validateBody } from '../middleware/validateRequest';
import { createClassSchema, updateClassSchema } from '../validation/schemas';

const router = express.Router();

/**
 * @openapi
 * /classes:
 *   get:
 *     tags: [Classes]
 *     summary: Get all classes
 *     description: Retrieve a list of all classes
 *     responses:
 *       200:
 *         description: List of classes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Class'
 */
router.get('/', getAllClasses);

/**
 * @openapi
 * /classes:
 *   post:
 *     tags: [Classes]
 *     summary: Create a new class
 *     description: Create a new class with validation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - teacher
 *             properties:
 *               name:
 *                 type: string
 *                 example: Biology 101
 *               teacher:
 *                 type: string
 *                 example: Dr. Smith
 *               description:
 *                 type: string
 *                 example: Introduction to Biology
 *     responses:
 *       201:
 *         description: Class created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Class'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validateBody(createClassSchema), createClass);

/**
 * @openapi
 * /classes/{id}:
 *   put:
 *     tags: [Classes]
 *     summary: Update a class
 *     description: Update an existing class by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               teacher:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Class updated successfully
 *       404:
 *         description: Class not found
 */
router.put('/:id', validateBody(updateClassSchema), updateClass);

/**
 * @openapi
 * /classes/{id}:
 *   delete:
 *     tags: [Classes]
 *     summary: Delete a class
 *     description: Delete a class by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *     responses:
 *       200:
 *         description: Class deleted successfully
 *       404:
 *         description: Class not found
 */
router.delete('/:id', deleteClass);

export default router;

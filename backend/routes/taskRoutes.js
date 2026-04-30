import express from 'express';
import { createTask, getTasks, updateTask, deleteTask } from '../controllers/taskController.js';
import { protect, admin } from '../middleware/auth.js';
import { check, validationResult } from 'express-validator';

const router = express.Router();

const validateTask = [
  check('title', 'Title is required').not().isEmpty(),
  check('projectId', 'Project ID is required').not().isEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];

router.route('/')
  .post(protect, admin, validateTask, createTask)
  .get(protect, getTasks);

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, admin, deleteTask);

export default router;

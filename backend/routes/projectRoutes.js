import express from 'express';
import { createProject, getProjects, getProjectById, deleteProject, updateProject } from '../controllers/projectController.js';
import { protect, admin } from '../middleware/auth.js';
import { check, validationResult } from 'express-validator';

const router = express.Router();

const validateProject = [
  check('name', 'Name is required').not().isEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];

router.route('/')
  .post(protect, admin, validateProject, createProject)
  .get(protect, getProjects);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, admin, updateProject)
  .delete(protect, admin, deleteProject);

export default router;

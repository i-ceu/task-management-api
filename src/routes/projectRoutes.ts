import express from 'express';
import {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    getProjectStats
} from '../controllers/projectController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/').get(protect, getProjects).post(protect, createProject);

router
    .route('/:id')
    .get(protect, getProject)
    .put(protect, updateProject)
    .delete(protect, deleteProject);

router.route('/:id/stats').get(protect, getProjectStats);

export default router;

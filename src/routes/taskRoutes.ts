import express from 'express';
import {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    getMyTasks
} from '../controllers/taskController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/').get(protect, getTasks).post(protect, createTask);

router.route('/my-tasks').get(protect, getMyTasks);

router
    .route('/:id')
    .get(protect, getTask)
    .put(protect, updateTask)
    .delete(protect, deleteTask);

export default router;

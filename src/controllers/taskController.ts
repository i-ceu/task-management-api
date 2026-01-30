import { Response, NextFunction } from 'express';
import Task from '../models/Task';
import Project from '../models/Project';
import { ErrorHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';


export const getTasks = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const {
            project,
            status,
            priority,
            assignedTo,
            tags,
            page = 1,
            limit = 10,
            sortBy = '-createdAt'
        } = req.query;

        const query: any = {};

        if (project) {
            query.project = project;
        }

        if (status) {
            query.status = status;
        }

        if (priority) {
            query.priority = priority;
        }

        if (assignedTo) {
            query.assignedTo = assignedTo;
        }

        if (tags) {
            query.tags = { $in: (tags as string).split(',') };
        }

        if (req.user?.role !== 'admin') {
            const userProjects = await Project.find({ owner: req.user?._id }).select(
                '_id'
            );
            const projectIds = userProjects.map((p) => p._id);

            query.$or = [
                { project: { $in: projectIds } },
                { assignedTo: req.user?._id },
                { createdBy: req.user?._id }
            ];
        }

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        const tasks = await Task.find(query)
            .populate('project', 'name status')
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .skip(skip)
            .limit(limitNum)
            .sort(sortBy as string);

        const total = await Task.countDocuments(query);

        res.status(200).json({
            success: true,
            count: tasks.length,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            data: { tasks }
        });
    } catch (error) {
        next(error);
    }
};


export const getTask = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('project', 'name status owner')
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');

        if (!task) {
            return next(new ErrorHandler('Task not found', 404));
        }

        const project = await Project.findById(task.project);
        if (
            req.user?.role !== 'admin' &&
            project?.owner.toString() !== req.user?._id.toString() &&
            task.assignedTo?.toString() !== req.user?._id.toString() &&
            task.createdBy.toString() !== req.user?._id.toString()
        ) {
            return next(new ErrorHandler('Not authorized to access this task', 403));
        }

        res.status(200).json({
            success: true,
            data: { task }
        });
    } catch (error) {
        next(error);
    }
};


export const createTask = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const project = await Project.findById(req.body.project);

        if (!project) {
            return next(new ErrorHandler('Project not found', 404));
        }

        if (
            req.user?.role !== 'admin' &&
            project.owner.toString() !== req.user?._id.toString()
        ) {
            return next(
                new ErrorHandler('Not authorized to create tasks in this project', 403)
            );
        }

        req.body.createdBy = req.user?._id;

        const task = await Task.create(req.body);

        await task.populate('project', 'name status');
        await task.populate('assignedTo', 'name email');
        await task.populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: { task }
        });
    } catch (error) {
        next(error);
    }
};


export const updateTask = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        let task = await Task.findById(req.params.id);

        if (!task) {
            return next(new ErrorHandler('Task not found', 404));
        }

        const project = await Project.findById(task.project);
        if (
            req.user?.role !== 'admin' &&
            project?.owner.toString() !== req.user?._id.toString() &&
            task.createdBy.toString() !== req.user?._id.toString()
        ) {
            return next(new ErrorHandler('Not authorized to update this task', 403));
        }

        task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
            .populate('project', 'name status')
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');

        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: { task }
        });
    } catch (error) {
        next(error);
    }
};


export const deleteTask = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return next(new ErrorHandler('Task not found', 404));
        }

        // Check authorization
        const project = await Project.findById(task.project);
        if (
            req.user?.role !== 'admin' &&
            project?.owner.toString() !== req.user?._id.toString() &&
            task.createdBy.toString() !== req.user?._id.toString()
        ) {
            return next(new ErrorHandler('Not authorized to delete this task', 403));
        }

        await task.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Task deleted successfully',
            data: {}
        });
    } catch (error) {
        next(error);
    }
};


export const getMyTasks = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { status, priority } = req.query;

        const query: any = {
            assignedTo: req.user?._id
        };

        if (status) {
            query.status = status;
        }

        if (priority) {
            query.priority = priority;
        }

        const tasks = await Task.find(query)
            .populate('project', 'name status')
            .populate('createdBy', 'name email')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: { tasks }
        });
    } catch (error) {
        next(error);
    }
};

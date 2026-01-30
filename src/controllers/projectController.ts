import { Response, NextFunction } from 'express';
import Project from '../models/Project';
import { ErrorHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';


export const getProjects = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { status, tags, page = 1, limit = 10 } = req.query;

        const query: any = {};

        if (req.user?.role !== 'admin') {
            query.owner = req.user?._id;
        }

        if (status) {
            query.status = status;
        }

        if (tags) {
            query.tags = { $in: (tags as string).split(',') };
        }

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        const projects = await Project.find(query)
            .populate('owner', 'name email')
            .skip(skip)
            .limit(limitNum)
            .sort('-createdAt');

        const total = await Project.countDocuments(query);

        res.status(200).json({
            success: true,
            count: projects.length,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            data: { projects }
        });
    } catch (error) {
        next(error);
    }
};


export const getProject = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('owner', 'name email')
            .populate('tasks');

        if (!project) {
            return next(new ErrorHandler('Project not found', 404));
        }

        if (
            req.user?.role !== 'admin' &&
            project.owner._id.toString() !== req.user?._id.toString()
        ) {
            return next(
                new ErrorHandler('Not authorized to access this project', 403)
            );
        }

        res.status(200).json({
            success: true,
            data: { project }
        });
    } catch (error) {
        next(error);
    }
};


export const createProject = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        req.body.owner = req.user?._id;

        const project = await Project.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: { project }
        });
    } catch (error) {
        next(error);
    }
};


export const updateProject = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        let project = await Project.findById(req.params.id);

        if (!project) {
            return next(new ErrorHandler('Project not found', 404));
        }

        // Check ownership
        if (
            req.user?.role !== 'admin' &&
            project.owner.toString() !== req.user?._id.toString()
        ) {
            return next(
                new ErrorHandler('Not authorized to update this project', 403)
            );
        }

        project = await Project.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            data: { project }
        });
    } catch (error) {
        next(error);
    }
};


export const deleteProject = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return next(new ErrorHandler('Project not found', 404));
        }

        // Check ownership
        if (
            req.user?.role !== 'admin' &&
            project.owner.toString() !== req.user?._id.toString()
        ) {
            return next(
                new ErrorHandler('Not authorized to delete this project', 403)
            );
        }

        await project.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Project deleted successfully',
            data: {}
        });
    } catch (error) {
        next(error);
    }
};


export const getProjectStats = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const project = await Project.findById(req.params.id).populate('tasks');

        if (!project) {
            return next(new ErrorHandler('Project not found', 404));
        }

        // Check ownership
        if (
            req.user?.role !== 'admin' &&
            project.owner.toString() !== req.user?._id.toString()
        ) {
            return next(
                new ErrorHandler('Not authorized to access this project', 403)
            );
        }

        const Task = require('../models/Task').default;
        const tasks = await Task.find({ project: project._id });

        const stats = {
            totalTasks: tasks.length,
            tasksByStatus: {
                todo: tasks.filter((t: any) => t.status === 'todo').length,
                inProgress: tasks.filter((t: any) => t.status === 'in-progress').length,
                review: tasks.filter((t: any) => t.status === 'review').length,
                done: tasks.filter((t: any) => t.status === 'done').length
            },
            tasksByPriority: {
                low: tasks.filter((t: any) => t.priority === 'low').length,
                medium: tasks.filter((t: any) => t.priority === 'medium').length,
                high: tasks.filter((t: any) => t.priority === 'high').length,
                urgent: tasks.filter((t: any) => t.priority === 'urgent').length
            },
            totalEstimatedHours: tasks.reduce(
                (sum: number, t: any) => sum + (t.estimatedHours || 0),
                0
            ),
            totalActualHours: tasks.reduce(
                (sum: number, t: any) => sum + (t.actualHours || 0),
                0
            )
        };

        res.status(200).json({
            success: true,
            data: { project, stats }
        });
    } catch (error) {
        next(error);
    }
};

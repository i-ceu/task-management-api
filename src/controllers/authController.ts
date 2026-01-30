import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { ErrorHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const generateToken = (id: string): string => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET as string,
        { expiresIn: process.env.JWT_EXPIRE || '7d' } as jwt.SignOptions
    );
};

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return next(new ErrorHandler('Please provide all required fields', 400));
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new ErrorHandler('User already exists', 400));
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'user'
        });

        const token = generateToken(user._id.toString());

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ErrorHandler('Please provide email and password', 400));
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return next(new ErrorHandler('Invalid credentials', 401));
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return next(new ErrorHandler('Invalid credentials', 401));
        }

        // Generate token
        const token = generateToken(user._id.toString());

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};


export const getMe = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = await User.findById(req.user?._id);

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user?._id,
                    name: user?.name,
                    email: user?.email,
                    role: user?.role,
                    createdAt: user?.createdAt
                }
            }
        });
    } catch (error) {
        next(error);
    }
};


export const updateDetails = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            email: req.body.email
        };

        const user = await User.findByIdAndUpdate(req.user?._id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: 'User details updated successfully',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};


export const updatePassword = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return next(
                new ErrorHandler('Please provide current and new password', 400)
            );
        }

        const user = await User.findById(req.user?._id).select('+password');

        if (!user) {
            return next(new ErrorHandler('User not found', 404));
        }

        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return next(new ErrorHandler('Current password is incorrect', 401));
        }

        user.password = newPassword;
        await user.save();

        const token = generateToken(user._id.toString());

        res.status(200).json({
            success: true,
            message: 'Password updated successfully',
            data: { token }
        });
    } catch (error) {
        next(error);
    }
};

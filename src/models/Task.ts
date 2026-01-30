import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
    title: string;
    description: string;
    project: mongoose.Types.ObjectId;
    assignedTo?: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    status: 'todo' | 'in-progress' | 'review' | 'done';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dueDate?: Date;
    estimatedHours?: number;
    actualHours?: number;
    tags: string[];
    attachments: string[];
    createdAt: Date;
    updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
    {
        title: {
            type: String,
            required: [true, 'Please provide a task title'],
            trim: true,
            maxlength: [200, 'Task title cannot be more than 200 characters']
        },
        description: {
            type: String,
            required: [true, 'Please provide a task description'],
            maxlength: [2000, 'Description cannot be more than 2000 characters']
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: [true, 'Task must belong to a project']
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Task must have a creator']
        },
        status: {
            type: String,
            enum: ['todo', 'in-progress', 'review', 'done'],
            default: 'todo'
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium'
        },
        dueDate: {
            type: Date
        },
        estimatedHours: {
            type: Number,
            min: [0, 'Estimated hours cannot be negative']
        },
        actualHours: {
            type: Number,
            min: [0, 'Actual hours cannot be negative']
        },
        tags: {
            type: [String],
            default: []
        },
        attachments: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
);

taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ priority: 1, dueDate: 1 });
taskSchema.index({ tags: 1 });

export default mongoose.model<ITask>('Task', taskSchema);

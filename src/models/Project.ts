import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
    name: string;
    description: string;
    owner: mongoose.Types.ObjectId;
    status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
    startDate: Date;
    endDate?: Date;
    budget?: number;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
    {
        name: {
            type: String,
            required: [true, 'Please provide a project name'],
            trim: true,
            maxlength: [100, 'Project name cannot be more than 100 characters']
        },
        description: {
            type: String,
            required: [true, 'Please provide a project description'],
            maxlength: [1000, 'Description cannot be more than 1000 characters']
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Project must have an owner']
        },
        status: {
            type: String,
            enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
            default: 'planning'
        },
        startDate: {
            type: Date,
            required: [true, 'Please provide a start date']
        },
        endDate: {
            type: Date
        },
        budget: {
            type: Number,
            min: [0, 'Budget cannot be negative']
        },
        tags: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

projectSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'project',
    justOne: false
});

projectSchema.index({ owner: 1, status: 1 });
projectSchema.index({ tags: 1 });

export default mongoose.model<IProject>('Project', projectSchema);

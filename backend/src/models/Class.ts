import mongoose, { Schema, Document } from 'mongoose';

export interface IClass extends Document {
  name: string;
  teacher: string;
  numberOfStudents: number;
  description: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const classSchema = new Schema<IClass>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    teacher: {
      type: String,
      required: true,
      trim: true,
    },
    numberOfStudents: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: '',
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Class = mongoose.model<IClass>('Class', classSchema);

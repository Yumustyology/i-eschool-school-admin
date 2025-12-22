import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  className: string;
  email: string;
  status: 'Active' | 'Inactive';
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    className: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      match: /.+\@.+\..+/,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
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

export const Student = mongoose.model<IStudent>('Student', studentSchema);

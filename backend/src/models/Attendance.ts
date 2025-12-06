import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAttendance extends Document {
  studentId: Types.ObjectId;
  studentName: string;
  className: string;
  date: Date;
  status: 'Present' | 'Absent';
  createdAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    className: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound unique index for studentId and date
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  action: string;
  entityType: string;
  entityId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    action: { type: String, required: true, trim: true },
    entityType: { type: String, required: true, trim: true },
    entityId: { type: String },
    description: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);

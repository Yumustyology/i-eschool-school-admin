import { Activity } from '../models/Activity';

interface LogActivityParams {
  action: string;
  entityType: string;
  entityId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await Activity.create({ ...params });
  } catch (error) {
    // Don't throw—logging must not break the main flow
    console.warn('Activity log failed:', error);
  }
}

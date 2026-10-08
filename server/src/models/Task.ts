import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { TASK_PRIORITIES } from '../config/constants.js';
import { toCalendarDate, todayDate } from '../utils/dates.js';
import { jsonOptions } from './toJSON.js';

const taskSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    // Calendar date, stored as UTC midnight.
    dueDate: { type: Date, required: true, set: (v: Date) => (v instanceof Date ? toCalendarDate(v) : v) },
    priority: { type: String, enum: TASK_PRIORITIES, default: 'medium' },
    done: { type: Boolean, default: false },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', default: null },
    deal: { type: Schema.Types.ObjectId, ref: 'Deal', default: null },
  },
  { timestamps: true, toJSON: jsonOptions },
);

taskSchema.index({ owner: 1, done: 1, dueDate: 1 });

/** Calculated, never stored: due before today and not done. */
taskSchema.virtual('overdue').get(function overdue(this: { dueDate: Date; done: boolean }) {
  return !this.done && this.dueDate < todayDate();
});

export type TaskAttrs = InferSchemaType<typeof taskSchema>;
export type TaskDoc = HydratedDocument<TaskAttrs>;
export const Task = model('Task', taskSchema);

/** JSON for a task with `overdue` computed against the client's "today". */
export function serializeTask(task: TaskDoc, today: Date) {
  return { ...task.toJSON(), overdue: !task.done && task.dueDate < today };
}

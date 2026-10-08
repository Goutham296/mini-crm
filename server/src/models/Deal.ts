import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { DEAL_STAGES, type DealStage } from '../config/constants.js';
import { jsonOptions } from './toJSON.js';

const dealSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    value: { type: Number, required: true, min: 0, default: 0 },
    stage: { type: String, enum: DEAL_STAGES, default: 'lead' },
    expectedCloseDate: { type: Date, default: null },
    wonAt: { type: Date, default: null },
  },
  { timestamps: true, toJSON: jsonOptions },
);

dealSchema.index({ owner: 1, stage: 1 });
dealSchema.index({ owner: 1, customer: 1 });

export type DealAttrs = InferSchemaType<typeof dealSchema>;
export type DealDoc = HydratedDocument<DealAttrs>;
export const Deal = model('Deal', dealSchema);

/** Sets the stage and keeps `wonAt` in sync (set when it becomes won, cleared when it leaves won). */
export function applyStage(deal: DealDoc, stage: DealStage, now = new Date()): void {
  if (stage === 'won' && deal.stage !== 'won') deal.wonAt = now;
  if (stage !== 'won') deal.wonAt = null;
  deal.stage = stage;
}

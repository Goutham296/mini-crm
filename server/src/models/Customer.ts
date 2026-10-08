import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { CUSTOMER_STATUSES } from '../config/constants.js';
import { jsonOptions } from './toJSON.js';

const customerSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    company: { type: String, trim: true, maxlength: 100, default: '' },
    email: { type: String, trim: true, lowercase: true, maxlength: 254, default: '' },
    phone: { type: String, trim: true, maxlength: 30, default: '' },
    status: { type: String, enum: CUSTOMER_STATUSES, default: 'lead' },
    notes: { type: String, trim: true, maxlength: 2000, default: '' },
  },
  { timestamps: true, toJSON: jsonOptions },
);

customerSchema.index({ owner: 1, status: 1, createdAt: -1 });

export type CustomerAttrs = InferSchemaType<typeof customerSchema>;
export type CustomerDoc = HydratedDocument<CustomerAttrs>;
export const Customer = model('Customer', customerSchema);

/** Shared JSON output: expose `id`, hide `_id`, `__v` and any secret fields. */
export const jsonOptions = {
  virtuals: true,
  versionKey: false,
  transform(_doc: unknown, ret: Record<string, unknown>) {
    delete ret._id;
    delete ret.passwordHash;
    return ret;
  },
};

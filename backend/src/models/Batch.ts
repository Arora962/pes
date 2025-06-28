import { Schema, model, Document, Types } from "mongoose";

export interface IBatch extends Document {
  name: string;
  course: Types.ObjectId;
  instructor: Types.ObjectId;
  students: Types.ObjectId[];
  ta?: Types.ObjectId; // optional in TypeScript interface
}

const batchSchema = new Schema<IBatch>({
  name: { type: String, required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  ta: { type: Schema.Types.ObjectId, ref: 'User', required: false },
});

export const Batch = model<IBatch>('Batch', batchSchema);

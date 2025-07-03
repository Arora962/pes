import { Schema, model, Document, Types } from "mongoose";

export interface IExam extends Document {
  title: string;
  course: Types.ObjectId;
  batch: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  numQuestions: number;
  questions: {
    questionText: string;
    maxMarks: number;
  }[];
  createdBy: { type: Schema.Types.ObjectId; ref: "User"; required: true };
  k: number; // Number of peer evaluations per student
  answerKeyPdf?: Buffer;
  answerKeyMimeType?: string;
  questionPaperPdf?: Buffer;
  questionPaperMimeType?: string;
}

const examSchema = new Schema<IExam>({
  title: { type: String, required: true },
  course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  batch: { type: Schema.Types.ObjectId, ref: "Batch", required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  numQuestions: { type: Number, required: true },
  questions: [
    {
      questionText: { type: String, required: true },
      maxMarks: { type: Number, required: true },
    },
  ],
  createdBy: Types.ObjectId,
  k: { type: Number, required: true }, // Add k field
  answerKeyPdf: { type: Buffer },
  answerKeyMimeType: { type: String },
  questionPaperPdf: { type: Buffer },
  questionPaperMimeType: { type: String },
});

export const Exam = model<IExam>("Exam", examSchema);
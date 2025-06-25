import { Response, NextFunction } from "express";
import AuthenticatedRequest from "../../middlewares/authMiddleware.ts";
import { Evaluation } from "../../models/Evaluation.ts";
import { Exam } from "../../models/Exam.ts";

export const submitPeerEvaluation = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { evaluationId, marks, feedback } = req.body;
    const studentId = req.user?._id;

    const evaluation = await Evaluation.findOne({
      _id: evaluationId,
      evaluator: studentId,
      status: "pending",
    });
    if (!evaluation) {
      res.status(404).json({ error: "Evaluation not found" });
      return;
    }

    const exam = await Exam.findById(evaluation.exam);
    if (!exam) {
      res.status(404).json({ error: "Exam not found" });
      return;
    }
    if (!Array.isArray(marks) || marks.length !== exam.questions.length) {
      res.status(400).json({ error: "Marks array length mismatch" });
      return;
    }

    evaluation.marks = marks;
    evaluation.feedback = feedback;
    evaluation.status = "completed";
    await evaluation.save();

    res.json({ message: "Evaluation submitted" });
  } catch (err) {
    next(err);
  }
};

import { Response, NextFunction } from "express";
import AuthenticatedRequest from "../../middlewares/authMiddleware.ts";
import { Evaluation } from "../../models/Evaluation.ts";
import { Submission } from "../../models/Submission.ts";
import { generatePdfToken } from "../../utils/pdfToken.ts"; // ✅ Import token generator

export const getPendingEvaluations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const studentId = req.user?._id;

    const pending = await Evaluation.find({
      evaluator: studentId,
      status: "pending",
    })
      .populate({
        path: "exam",
        select: "title questions",
      })
      .lean(); // Return plain objects

    const evaluations = await Promise.all(
      pending.map(async (ev) => {
        if (
          !ev.exam ||
          typeof ev.exam !== "object" ||
          !("title" in ev.exam) ||
          !("questions" in ev.exam) ||
          !ev.evaluatee ||
          typeof ev.evaluatee !== "object" ||
          !("_id" in ev.evaluatee)
        ) {
          return null;
        }

        const submission = await Submission.findOne({
          exam: ev.exam._id,
          student: ev.evaluatee._id,
        });

        const token = generatePdfToken(
          req.user!._id.toString(),
          ev.exam._id.toString()
        );

        return {
          _id: ev._id.toString(),
          exam: {
            _id: ev.exam._id.toString(),
            title: ev.exam.title,
            questions: ev.exam.questions,
          },
          evaluatee: {
            _id: ev.evaluatee._id.toString(),
          },
          pdfUrl: submission
            ? `http://localhost:5000/api/student/submission-pdf/${ev.exam._id}/${ev.evaluatee._id}?token=${token}`
            : null,
        };
      })
    );

    res.json({ evaluations: evaluations.filter(Boolean) });
  } catch (err) {
    next(err);
  }
};

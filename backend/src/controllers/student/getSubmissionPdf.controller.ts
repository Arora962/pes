import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Submission } from "../../models/Submission.ts";
import dotenv from "dotenv";
dotenv.config();

export const getSubmissionPdf = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { examId, studentId } = req.params;
    const submission = await Submission.findOne({
      exam: examId,
      student: studentId,
    });
    if (!submission || !submission.answerPdf) {
      res.status(404).send("PDF not found");
      return;
    }
    res.setHeader(
      "Content-Type",
      submission.answerPdfMimeType || "application/pdf"
    );
    const forceDownload = req.query.download === "true";
    res.setHeader(
      "Content-Disposition",
      `${forceDownload ? "attachment" : "inline"}; filename=submission.pdf`
    );

    res.send(submission.answerPdf);
  } catch (err) {
    next(err);
  }
};

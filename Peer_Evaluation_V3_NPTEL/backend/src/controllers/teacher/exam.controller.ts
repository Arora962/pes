import { Request, Response, NextFunction } from "express";
import { Exam } from "../../models/Exam.ts";
import { Submission } from "../../models/Submission.ts";
import AuthenticatedRequest from "../../middlewares/authMiddleware.ts";

// Create a new exam
export const createExam = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      startTime,
      endTime,
      course,
      batch,
      questions,
      numQuestions,
      k,
    } = req.body;
    const exam = new Exam({
      title,
      startTime,
      endTime,
      course,
      batch,
      questions,
      numQuestions,
      k, // 👈 include k
    });
    await exam.save();
    res.status(201).json({ message: "Exam created successfully", exam });
  } catch (error) {
    next(error);
  }
};

// Get a single exam
export const getSingleExam = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { examId } = req.params;
    const exam = await Exam.findById(examId)
      .populate("course", "name code")
      .populate("batch", "name");

    if (!exam) {
      res.status(404).json({ error: "Exam not found" });
      return;
    }

    res.json({ exam }); // includes 'k' since it's in the model
  } catch (error) {
    next(error);
  }
};

// Update exam
export const updateExam = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { examId } = req.params;
    const updates = req.body; // includes optional `k`
    const exam = await Exam.findByIdAndUpdate(examId, updates, { new: true });

    if (!exam) {
      res.status(404).json({ error: "Exam not found" });
      return;
    }

    res.json({ message: "Exam updated successfully", exam });
  } catch (error) {
    next(error);
  }
};

// Delete exam
export const deleteExam = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { examId } = req.params;
    const deleted = await Exam.findByIdAndDelete(examId);

    if (!deleted) {
      res.status(404).json({ error: "Exam not found" });
      return;
    }

    res.json({ message: "Exam deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Get all submissions for an exam
export const getExamSubmissions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { examId } = req.params;
    const submissions = await Submission.find({ exam: examId })
      .populate("student", "name email")
      .populate("exam", "title");

    res.json({ submissions });
  } catch (error) {
    next(error);
  }
};

// Add answer key to an exam
export const uploadAnswerKey = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const examId = req.params.examId;
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      res.status(404).json({ message: "Exam not found" });
      return;
    }

    exam.answerKeyPdf = file.buffer;
    exam.answerKeyMimeType = file.mimetype;

    await exam.save();

    res.status(200).json({ message: "Answer key uploaded successfully" });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

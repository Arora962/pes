import { Request, Response, NextFunction } from "express";
import { Evaluation } from "../../models/Evaluation.ts";

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface User {
      _id: string;
      role: string;
    }
    interface Request {
      user?: User;
    }
  }
}

export const getEvaluationResults = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Use authenticated user's ID if role is student
    let studentId = req.user?._id?.toString();
    if (!studentId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Find all completed evaluations for this student
    const evaluations = await Evaluation.find({
      evaluatee: studentId,
      status: "completed",
    }).populate({
      path: "exam",
      select: "title startTime course",
      populate: { path: "course", select: "name" },
    });

    if (!evaluations || evaluations.length === 0) {
      res.status(200).json({ message: "No evaluations found" });
      return;
    }

    // Group evaluations by exam
    const resultsMap: Record<string, any> = {};
    evaluations.forEach((ev) => {
      const examKey = ev.exam?._id?.toString() || "unknown";
      if (!resultsMap[examKey]) {
        resultsMap[examKey] = {
          exam: ev.exam,
          marksList: [],
          feedbackList: [],
        };
      }
      resultsMap[examKey].marksList.push(ev.marks);
      resultsMap[examKey].feedbackList.push(ev.feedback);
    });

    // Format results for frontend, including average marks and course name
    const results = Object.values(resultsMap).map((group: any) => {
      // Flatten marks and calculate average
      const allMarks = group.marksList.flat();
      const avg =
        allMarks.length > 0
          ? (
              allMarks.reduce((sum: number, m: number) => sum + m, 0) /
              allMarks.length
            ).toFixed(2)
          : null;

      return {
        exam: {
          _id: group.exam._id,
          title: group.exam.title,
          startTime: group.exam.startTime,
          courseName: group.exam.course?.name || "Unknown Course",
        },
        averageMarks: avg,
        marks: group.marksList,
        feedback: group.feedbackList,
      };
    });

    res.json({ results });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../../models/User.ts';
import { Course } from '../../models/Course.ts';
import { Batch } from "../../models/Batch.ts";

interface AuthRequest extends Request {
  user?: any; 
}

export const getStudentCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user.id; // assuming auth middleware sets req.user

    const student = await User.findById(studentId).populate('enrolledCourses');

    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    res.status(200).json({ courses: student.enrolledCourses });
  } catch (error) {
    console.error('Error fetching student courses:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStudentCoursesWithBatches = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const studentId = req.user?._id;

    if (!studentId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const student = await User.findById(studentId)
      .populate("enrolledCourses")
      .lean();

    if (!student || !Array.isArray(student.enrolledCourses)) {
      res.status(404).json({ error: "Student not found or has no courses" });
      return;
    }

    const courseData = await Promise.all(
      student.enrolledCourses.map(async (course: any) => {
        // Guard against non-populated course
        if (!course || typeof course !== "object" || !course._id || !course.name) {
          return null;
        }

        const batches = await Batch.find({
          course: course._id,
          students: studentId,
        }).select("name _id").lean();

        return {
          _id: course._id,
          name: course.name,
          batches,
        };
      })
    );

    res.json({ courses: courseData.filter(Boolean) });
  } catch (err) {
    next(err);
  }
};
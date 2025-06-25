import { Request, Response } from 'express';
import { User } from '../../models/User.ts';
import { Course } from '../../models/Course.ts';

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
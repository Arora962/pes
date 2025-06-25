import { Request, Response, NextFunction } from 'express';
import { Flag } from '../../models/Flag.ts';
import { Evaluation } from '../../models/Evaluation.ts';
import { User } from '../../models/User.ts';
import { Notification } from '../../models/Notification.ts';
import { Submission } from '../../models/Submission.ts';

/**
 * Get all flagged evaluations that need TA review
 */
export const getFlaggedEvaluations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Find all flags with pending status
    const flaggedEvaluations = await Flag.find({
      resolutionStatus: 'pending'
    })
    .populate({
      path: 'evaluation',
      populate: [
        { path: 'evaluator', select: 'name email' },
        { path: 'evaluatee', select: 'name email' },
        {
          path: 'exam',
          select: 'title startTime endTime numQuestions createdBy',
          populate: {
            path: 'course',
            select: 'name code startDate endDate'
          }
        }
      ]
    })
    .populate('flaggedBy', 'name email');

    res.json({ flaggedEvaluations });
  } catch (error) {
    console.error('Error fetching flagged evaluations:', error);
    next(error);
  }
};

/**
 * Get the submission PDF associated with an evaluation
 */
export const getSubmissionPdf = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { evaluationId } = req.params;

    // Find the evaluation with better error handling
    const evaluation = await Evaluation.findById(evaluationId)
    .populate('exam')
    .populate('evaluatee');

    if (!evaluation) {
      res.status(404).json({ error: 'Evaluation not found' });
      return;
    }

    // Ensure exam exists (required by new model)
    if (!evaluation.exam) {
      res.status(404).json({ error: 'Associated exam not found' });
      return;
    }

    // Find the submission for this evaluation
    const submission = await Submission.findOne({
      exam: evaluation.exam,
      student: evaluation.evaluatee
    });

    if (!submission) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }

    // Validate PDF data exists
    if (!submission.answerPdf || !submission.answerPdfMimeType) {
      res.status(404).json({ error: 'Submission PDF data not found' });
      return;
    }

    // Create a safe filename - remove invalid characters and limit length
    const evaluateeName = (evaluation.evaluatee as any)?.name || 'student';
    const safeFilename = `submission_${evaluateeName.replace(/[^a-zA-Z0-9]/g, '_')}_${evaluationId.slice(-6)}.pdf`;

    // Set appropriate headers for PDF download
    res.setHeader('Content-Type', submission.answerPdfMimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);

    // Send the PDF data
    res.send(submission.answerPdf);
  } catch (error) {
    console.error('Error fetching submission PDF:', error);
    next(error);
  }
};

/**
 * Get detailed information about a specific evaluation
 */
export const getEvaluationDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const evaluation = await Evaluation.findById(id)
    .populate('evaluator', 'name email')
    .populate('evaluatee', 'name email')
    .populate({
      path: 'exam',
      select: 'title startTime endTime numQuestions createdBy',
      populate: {
        path: 'course',
        select: 'name code startDate endDate'
      }
    });

    if (!evaluation) {
      res.status(404).json({ error: 'Evaluation not found' });
      return;
    }

    const flags = await Flag.find({
      evaluation: id
    }).populate('flaggedBy', 'name email');

    res.json({ evaluation, flags });
  } catch (error) {
    console.error('Error fetching evaluation details:', error);
    next(error);
  }
};

/**
 * Resolve a flagged evaluation with updated validation
 */
export const resolveFlag = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { flagId } = req.params;
    const { resolution, newMarks, feedback } = req.body;
    const taId = (req as any).user.id;

    const flag = await Flag.findById(flagId).populate('evaluation');
    if (!flag) {
      res.status(404).json({ error: 'Flag not found' });
      return;
    }

    // Update flag status
    flag.resolutionStatus = 'resolved';
    flag.resolvedBy = taId;
    await flag.save();

    // If new marks are provided, validate and update the evaluation
    if (newMarks) {
      // Get the evaluation with exam details
      const evaluation = await Evaluation.findById(flag.evaluation)
      .populate({
        path: 'exam',
        select: 'numQuestions'
      });

      if (!evaluation) {
        res.status(404).json({ error: 'Evaluation not found' });
        return;
      }

      // Validate marks array
      if (!Array.isArray(newMarks)) {
        res.status(400).json({ error: 'Marks must be provided as an array' });
        return;
      }

      // Get expected number of questions from exam
      const expectedQuestions = (evaluation.exam as any)?.numQuestions || evaluation.marks.length;

      if (newMarks.length !== expectedQuestions) {
        res.status(400).json({
          error: `Expected ${expectedQuestions} marks, but received ${newMarks.length}`
        });
        return;
      }

      // Validate each mark
      for (const mark of newMarks) {
        if (typeof mark !== 'number' || mark < 0 || mark > 20) {
          res.status(400).json({
            error: 'Each mark must be a number between 0 and 20'
          });
          return;
        }
      }

      // Update the evaluation
      await Evaluation.findByIdAndUpdate(flag.evaluation, {
        marks: newMarks,
        feedback: feedback || evaluation.feedback,
        status: 'completed'
      });
    }

    // Notify the student who flagged the evaluation
    await Notification.create({
      recipient: flag.flaggedBy,
      message: `Your flagged evaluation has been resolved by a TA.`,
      relatedResource: {
        type: 'flag',
        id: flag._id
      }
    });

    res.json({
      message: 'Flag resolved successfully',
      resolution
    });
  } catch (error) {
    console.error('Error resolving flag:', error);
    next(error);
  }
};

/**
 * Escalate a flagged evaluation to a teacher
 */
export const escalateToTeacher = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { flagId } = req.params;
    const { reason } = req.body;

    const flag = await Flag.findById(flagId);
    if (!flag) {
      res.status(404).json({ error: 'Flag not found' });
      return;
    }

    // Update flag status to escalated
    flag.resolutionStatus = 'escalated';
    flag.escalationReason = reason;
    await flag.save();

    // Find teachers to notify (only those who can handle this course)
    const teachers = await User.find({ role: 'teacher' }).select('_id');

    // Create notifications for teachers
    const teacherNotifications = teachers.map(teacher => ({
      recipient: teacher._id,
      message: 'A flagged evaluation has been escalated and requires your attention',
      relatedResource: {
        type: 'flag',
        id: flag._id
      }
    }));

    if (teacherNotifications.length > 0) {
      await Notification.insertMany(teacherNotifications);
    }

    // Also notify the student who flagged the evaluation
    await Notification.create({
      recipient: flag.flaggedBy,
      message: 'Your flagged evaluation has been escalated to a teacher for review',
      relatedResource: {
        type: 'flag',
        id: flag._id
      }
    });

    res.json({
      message: 'Flag escalated to teacher successfully',
      reason
    });
  } catch (error) {
    console.error('Error escalating flag:', error);
    next(error);
  }
};

/**
 * Get TA dashboard statistics
 */
export const getTAStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pendingFlags = await Flag.countDocuments({ resolutionStatus: 'pending' });
    const resolvedFlags = await Flag.countDocuments({ resolutionStatus: 'resolved' });
    const escalatedFlags = await Flag.countDocuments({ resolutionStatus: 'escalated' });

    res.json({
      stats: {
        pendingFlags,
        resolvedFlags,
        escalatedFlags,
        totalFlags: pendingFlags + resolvedFlags + escalatedFlags
      }
    });
  } catch (error) {
    console.error('Error fetching TA stats:', error);
    next(error);
  }
};

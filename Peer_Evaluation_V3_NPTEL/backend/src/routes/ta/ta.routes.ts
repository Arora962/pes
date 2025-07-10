import { Router } from 'express';
import {
  getStudentTickets,
  getSubmissionPdf,
  getTAStats,
  getTAProfile,
  getPendingEnrollments,
  handleEnrollmentDecision,
  resolveTicket,
  escalateTicketToTeacher
} from '../../controllers/ta/ta.controller.ts';
// Add import for unchecked evaluations controller
import {
  getUncheckedEvaluations,
  getUncheckedSubmissionPdf,
  completeUncheckedEvaluation,
  getUncheckedEvaluationStats
} from '../../controllers/ta/uncheckedEvaluations.controller.ts';
import { authMiddleware } from '../../middlewares/authMiddleware.ts';
import { authorizeRoles } from '../../middlewares/authorizeRoles.ts';
import { authorizeTA } from '../../middlewares/authorizeTA.ts';

const router = Router();

// Wrap async middleware to handle errors properly
const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Apply authentication middleware to all routes
router.use(asyncHandler(authMiddleware));
router.use(asyncHandler(authorizeTA));

// Get TA profile with assigned courses and batches
router.get('/profile', asyncHandler(getTAProfile));

// Get pending enrollments for TA's assigned batches
router.get('/pending-enrollments', asyncHandler(getPendingEnrollments));

// Handle enrollment decision (approve/reject)
router.post('/enrollment/:enrollmentId/decision', asyncHandler(handleEnrollmentDecision));

// Get TA dashboard statistics
router.get('/stats', asyncHandler(getTAStats));

// Get all student tickets for TA's assigned batches and courses
router.get('/student-tickets', asyncHandler(getStudentTickets));

// Get submission PDF for a ticket
router.get('/submission/:ticketId', asyncHandler(getSubmissionPdf));

// Resolve a student ticket
router.post('/resolve-ticket/:ticketId', asyncHandler(resolveTicket));

// Escalate a ticket to teachers
router.post('/escalate-ticket/:ticketId', asyncHandler(escalateTicketToTeacher));

// Unchecked Evaluations Routes
// Get all unchecked evaluation tickets for TA's assigned batches
router.get('/unchecked-evaluations', asyncHandler(getUncheckedEvaluations));

// Get submission PDF for unchecked evaluation ticket
router.get('/unchecked-submission/:ticketId', asyncHandler(getUncheckedSubmissionPdf));

// Complete/grade an unchecked evaluation (resolve ticket)
router.post('/complete-evaluation/:ticketId', asyncHandler(completeUncheckedEvaluation));

// Get unchecked evaluation statistics
router.get('/unchecked-stats', asyncHandler(getUncheckedEvaluationStats));

export default router;
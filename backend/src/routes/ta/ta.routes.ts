import { Router } from 'express';
import {
  getFlaggedEvaluations,
  getEvaluationDetails,
  resolveFlag,
  escalateToTeacher,
  getSubmissionPdf,
  getTAStats
} from '../../controllers/ta/ta.controller.ts';
import { authMiddleware } from '../../middlewares/authMiddleware.ts';
import { authorizeRoles } from '../../middlewares/authorizeRoles.ts';

const router = Router();

// Wrap async middleware to handle errors properly
const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Apply authentication middleware to all routes
router.use(asyncHandler(authMiddleware));

// Ensure only TAs can access these routes
router.use(asyncHandler(authorizeRoles('ta')));

// Get TA dashboard statistics
router.get('/stats', asyncHandler(getTAStats));

// Get all flagged evaluations that need TA review
router.get('/flagged-evaluations', asyncHandler(getFlaggedEvaluations));

// Get detailed information about a specific evaluation
router.get('/evaluation/:id', asyncHandler(getEvaluationDetails));

// Get submission PDF for an evaluation
router.get('/submission/:evaluationId', asyncHandler(getSubmissionPdf));

// Resolve a flagged evaluation
router.post('/resolve-flag/:flagId', asyncHandler(resolveFlag));

// Escalate a flagged evaluation to a teacher
router.post('/escalate/:flagId', asyncHandler(escalateToTeacher));

export default router;

import { Router } from "express";
import multer from "multer";
import { getStudentProfile } from "../../controllers/student/student.controller.ts";
import {
  getStudentExams,
  getStudentExamsByCourse,
} from "../../controllers/student/exam.controller.ts";
import { submitEvaluation } from "../../controllers/student/submitEvaluation.controller.ts";
import { getPendingEvaluations } from "../../controllers/student/getPendingEvaluations.controller.ts";
import { getEvaluationResults } from "../../controllers/student/getEvaluationResults.controller.ts";
import { submitAnswer } from "../../controllers/student/submitAnswer.controller.ts";
import { getSubmissions } from "../../controllers/student/getSubmissions.controller.ts";
import { flagEvaluation } from "../../controllers/student/flagEvaluation.controller.ts"; // using correct file
import { submitPeerEvaluation } from "../../controllers/student/submitPeerEvaluation.controller.ts";
import { getSubmissionPdf } from "../../controllers/student/getSubmissionPdf.controller.ts";
import { authMiddleware } from "../../middlewares/authMiddleware.ts";
import { getStudentCourses } from "../../controllers/student/course.controller.ts";
const router = Router();
const upload = multer();

router.get("/profile", authMiddleware, getStudentProfile);
router.get("/courses", authMiddleware, getStudentCourses);
router.get("/exams", authMiddleware, getStudentExams);
router.get("/courses/:courseId/exams", authMiddleware, getStudentExamsByCourse);
router.post("/evaluate", authMiddleware, submitEvaluation);
router.get("/pending-evaluations", authMiddleware, getPendingEvaluations);
router.get("/results", authMiddleware, getEvaluationResults);
router.post(
  "/submit-answer",
  authMiddleware,
  upload.single("pdf"),
  submitAnswer
);
router.get("/submissions", authMiddleware, getSubmissions);
router.post("/flag-evaluation", authMiddleware, flagEvaluation);
router.post("/submit-peer-evaluation", authMiddleware, submitPeerEvaluation);
router.get(
  "/submission-pdf/:examId/:studentId",
  getSubmissionPdf
);


export default router;
import { Router, Request, Response } from 'express';
import { deleteCourseAndBatches } from "../../controllers/admin/course.controller.ts";
import { createBatchWithNames } from "../../controllers/admin/course.controller.ts";
import {
  addCourse,
  //updateCourse,
  
  getAllCourses,
  //getCourseById,
  getAllBatches,
  //getBatchById,
  
  //updateBatch,
  deleteBatch,
  //Update the role
  updateStudentTaRole,
} from "../../controllers/admin/course.controller.ts";

import { authMiddleware } from "../../middlewares/authMiddleware.ts";      
import { authorizeRoles } from "../../middlewares/authorizeRoles.ts";   
import { User } from '../../models/User.ts'; 

const router = Router();


//kept few middleware in comments for testing purpose

//Course operations
router.post("/courses",authMiddleware,authorizeRoles("admin"),addCourse);
//router.put("/courses/:courseId",authMiddleware,authorizeRoles("admin"),updateCourse);

router.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await User.find().select('name email role');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});



// router.delete("/courses/code/:code",authMiddleware,authorizeRoles("admin"),deleteCourseAndBatches);
router.get('/courses/',authMiddleware,authorizeRoles("admin"), getAllCourses);
//router.get('/courses/:id',authMiddleware,authorizeRoles("admin"), getCourseById);

//Batch operations

//router.put("/batches/:batchId",authMiddleware,authorizeRoles("admin"),updateBatch);
router.delete("/batches/:id",authMiddleware,authorizeRoles("admin"),deleteBatch);
router.get('/batches/',authMiddleware,authorizeRoles("admin"), getAllBatches);
//router.get('/batches/:id',authMiddleware,authorizeRoles("admin"), getBatchById);
router.put("/update-role", updateStudentTaRole);
router.post('/create-batch-with-names', createBatchWithNames);
router.delete("/:courseId", deleteCourseAndBatches);
export default router;



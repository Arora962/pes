import { Router, Request, Response } from 'express';
import { deleteCourseAndBatches } from "../../controllers/admin/course.controller.ts";
import {
  addCourse,
  //updateCourse,
  deleteCourse,
  getAllCourses,
  //getCourseById,
  getAllBatches,
  //getBatchById,
  createBatch,
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
    const users = await User.find({ role: { $in: ['student', 'ta'] } }).select('name email role');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/update-role', async (req: Request, res: Response) => {
  const { email, role } = req.body;

  if (!email || !role) {
    res.status(400).json({ error: 'Email and role are required' });
    return;
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    user.role = role;
    await user.save();

    res.json({ message: `Role updated to '${role}' for ${email}` });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete("/courses/code/:code",authMiddleware,authorizeRoles("admin"),deleteCourse);
router.get('/courses/',authMiddleware,authorizeRoles("admin"), getAllCourses);
//router.get('/courses/:id',authMiddleware,authorizeRoles("admin"), getCourseById);

//Batch operations
router.post("/batches",authMiddleware,authorizeRoles("admin"),createBatch);
//router.put("/batches/:batchId",authMiddleware,authorizeRoles("admin"),updateBatch);
router.delete("/batches/:id",authMiddleware,authorizeRoles("admin"),deleteBatch);
router.get('/batches/',authMiddleware,authorizeRoles("admin"), getAllBatches);
//router.get('/batches/:id',authMiddleware,authorizeRoles("admin"), getBatchById);
router.put('/update-student-ta-role', updateStudentTaRole);

router.delete("/:courseId", deleteCourseAndBatches);
export default router;



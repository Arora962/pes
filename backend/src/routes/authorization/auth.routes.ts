import express from 'express';
import { registerUser,loginUser,sendOtpEmail,verifyOtp } from '../../controllers/authorization/auth.controller.ts';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/send', sendOtpEmail);
router.post('/verify', verifyOtp);

export default router;

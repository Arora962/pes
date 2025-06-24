import { Request, Response } from 'express';
import { User } from '../../models/User.ts';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET || 'pes-secret';
const OTP_STORE = new Map<string, string>();

export const sendOtpEmail = async (req: Request, res: Response) : Promise<void> => {
  const { email } = req.body;
  if (!email)
  { 
    res.status(400).json({ message: 'Email is required' });
    return;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  OTP_STORE.set(email, otp);

  // Configure transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_SENDER || "noreplypeerevaluationsystem@gmail.com",      
      pass: process.env.MAIL_PASSWORD ||  "twmnfoksvgwfcegh"   
    }
  });

  // Email options
  const mailOptions = {
    from: `"OTP Verification" <noreplypeerevaluationsystem@gmail.com>`,
    to: email,
    subject: 'Your OTP Code',
    html: `<h3>Your OTP is <span style="color:blue">${otp}</span></h3>`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body;
  const savedOtp = OTP_STORE.get(email);

  if (String(otp) === String(savedOtp)) {
    OTP_STORE.delete(email);
    res.status(200).json({ verified: true });
  } else {
    res.status(400).json({ verified: false, message: 'Invalid OTP' });
  }
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ message: 'User registered successfully', token, role: newUser.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({message: "Login successful",token,role: user.role,user: {id: user._id,name: user.name,email: user.email,},});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};

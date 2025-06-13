import express from "express";
import connectDB from "./config/db.ts";
import studentRoutes from "./routes/student/student.routes.ts";
import taRoutes from "./routes/ta/ta.routes.ts"; // Add this import
import "./models/Course.ts";
import "./models/Batch.ts";
import "./models/Exam.ts";
import "./models/User.ts";
import "./models/Flag.ts"; // Make sure Flag model is imported
import "./jobs/evaluationReminder.job.ts";
import authRoutes from './routes/authorization/auth.routes.ts';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use("/api/student", studentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ta', taRoutes); // Add TA routes

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
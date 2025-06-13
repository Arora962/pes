import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import courseRoutes from './routes/course.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Default route
app.get('/', (_req, res) => {
  res.send('Hello from the backend!');
});

//course routes
app.use('/api/courses', courseRoutes);

mongoose
  .connect(process.env.MONGO_URI || '')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

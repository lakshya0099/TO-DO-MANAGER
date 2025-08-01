// app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import aiRoutes from './routes/geminiRoutes.js';
import todoRoutes from './routes/todoRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('✅ To-Do Manager Backend is running!');
});


app.use('/api/todos', todoRoutes);
app.use('/api/gemini', aiRoutes); // 

export default app;

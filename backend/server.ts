import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import { initDatabase } from './db/init.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import fileUploadRoutes from './routes/fileupload.js';
import resourceRoutes from './routes/resourceRoutes.js';
import aiModelRoutes from './routes/aiModel.js';
import aiQuizRoutes from './routes/aiQuiz.js';



// Import error handling middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

dotenv.config();

const app: Express = express();
const PORT: number = Number(process.env.PORT) || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Exam Prep API Documentation',
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/uploads', fileUploadRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/ai', aiModelRoutes);
app.use('/api/ai-quiz', aiQuizRoutes);

// Error handling middleware (must be after all routes)
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and start server
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error: Error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });


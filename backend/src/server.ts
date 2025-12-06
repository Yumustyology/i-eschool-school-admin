import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import expressWinston from 'express-winston';
import swaggerUi from 'swagger-ui-express';
import connectDB from './config/database';
import logger from './config/logger';
import { swaggerSpec } from './config/swagger';
import { apiLimiter } from './middleware/rateLimiter';
import { authenticateToken } from './middleware/auth';
import authRoutes from './routes/authRoutes';
import classRoutes from './routes/classRoutes';
import studentRoutes from './routes/studentRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import teamsRoutes from './routes/teamsRoutes';
import activityRoutes from './routes/activityRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { ensureDemoAdminExists } from './utils/seedDemoAdmin';

const app: Express = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
  app.use(
    expressWinston.logger({
      winstonInstance: logger,
      meta: true,
      msg: 'HTTP {{req.method}} {{req.url}}',
      expressFormat: true,
      colorize: false,
    })
  );
}

app.use('/api', apiLimiter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'i-eSchool API Docs',
}));

app.use('/api/auth', authRoutes);

app.use('/api/classes', authenticateToken, classRoutes);
app.use('/api/students', authenticateToken, studentRoutes);
app.use('/api/attendance', authenticateToken, attendanceRoutes);
app.use('/api/teams', authenticateToken, teamsRoutes);
app.use('/api/activity', authenticateToken, activityRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'Backend is running' });
});

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async (): Promise<void> => {
  await connectDB();
  await ensureDemoAdminExists();

  const publicBaseUrl = process.env.SERVER_PUBLIC_URL || `http://localhost:${PORT}`;

  app.listen(PORT, () => {
    console.log(`✓ Backend server is running on ${publicBaseUrl}`);
    console.log(`✓ API endpoints available at ${publicBaseUrl}/api`);
    console.log(`✓ API Documentation available at ${publicBaseUrl}/api-docs`);
  });
};

startServer().catch((error: unknown) => {
  console.error('✗ Failed to start server:', error instanceof Error ? error.message : 'Unknown error');
  process.exit(1);
});

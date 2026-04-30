import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { swaggerSpec } from './config/swagger';
import { errorHandler, notFound } from './middleware/error';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import orgRoutes from './routes/organization.routes';
import memberRoutes from './routes/member.routes';
import eventRoutes from './routes/event.routes';
import announcementRoutes from './routes/announcement.routes';
import registrationRoutes from './routes/registration.routes';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(',') ?? ['http://localhost:4200'],
    credentials: true,
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use('/api', limiter);

// Static for uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health
app.get('/', (_req: Request, res: Response) =>
  res.json({ name: 'SOMS API', status: 'ok', docs: '/api/docs' }),
);
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organizations', orgRoutes);
app.use('/api/organizations', memberRoutes); // /:orgId/members
app.use('/api/events', eventRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/registrations', registrationRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

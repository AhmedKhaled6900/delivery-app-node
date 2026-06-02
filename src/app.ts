import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { corsMiddleware } from './config/cors';
import { isDbConnected } from './config/db';
import { errorHandler, notFound } from './middleware/errorHandler';

const app = express();

app.get('/health', (_req, res) => {
  const db = isDbConnected() ? 'connected' : 'disconnected';
  res.status(200).json({ status: 'ok', db });
});

app.use(corsMiddleware);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

export default app;

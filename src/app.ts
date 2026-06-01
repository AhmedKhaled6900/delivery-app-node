import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';

const app = express();

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Delivery API',
    health: '/api/health',
  });
});

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;

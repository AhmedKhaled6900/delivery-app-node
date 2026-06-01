import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';

const app = express();

app.get('/health', (_req, res) => res.status(200).send('ok'));

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

export default app;

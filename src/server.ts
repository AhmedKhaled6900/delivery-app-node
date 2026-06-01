import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

async function start(): Promise<void> {
  const port = Number(process.env.PORT) || env.port;

  if (env.nodeEnv === 'production') {
    app.set('trust proxy', 1);
  }

  http.createServer(app).listen(port, '0.0.0.0', () => {
    console.log(`Listening on port ${port}`);
  });

  await connectDB();
}

start().catch((err: Error) => {
  console.error(err.message);
  process.exit(1);
});

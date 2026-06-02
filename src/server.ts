import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

async function start(): Promise<void> {
  const port = Number(process.env.PORT) || env.port;

  if (env.nodeEnv === 'production') {
    app.set('trust proxy', 1);
  }

  console.log(`CORS origins: ${env.corsOrigins.join(', ')}`);

  http.createServer(app).listen(port, '0.0.0.0', () => {
    console.log(`Listening on 0.0.0.0:${port}`);
    console.log(`Health: /health`);
  });

  connectDB().catch((err: Error) => {
    console.error('MongoDB unavailable — fix Atlas Network Access (0.0.0.0/0) and redeploy.');
    console.error(err.message);
  });
}

start().catch((err: Error) => {
  console.error('Failed to start:', err.message);
  process.exit(1);
});

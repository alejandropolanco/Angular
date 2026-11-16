import 'dotenv/config';
import express from 'express';
import { registerApi } from './app';
import { serverConfig } from './config';
import { cleanupExpiredSessions } from './sessions';

const app = express();
registerApi(app);

const server = app.listen(serverConfig.port, (error) => {
  if (error) {
    throw error;
  }

  console.log(`NovaStore API listening on http://localhost:${serverConfig.port}`);
});

cleanupExpiredSessions();

const cleanupTimer = setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
cleanupTimer.unref();

function shutdown(): void {
  clearInterval(cleanupTimer);
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

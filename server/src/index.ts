import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { healthRoutes } from './routes/health';
import { authRoutes } from './routes/auth';
import { guildRoutes } from './routes/guilds';
import { channelRoutes } from './routes/channels';
import { gifRoutes } from './routes/gifs';
import { platformAdminRoutes } from './routes/platformAdmin';
import { metricsRoutes } from './routes/metrics';
import { twoFactorRoutes } from './routes/twoFactor';
import { notificationController } from './controllers/notificationController';
import { authMiddleware } from './middleware/auth';
import { setupWebsocket } from './websocket/gateway';
import { voiceServer } from './voice/VoiceServer';
import fastifyStatic from '@fastify/static';
import multipart from '@fastify/multipart';
import path from 'path';
import fs from 'fs';

const fastify = Fastify({
  logger: true,
});

async function main() {
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  // Initialize Voice Server (Mediasoup)
  await voiceServer.initialize();

  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || '*',
  });

  await fastify.register(multipart, {
    limits: {
      fileSize: 26214400, // 25MB
    }
  });

  await fastify.register(fastifyStatic, {
    root: uploadDir,
    prefix: '/uploads/',
  });

  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  await setupWebsocket(fastify);

  await fastify.register(healthRoutes, { prefix: '/api' });
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(guildRoutes, { prefix: '/api/guilds' });
  await fastify.register(channelRoutes, { prefix: '/api/channels' });
  await fastify.register(gifRoutes, { prefix: '/api/gifs' });
  await fastify.register(platformAdminRoutes, { prefix: '/api/admin' });
  await fastify.register(twoFactorRoutes, { prefix: '/api/2fa' });
  await fastify.register(metricsRoutes);

  fastify.get('/api/notifications', { preHandler: [authMiddleware] }, notificationController.list);
  fastify.patch('/api/notifications/:id/read', { preHandler: [authMiddleware] }, notificationController.markAsRead);

  try {
    const port = parseInt(process.env.PORT || '3000', 10);
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();

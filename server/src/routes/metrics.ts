import { FastifyInstance } from 'fastify';
import client from 'prom-client';
import { authMiddleware } from '../middleware/auth';
import { requireGlobalRole } from '../middleware/requireGlobalRole';

export async function metricsRoutes(fastify: FastifyInstance) {
  // fastify.addHook('preHandler', authMiddleware);
  // fastify.addHook('preHandler', requireGlobalRole('admin'));

  fastify.get('/metrics', async (request, reply) => {
    reply.header('Content-Type', client.register.contentType);
    return client.register.metrics();
  });
}

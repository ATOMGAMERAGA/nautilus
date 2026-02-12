import { FastifyInstance } from 'fastify';
import { prisma } from '../database';
import { redis } from '../config/redis';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async (request, reply) => {
    let dbStatus = 'down';
    let redisStatus = 'down';

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'ok';
    } catch (error) {
      fastify.log.error(error);
    }

    try {
      await redis.ping();
      redisStatus = 'ok';
    } catch (error) {
      fastify.log.error(error);
    }

    const status = dbStatus === 'ok' && redisStatus === 'ok' ? 'ok' : 'degraded';

    return {
      status,
      timestamp: new Date().toISOString(),
      services: {
        database: { status: dbStatus },
        redis: { status: redisStatus },
      },
    };
  });
}

import { FastifyInstance } from 'fastify';
import { twoFactorController } from '../controllers/twoFactorController';
import { authMiddleware } from '../middleware/auth';

export async function twoFactorRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authMiddleware);

  fastify.post('/generate', twoFactorController.generate);
  fastify.post('/enable', twoFactorController.enable);
  fastify.post('/disable', twoFactorController.disable);
}

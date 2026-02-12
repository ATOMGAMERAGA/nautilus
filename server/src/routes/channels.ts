import { FastifyInstance } from 'fastify';
import { messageController } from '../controllers/messageController';
import { threadController } from '../controllers/threadController';
import { authMiddleware } from '../middleware/auth';

export async function channelRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/:channel_id/messages', messageController.list);
  fastify.post('/:channel_id/messages', messageController.send);
  
  fastify.get('/:channel_id/threads', threadController.list);
  fastify.post('/:channel_id/threads', threadController.create);
}

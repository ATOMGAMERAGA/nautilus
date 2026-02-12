import { FastifyInstance } from 'fastify';
import { platformAdminController } from '../controllers/platformAdminController';
import { authMiddleware } from '../middleware/auth';
import { requireGlobalRole } from '../middleware/requireGlobalRole';

export async function platformAdminRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authMiddleware);

  // Stats - Admin+
  fastify.get('/stats', { preHandler: [requireGlobalRole('admin')] }, platformAdminController.getStats);
  
  // User Management - Admin+
  fastify.get('/users', { preHandler: [requireGlobalRole('admin')] }, platformAdminController.listUsers);
  fastify.post('/users/:id/ban', { preHandler: [requireGlobalRole('admin')] }, platformAdminController.banUser);

  // Badge Management - Developer+
  fastify.post('/badges', { preHandler: [requireGlobalRole('developer')] }, platformAdminController.createBadge);
  fastify.post('/users/assign-badge', { preHandler: [requireGlobalRole('admin')] }, platformAdminController.assignBadge);
}

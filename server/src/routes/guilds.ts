import { FastifyInstance } from 'fastify';
import { guildController } from '../controllers/guildController';
import { messageController } from '../controllers/messageController';
import { roleController } from '../controllers/roleController';
import { moderationController } from '../controllers/moderationController';
import { autoModController } from '../controllers/autoModController';
import { authMiddleware } from '../middleware/auth';

export async function guildRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authMiddleware);

  fastify.post('/', guildController.create);
  fastify.get('/', guildController.listMyGuilds);
  fastify.get('/:guild_id/search', messageController.search);

  // Role Management
  fastify.get('/:guild_id/roles', roleController.list);
  fastify.post('/:guild_id/roles', roleController.create);
  fastify.delete('/roles/:role_id', roleController.delete);

  // Moderation
  fastify.delete('/:guild_id/members/:user_id', moderationController.kick);
  fastify.post('/:guild_id/bans/:user_id', moderationController.ban);
  fastify.get('/:guild_id/audit-log', moderationController.listAuditLogs);

  // Auto-Mod
  fastify.get('/:guild_id/auto-mod/rules', autoModController.listRules);
  fastify.post('/:guild_id/auto-mod/rules', autoModController.createRule);
  fastify.get('/:guild_id/auto-mod/logs', autoModController.listLogs);
}

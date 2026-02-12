import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../database';

export const platformAdminController = {
  getStats: async (request: FastifyRequest, reply: FastifyReply) => {
    const totalUsers = await prisma.users.count();
    const totalGuilds = await prisma.guilds.count();
    const totalMessages = await prisma.messages.count();

    return {
      totalUsers,
      totalGuilds,
      totalMessages,
      timestamp: new Date().toISOString()
    };
  },

  listUsers: async (request: FastifyRequest, reply: FastifyReply) => {
    const users = await prisma.users.findMany({
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        user_id: true,
        username: true,
        display_name: true,
        global_role: true,
        is_banned: true,
        created_at: true
      }
    });
    return users.map(u => ({ ...u, user_id: Number(u.user_id) }));
  },

  banUser: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { reason } = request.body as { reason: string };

    const targetUser = await prisma.users.findUnique({ where: { id } });
    if (targetUser?.global_role === 'owner') {
      return reply.status(403).send({ error: 'Cannot ban the owner' });
    }

    await prisma.users.update({
      where: { id },
      data: { 
        is_banned: true,
        ban_reason: reason,
        banned_at: new Date(),
        banned_by: request.user.id
      }
    });

    return reply.status(200).send({ message: 'User banned from platform' });
  },

  createBadge: async (request: FastifyRequest, reply: FastifyReply) => {
    const { code, name, icon_url, color, priority } = request.body as any;
    const badge = await prisma.badges.create({
      data: { code, name, icon_url, color, priority }
    });
    return badge;
  },

  assignBadge: async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId, badgeId } = request.body as { userId: string, badgeId: string };
    await prisma.user_badges.create({
      data: { user_id: userId, badge_id: badgeId, granted_by: request.user.id }
    });
    return { success: true };
  }
};

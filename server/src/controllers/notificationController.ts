import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../database';

export const notificationController = {
  list: async (request: FastifyRequest, reply: FastifyReply) => {
    const notifications = await prisma.notifications.findMany({
      where: { user_id: request.user.id },
      orderBy: { created_at: 'desc' },
      take: 50
    });
    return notifications;
  },

  markAsRead: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    await prisma.notifications.update({
      where: { id },
      data: { is_read: true }
    });
    return { success: true };
  }
};

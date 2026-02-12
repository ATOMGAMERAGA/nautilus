import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../database';
import { z } from 'zod';

const moderationSchema = z.object({
  reason: z.string().optional(),
});

export const moderationController = {
  kick: async (request: FastifyRequest, reply: FastifyReply) => {
    const { guild_id, user_id } = request.params as { guild_id: string, user_id: string };
    
    // Check if executor is owner or has KICK permission (simplified for now)
    const guild = await prisma.guilds.findUnique({ where: { id: guild_id } });
    if (guild?.owner_id !== request.user.id) {
      return reply.status(403).send({ error: 'Only owner can kick for now' });
    }

    await prisma.guild_members.delete({
      where: {
        guild_id_user_id: { guild_id, user_id }
      }
    });

    // Create Audit Log
    await prisma.audit_logs.create({
      data: {
        guild_id,
        executor_id: request.user.id,
        action_type: 'member_kick',
        target_id: user_id,
        target_type: 'user',
        reason: (request.body as any)?.reason
      }
    });

    return reply.status(204).send();
  },

  ban: async (request: FastifyRequest, reply: FastifyReply) => {
    const { guild_id, user_id } = request.params as { guild_id: string, user_id: string };
    const { reason } = moderationSchema.parse(request.body);

    const guild = await prisma.guilds.findUnique({ where: { id: guild_id } });
    if (guild?.owner_id !== request.user.id) {
      return reply.status(403).send({ error: 'Only owner can ban for now' });
    }

    await prisma.bans.create({
      data: {
        guild_id,
        user_id,
        reason,
        banned_by: request.user.id
      }
    });

    await prisma.guild_members.delete({
      where: {
        guild_id_user_id: { guild_id, user_id }
      }
    }).catch(() => {}); // Might already be gone

    return reply.status(201).send({ message: 'User banned' });
  },

  listAuditLogs: async (request: FastifyRequest, reply: FastifyReply) => {
    const { guild_id } = request.params as { guild_id: string };
    const logs = await prisma.audit_logs.findMany({
      where: { guild_id },
      orderBy: { created_at: 'desc' },
      include: {
        users: { select: { username: true, display_name: true } }
      }
    });
    return logs;
  }
};

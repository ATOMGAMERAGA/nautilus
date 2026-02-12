import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../database';
import { z } from 'zod';

const createThreadSchema = z.object({
  name: z.string().min(1).max(100),
  message_id: z.string().uuid().optional(),
});

export const threadController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { channel_id } = request.params as { channel_id: string };
      const { name, message_id } = createThreadSchema.parse(request.body);
      const userId = request.user.id;

      const channel = await prisma.channels.findUnique({ where: { id: channel_id } });
      if (!channel) return reply.status(404).send({ error: 'Channel not found' });

      const thread = await prisma.threads.create({
        data: {
          name,
          parent_channel_id: channel_id,
          guild_id: channel.guild_id,
          creator_id: userId,
          message_id: message_id,
        }
      });

      return reply.status(201).send(thread);
    } catch (error) {
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  },

  list: async (request: FastifyRequest, reply: FastifyReply) => {
    const { channel_id } = request.params as { channel_id: string };
    const threads = await prisma.threads.findMany({
      where: { parent_channel_id: channel_id },
      orderBy: { created_at: 'desc' }
    });
    return threads;
  }
};

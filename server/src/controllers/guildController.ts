import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../database';
import { z } from 'zod';

const createGuildSchema = z.object({
  name: z.string().min(2).max(100),
});

export const guildController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { name } = createGuildSchema.parse(request.body);
      const userId = request.user.id;

      const guild = await prisma.guilds.create({
        data: {
          name,
          owner_id: userId,
          guild_members: {
            create: {
              user_id: userId,
            }
          },
          channels: {
            create: [
              { name: 'general', type: 'text', position: 0 },
              { name: 'General', type: 'voice', position: 1 }
            ]
          }
        },
        include: {
          channels: true
        }
      });

      return reply.status(201).send(guild);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues || [];
        const message = issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return reply.status(400).send({ error: message || 'Validation failed' });
      }
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  },

  listMyGuilds: async (request: FastifyRequest, reply: FastifyReply) => {
    const guilds = await prisma.guild_members.findMany({
      where: { user_id: request.user.id },
      include: {
        guilds: {
          include: {
            channels: true
          }
        }
      }
    });
    return guilds.map(m => m.guilds);
  }
};

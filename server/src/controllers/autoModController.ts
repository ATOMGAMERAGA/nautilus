import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../database';
import { z } from 'zod';

const createRuleSchema = z.object({
  name: z.string(),
  event_type: z.enum(['message_send', 'member_join']),
  trigger_type: z.enum(['keyword', 'spam', 'mention_spam']),
  trigger_metadata: z.any(),
});

export const autoModController = {
  createRule: async (request: FastifyRequest, reply: FastifyReply) => {
    const { guild_id } = request.params as { guild_id: string };
    const data = createRuleSchema.parse(request.body);

    const rule = await prisma.auto_mod_rules.create({
      data: {
        guild_id,
        creator_id: request.user.id,
        ...data
      }
    });

    return reply.status(201).send(rule);
  },

  listRules: async (request: FastifyRequest, reply: FastifyReply) => {
    const { guild_id } = request.params as { guild_id: string };
    const rules = await prisma.auto_mod_rules.findMany({
      where: { guild_id }
    });
    return rules;
  },

  listLogs: async (request: FastifyRequest, reply: FastifyReply) => {
    const { guild_id } = request.params as { guild_id: string };
    const logs = await prisma.auto_mod_logs.findMany({
      where: { guild_id },
      orderBy: { created_at: 'desc' }
    });
    return logs;
  }
};

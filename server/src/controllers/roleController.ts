import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../database';
import { z } from 'zod';

const createRoleSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  permissions: z.string().optional(), // Passed as string because BigInt
});

export const roleController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { guild_id } = request.params as { guild_id: string };
      const { name, color, permissions } = createRoleSchema.parse(request.body);

      const role = await prisma.roles.create({
        data: {
          guild_id,
          name,
          color: color || '#99AAB5',
          permissions: permissions ? BigInt(permissions) : 0n,
        }
      });

      return reply.status(201).send({
        ...role,
        permissions: (role.permissions ?? 0n).toString()
      });
    } catch (error) {
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  },

  list: async (request: FastifyRequest, reply: FastifyReply) => {
    const { guild_id } = request.params as { guild_id: string };
    const roles = await prisma.roles.findMany({
      where: { guild_id },
      orderBy: { position: 'asc' }
    });
    return roles.map(r => ({ ...r, permissions: (r.permissions ?? 0n).toString() }));
  },

  delete: async (request: FastifyRequest, reply: FastifyReply) => {
    const { role_id } = request.params as { role_id: string };
    await prisma.roles.delete({ where: { id: role_id } });
    return reply.status(204).send();
  }
};

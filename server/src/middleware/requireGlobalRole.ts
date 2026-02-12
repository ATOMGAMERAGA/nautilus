import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../database';

type GlobalRole = 'user' | 'moderator' | 'admin' | 'developer' | 'owner';

const ROLE_HIERARCHY: Record<GlobalRole, number> = {
  user: 0,
  moderator: 1,
  admin: 2,
  developer: 3,
  owner: 4,
};

export function requireGlobalRole(minimumRole: GlobalRole) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
      select: { global_role: true, is_banned: true },
    });

    if (!user) return reply.status(401).send({ error: 'User not found' });
    if (user.is_banned) return reply.status(403).send({ error: 'Your account is banned' });

    const userLevel = ROLE_HIERARCHY[user.global_role as GlobalRole] || 0;
    const requiredLevel = ROLE_HIERARCHY[minimumRole];

    if (userLevel < requiredLevel) {
      return reply.status(403).send({ error: 'Insufficient platform permissions' });
    }
  };
}

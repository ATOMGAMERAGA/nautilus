import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

interface AuthPayload {
  sub: string;
  id: string; // Added alias for sub
  username: string;
  user_id: number;
}

declare module 'fastify' {
  interface FastifyRequest {
    user: AuthPayload;
  }
}

export async function authMiddleware(req: FastifyRequest, reply: FastifyReply) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
    // Ensure id is present if it wasn't in the token payload directly (usually sub is the ID)
    req.user = { ...payload, id: payload.sub };
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return reply.status(401).send({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return reply.status(401).send({ error: 'Invalid token' });
  }
}

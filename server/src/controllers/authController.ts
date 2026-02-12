import { FastifyRequest, FastifyReply } from 'fastify';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { prisma } from '../database';
import { generateUserId } from '../utils/generateUserId';
import { z } from 'zod';

const registerSchema = z.object({
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8),
  display_name: z.string().min(1).max(32).optional(),
  birth_date: z.string().datetime().optional(),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const authController = {
  register: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { username, password, display_name, birth_date } = registerSchema.parse(request.body);

      const existingUser = await prisma.users.findUnique({ where: { username } });
      if (existingUser) {
        return reply.status(409).send({ error: 'Username already taken' });
      }

      const password_hash = await argon2.hash(password);
      const user_id = await generateUserId();

      const user = await prisma.users.create({
        data: {
          user_id,
          username,
          password_hash,
          display_name: display_name || username,
          // birth_date logic can be added to schema if needed, for now using updated_at as placeholder for demonstration of creation
        },
      });

      // Create default settings
      await prisma.user_settings.create({
        data: {
          user_id: user.id,
        },
      });

      const accessToken = jwt.sign(
        { sub: user.id, username: user.username, user_id: Number(user.user_id) },
        process.env.JWT_SECRET as jwt.Secret,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' } as jwt.SignOptions
      );

      const refreshToken = jwt.sign(
        { sub: user.id, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET as jwt.Secret,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' } as jwt.SignOptions
      );

      const tokenHash = await argon2.hash(refreshToken);
      await prisma.refresh_tokens.create({
        data: {
          user_id: user.id,
          token_hash: tokenHash,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      return reply.status(201).send({
        user: {
          id: user.id,
          user_id: Number(user.user_id),
          username: user.username,
          display_name: user.display_name,
        },
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: (error as any).errors });
      }
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  },

  login: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { username, password } = loginSchema.parse(request.body);

      const user = await prisma.users.findUnique({ where: { username } });
      if (!user) {
        return reply.status(401).send({ error: 'Invalid username or password' });
      }

      const isValid = await argon2.verify(user.password_hash, password);
      if (!isValid) {
        return reply.status(401).send({ error: 'Invalid username or password' });
      }

      const accessToken = jwt.sign(
        { sub: user.id, username: user.username, user_id: Number(user.user_id) },
        process.env.JWT_SECRET as jwt.Secret,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' } as jwt.SignOptions
      );

      const refreshToken = jwt.sign(
        { sub: user.id, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET as jwt.Secret,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' } as jwt.SignOptions
      );

      const tokenHash = await argon2.hash(refreshToken);
      await prisma.refresh_tokens.create({
        data: {
          user_id: user.id,
          token_hash: tokenHash,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return {
        user: {
          id: user.id,
          user_id: Number(user.user_id),
          username: user.username,
          display_name: user.display_name,
          avatar_url: user.avatar_url,
          status: user.status,
        },
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: (error as any).errors });
      }
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  },

  refresh: async (request: FastifyRequest, reply: FastifyReply) => {
    const { refresh_token } = request.body as { refresh_token: string };
    if (!refresh_token) return reply.status(400).send({ error: 'Refresh token required' });

    try {
      const payload = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET!) as { sub: string };
      const user = await prisma.users.findUnique({ where: { id: payload.sub } });
      if (!user) return reply.status(401).send({ error: 'User not found' });

      // In a real scenario, you'd check the token_hash in DB to prevent reuse after revocation
      
      const accessToken = jwt.sign(
        { sub: user.id, username: user.username, user_id: Number(user.user_id) },
        process.env.JWT_SECRET as jwt.Secret,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' } as jwt.SignOptions
      );

      return { access_token: accessToken };
    } catch (err) {
      return reply.status(401).send({ error: 'Invalid refresh token' });
    }
  }
};

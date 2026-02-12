import { FastifyRequest, FastifyReply } from 'fastify';
import qrcode from 'qrcode';
import { prisma } from '../database';
import argon2 from 'argon2';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { authenticator } = require('otplib');

export const twoFactorController = {
  generate: async (request: FastifyRequest, reply: FastifyReply) => {
    const user = await prisma.users.findUnique({ where: { id: request.user.id } });
    if (!user) return reply.status(401).send({ error: 'User not found' });

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.username, 'Nautilus', secret);
    const qrImageUrl = await qrcode.toDataURL(otpauth);

    // Temporarily store secret (in a real app, store in Redis with TTL until confirmed)
    // For MVP, we save directly but don't enable yet
    await prisma.users.update({
      where: { id: user.id },
      data: { two_factor_secret: secret }
    });

    return { secret, qrImageUrl };
  },

  enable: async (request: FastifyRequest, reply: FastifyReply) => {
    const { token } = request.body as { token: string };
    const user = await prisma.users.findUnique({ where: { id: request.user.id } });
    
    if (!user || !user.two_factor_secret) {
      return reply.status(400).send({ error: '2FA setup not initiated' });
    }

    const isValid = authenticator.verify({ token, secret: user.two_factor_secret });
    if (!isValid) return reply.status(400).send({ error: 'Invalid token' });

    await prisma.users.update({
      where: { id: user.id },
      data: { is_two_factor_enabled: true }
    });

    return { success: true, message: '2FA enabled' };
  },

  disable: async (request: FastifyRequest, reply: FastifyReply) => {
    const { password } = request.body as { password: string };
    const user = await prisma.users.findUnique({ where: { id: request.user.id } });
    
    if (!user) return reply.status(401).send({ error: 'User not found' });

    const isValidPass = await argon2.verify(user.password_hash, password);
    if (!isValidPass) return reply.status(401).send({ error: 'Invalid password' });

    await prisma.users.update({
      where: { id: user.id },
      data: { is_two_factor_enabled: false, two_factor_secret: null }
    });

    return { success: true, message: '2FA disabled' };
  }
};

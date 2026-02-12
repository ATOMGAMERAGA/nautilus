import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../database';
import { z } from 'zod';
import { embedService } from '../services/embedService';
import path from 'path';
import fs from 'fs';
import { pipeline } from 'stream/promises';
import { randomUUID } from 'crypto';
import { metrics } from '../services/metricsService';

export const messageController = {
  send: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { channel_id } = request.params as { channel_id: string };
      const userId = request.user.id;
      
      let content = '';
      const attachments: any[] = [];

      if (request.isMultipart()) {
        const parts = request.parts();
        for await (const part of parts) {
          if (part.type === 'file') {
            const ext = path.extname(part.filename);
            const fileName = `${randomUUID()}${ext}`;
            const uploadPath = path.join(process.cwd(), 'uploads', fileName);
            
            await pipeline(part.file, fs.createWriteStream(uploadPath));
            
            attachments.push({
              filename: part.filename,
              file_url: `/uploads/${fileName}`,
              content_type: part.mimetype,
            });
          } else {
            if (part.fieldname === 'content') {
              content = (part as any).value;
            }
          }
        }
      } else {
        const body = request.body as { content: string };
        content = body.content;
      }

      const message = await prisma.messages.create({
        data: {
          channel_id,
          author_id: userId,
          content,
          attachments: {
            create: attachments
          }
        },
        include: {
          users: {
            select: {
              id: true,
              username: true,
              display_name: true,
              avatar_url: true,
              user_id: true
            }
          },
          attachments: true
        }
      });

      metrics.messagesSent.inc();

      // URL Embed resolution (Async)
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = content.match(urlRegex);
      if (urls) {
        for (const url of urls) {
          const embedData = await embedService.resolve(url);
          if (embedData) {
            await prisma.url_embeds.create({
              data: {
                message_id: message.id,
                ...embedData,
                url: embedData.url || url
              }
            });
          }
        }
      }

      // Refresh message to include embeds
      const finalMessage = await prisma.messages.findUnique({
        where: { id: message.id },
        include: {
          users: {
            select: {
              id: true,
              username: true,
              display_name: true,
              avatar_url: true,
              user_id: true
            }
          },
          attachments: true,
          url_embeds: true
        }
      });

      return reply.status(201).send(finalMessage);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  },

  list: async (request: FastifyRequest, reply: FastifyReply) => {
    const { channel_id } = request.params as { channel_id: string };
    const messages = await prisma.messages.findMany({
      where: { channel_id },
      orderBy: { created_at: 'desc' },
      take: 50,
      include: {
        users: {
          select: {
            id: true,
            username: true,
            display_name: true,
            avatar_url: true,
            user_id: true
          }
        },
        attachments: true,
        url_embeds: true
      }
    });
    return messages.reverse();
  },

  search: async (request: FastifyRequest, reply: FastifyReply) => {
    const { guild_id } = request.params as { guild_id: string };
    const { q } = request.query as { q: string };

    if (!q) return [];

    // Using raw query for full-text search with rank
    const messages = await prisma.$queryRaw`
      SELECT m.*, 
             u.username, u.display_name, u.avatar_url,
             ts_rank(m.search_vector, plainto_tsquery('simple', ${q})) as rank
      FROM messages m
      JOIN users u ON m.author_id = u.id
      JOIN channels c ON m.channel_id = c.id
      WHERE c.guild_id = ${guild_id}::uuid
        AND m.search_vector @@ plainto_tsquery('simple', ${q})
      ORDER BY rank DESC
      LIMIT 50
    `;

    return messages;
  }
};
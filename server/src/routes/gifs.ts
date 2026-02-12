import { FastifyInstance } from 'fastify';
import axios from 'axios';
import { authMiddleware } from '../middleware/auth';

export async function gifRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/search', async (request, reply) => {
    const { q } = request.query as { q: string };
    const TENOR_API_KEY = process.env.TENOR_API_KEY || 'LIVDSRZULEUB'; // Default for demo, should be in .env
    
    try {
      const response = await axios.get(`https://tenor.googleapis.com/v2/search?q=${q}&key=${TENOR_API_KEY}&limit=20`);
      return response.data.results.map((gif: any) => ({
        id: gif.id,
        url: gif.media_formats.gif.url,
        preview: gif.media_formats.tinygif.url,
      }));
    } catch (error) {
      return [];
    }
  });
}

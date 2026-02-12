"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoutes = healthRoutes;
const database_1 = require("../database");
const redis_1 = require("../config/redis");
async function healthRoutes(fastify) {
    fastify.get('/health', async (request, reply) => {
        let dbStatus = 'down';
        let redisStatus = 'down';
        try {
            await database_1.prisma.$queryRaw `SELECT 1`;
            dbStatus = 'ok';
        }
        catch (error) {
            fastify.log.error(error);
        }
        try {
            await redis_1.redis.ping();
            redisStatus = 'ok';
        }
        catch (error) {
            fastify.log.error(error);
        }
        const status = dbStatus === 'ok' && redisStatus === 'ok' ? 'ok' : 'degraded';
        return {
            status,
            timestamp: new Date().toISOString(),
            services: {
                database: { status: dbStatus },
                redis: { status: redisStatus },
            },
        };
    });
}

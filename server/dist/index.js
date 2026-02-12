"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const health_1 = require("./routes/health");
const fastify = (0, fastify_1.default)({
    logger: true,
});
async function main() {
    await fastify.register(cors_1.default, {
        origin: process.env.CORS_ORIGIN || '*',
    });
    await fastify.register(rate_limit_1.default, {
        max: 100,
        timeWindow: '1 minute',
    });
    await fastify.register(health_1.healthRoutes, { prefix: '/api' });
    try {
        const port = parseInt(process.env.PORT || '3000', 10);
        await fastify.listen({ port, host: '0.0.0.0' });
        console.log(`Server listening on port ${port}`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}
main();

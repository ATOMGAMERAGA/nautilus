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
const auth_1 = require("./routes/auth");
const guilds_1 = require("./routes/guilds");
const channels_1 = require("./routes/channels");
const gifs_1 = require("./routes/gifs");
const platformAdmin_1 = require("./routes/platformAdmin");
const metrics_1 = require("./routes/metrics");
const twoFactor_1 = require("./routes/twoFactor");
const notificationController_1 = require("./controllers/notificationController");
const auth_2 = require("./middleware/auth");
const gateway_1 = require("./websocket/gateway");
const VoiceServer_1 = require("./voice/VoiceServer");
const static_1 = __importDefault(require("@fastify/static"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const fastify = (0, fastify_1.default)({
    logger: true,
});
async function main() {
    const uploadDir = path_1.default.join(process.cwd(), 'uploads');
    if (!fs_1.default.existsSync(uploadDir)) {
        fs_1.default.mkdirSync(uploadDir);
    }
    // Initialize Voice Server (Mediasoup)
    await VoiceServer_1.voiceServer.initialize();
    await fastify.register(cors_1.default, {
        origin: process.env.CORS_ORIGIN || '*',
    });
    await fastify.register(multipart_1.default, {
        limits: {
            fileSize: 26214400, // 25MB
        }
    });
    await fastify.register(static_1.default, {
        root: uploadDir,
        prefix: '/uploads/',
    });
    await fastify.register(rate_limit_1.default, {
        max: 100,
        timeWindow: '1 minute',
    });
    await (0, gateway_1.setupWebsocket)(fastify);
    await fastify.register(health_1.healthRoutes, { prefix: '/api' });
    await fastify.register(auth_1.authRoutes, { prefix: '/api/auth' });
    await fastify.register(guilds_1.guildRoutes, { prefix: '/api/guilds' });
    await fastify.register(channels_1.channelRoutes, { prefix: '/api/channels' });
    await fastify.register(gifs_1.gifRoutes, { prefix: '/api/gifs' });
    await fastify.register(platformAdmin_1.platformAdminRoutes, { prefix: '/api/admin' });
    await fastify.register(twoFactor_1.twoFactorRoutes, { prefix: '/api/2fa' });
    await fastify.register(metrics_1.metricsRoutes);
    fastify.get('/api/notifications', { preHandler: [auth_2.authMiddleware] }, notificationController_1.notificationController.list);
    fastify.patch('/api/notifications/:id/read', { preHandler: [auth_2.authMiddleware] }, notificationController_1.notificationController.markAsRead);
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

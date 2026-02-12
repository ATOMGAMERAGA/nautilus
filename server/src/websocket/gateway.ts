import { WebSocketServer, WebSocket } from 'ws';
import { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
import { prisma } from '../database';
import { voiceServer } from '../voice/VoiceServer';
import { metrics } from '../services/metricsService';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

export async function setupWebsocket(fastify: FastifyInstance) {
  const wss = new WebSocketServer({ 
    server: fastify.server,
    path: '/gateway'
  });

  fastify.decorate('wss', wss);

  wss.on('connection', (ws: AuthenticatedWebSocket) => {
    metrics.activeConnections.inc();
    ws.isAlive = true;
    
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('close', () => {
      metrics.activeConnections.dec();
    });

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.op === 'IDENTIFY') {
          const token = message.d.token;
          const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
          ws.userId = payload.sub;
          
          // Send READY payload
          const user = await prisma.users.findUnique({
            where: { id: ws.userId },
            include: {
              guild_members: {
                include: { guilds: true }
              }
            }
          });

          ws.send(JSON.stringify({
            t: 'READY',
            d: {
              user: {
                id: user?.id,
                username: user?.username,
                display_name: user?.display_name,
                user_id: Number(user?.user_id)
              },
              guilds: user?.guild_members.map(m => m.guilds)
            }
          }));
        }

        if (message.op === 'HEARTBEAT') {
          ws.send(JSON.stringify({ op: 'HEARTBEAT_ACK' }));
        }

        // Voice Events
        if (message.op === 'voice:join') {
          const { roomId } = message.d;
          const user = await prisma.users.findUnique({ where: { id: ws.userId } });
          const { routerRtpCapabilities } = await voiceServer.joinRoom(roomId, ws.userId!, user?.display_name || 'User');
          
          ws.send(JSON.stringify({
            op: 'voice:joined',
            d: { routerRtpCapabilities }
          }));
        }

        if (message.op === 'voice:create-transport') {
          const { roomId } = message.d;
          const room = voiceServer.getRoom(roomId);
          if (room) {
            const transport = await room.createWebRtcTransport(ws.userId!);
            ws.send(JSON.stringify({
              op: 'voice:transport-created',
              d: transport
            }));
          }
        }

        if (message.op === 'voice:connect-transport') {
          const { roomId, transportId, dtlsParameters } = message.d;
          const room = voiceServer.getRoom(roomId);
          if (room) {
            await room.connectTransport(ws.userId!, transportId, dtlsParameters);
            ws.send(JSON.stringify({ op: 'voice:transport-connected', d: { transportId } }));
          }
        }

        if (message.op === 'voice:produce') {
          const { roomId, transportId, kind, rtpParameters } = message.d;
          const room = voiceServer.getRoom(roomId);
          if (room) {
            const { id } = await room.produce(ws.userId!, transportId, kind, rtpParameters);
            ws.send(JSON.stringify({ op: 'voice:produced', d: { id } }));
            
            // Broadcast new producer to others in room (simplified)
            // Ideally should filter by roomId
            wss.clients.forEach((client: AuthenticatedWebSocket) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  op: 'voice:new-producer',
                  d: { producerId: id, userId: ws.userId }
                }));
              }
            });
          }
        }

        if (message.op === 'voice:consume') {
          const { roomId, producerId, rtpCapabilities } = message.d;
          const room = voiceServer.getRoom(roomId);
          if (room) {
            const params = await room.consume(ws.userId!, producerId, rtpCapabilities);
            ws.send(JSON.stringify({ op: 'voice:consumed', d: params }));
          }
        }

      } catch (err) {
        console.error(err);
        // ws.close(4000, 'Authentication failed or Error');
      }
    });
  });

  // Heartbeat interval
  const interval = setInterval(() => {
    wss.clients.forEach((ws: AuthenticatedWebSocket) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => clearInterval(interval));
}

// Broadcast helper for future use
export function broadcastToGuild(wss: WebSocketServer, guildId: string, event: string, data: any) {
  // In a real app, you'd map userId -> Socket and check guild membership
  // For MVP, we can iterate or use a more efficient mapping
}

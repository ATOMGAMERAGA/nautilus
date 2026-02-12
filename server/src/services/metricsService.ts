import client from 'prom-client';

// Enable default system metrics (CPU, RAM, Event Loop)
client.collectDefaultMetrics({ prefix: 'nautilus_' });

export const metrics = {
  activeConnections: new client.Gauge({
    name: 'nautilus_websocket_connections_active',
    help: 'Number of active WebSocket connections',
  }),
  
  activeVoiceRooms: new client.Gauge({
    name: 'nautilus_voice_rooms_active',
    help: 'Number of active voice rooms (mediasoup routers)',
  }),

  connectedVoicePeers: new client.Gauge({
    name: 'nautilus_voice_peers_connected',
    help: 'Number of users connected to voice channels',
  }),

  messagesSent: new client.Counter({
    name: 'nautilus_messages_sent_total',
    help: 'Total number of messages sent',
  }),

  dbQueryDuration: new client.Histogram({
    name: 'nautilus_db_query_duration_seconds',
    help: 'Duration of database queries in seconds',
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  }),
};

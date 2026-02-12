import * as mediasoup from 'mediasoup';
import { config } from './MediasoupConfig';
import { Room } from './Room';
import { Peer } from './Peer';

class VoiceServer {
  private workers: mediasoup.types.Worker[] = [];
  private rooms: Map<string, Room> = new Map();
  private workerIndex = 0;

  async initialize() {
    const numWorkers = 2; // For demo
    for (let i = 0; i < numWorkers; i++) {
      const worker = await mediasoup.createWorker({
        ...config.worker,
      });
      
      worker.on('died', () => {
        console.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid);
        setTimeout(() => process.exit(1), 2000);
      });

      this.workers.push(worker);
    }
    console.log(`Started ${numWorkers} mediasoup workers`);
  }

  private getNextWorker() {
    const worker = this.workers[this.workerIndex];
    this.workerIndex = (this.workerIndex + 1) % this.workers.length;
    return worker;
  }

  async joinRoom(roomId: string, userId: string, displayName: string) {
    let room = this.rooms.get(roomId);
    if (!room) {
      const worker = this.getNextWorker();
      const router = await worker.createRouter({ mediaCodecs: config.router.mediaCodecs });
      room = new Room(roomId, router);
      this.rooms.set(roomId, room);
    }

    let peer = room.getPeer(userId);
    if (!peer) {
      peer = new Peer(userId, displayName);
      room.addPeer(peer);
    }

    return { 
      room, 
      peer,
      routerRtpCapabilities: room.router.rtpCapabilities 
    };
  }

  getRoom(roomId: string) {
    return this.rooms.get(roomId);
  }
}

export const voiceServer = new VoiceServer();

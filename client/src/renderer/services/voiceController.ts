import * as mediasoupClient from 'mediasoup-client';
import { gateway } from './gateway';
import { isAndroid } from './platform';

class VoiceController {
  device: mediasoupClient.types.Device;
  sendTransport: mediasoupClient.types.Transport | undefined;
  recvTransport: mediasoupClient.types.Transport | undefined;
  
  producers: Map<string, mediasoupClient.types.Producer> = new Map();
  consumers: Map<string, mediasoupClient.types.Consumer> = new Map();
  
  constructor() {
    this.device = new mediasoupClient.Device();
  }

  async join(roomId: string) {
    gateway.send({ op: 'voice:join', d: { roomId } });
  }

  async loadDevice(routerRtpCapabilities: any) {
    if (!this.device.loaded) {
      await this.device.load({ routerRtpCapabilities });
    }
  }

  async initTransports(roomId: string) {
    // This would typically involve requesting transport creation from server
    // For prototype, we'll call create-transport for send and recv
    gateway.send({ op: 'voice:create-transport', d: { roomId, direction: 'send' } });
    gateway.send({ op: 'voice:create-transport', d: { roomId, direction: 'recv' } });
  }

  async produce(kind: 'audio' | 'video', stream: MediaStream, _roomId: string) {
    if (!this.sendTransport) return;
    
    const track = kind === 'audio' ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0];
    if (!track) return;

    const producer = await this.sendTransport.produce({ track });
    this.producers.set(kind, producer);

    producer.on('transportclose', () => {
      this.producers.delete(kind);
    });

    return producer;
  }

  async startVideo(roomId: string) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      await this.produce('video', stream, roomId);
      return stream;
    } catch (err) {
      console.error('Start video error:', err);
    }
  }

  async startScreenShare(roomId: string) {
    if (isAndroid) {
      console.warn('Screen sharing is not supported on Android WebView');
      return undefined;
    }

    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true });
      await this.produce('video', stream, roomId);
      return stream;
    } catch (err) {
      console.error('Screen share error:', err);
    }
  }

  async stopProduce(kind: 'audio' | 'video') {
    const producer = this.producers.get(kind);
    if (producer) {
      producer.close();
      this.producers.delete(kind);
      // Notify server if needed
    }
  }
}

export const voiceController = new VoiceController();
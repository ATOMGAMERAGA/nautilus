import * as mediasoup from 'mediasoup';
import { config } from './MediasoupConfig';
import { Peer } from './Peer';

export class Room {
  public id: string;
  public router: mediasoup.types.Router;
  public peers: Map<string, Peer> = new Map();

  constructor(id: string, router: mediasoup.types.Router) {
    this.id = id;
    this.router = router;
  }

  addPeer(peer: Peer) {
    this.peers.set(peer.id, peer);
  }

  getPeer(peerId: string) {
    return this.peers.get(peerId);
  }

  removePeer(peerId: string) {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.close();
      this.peers.delete(peerId);
    }
    // If room is empty, it should be closed by VoiceServer
  }

  async createWebRtcTransport(peerId: string) {
    const peer = this.peers.get(peerId);
    if (!peer) throw new Error('Peer not found');

    const transport = await this.router.createWebRtcTransport({
      ...config.webRtcTransport,
      appData: { peerId }
    });

    peer.addTransport(transport);

    return {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    };
  }

  async connectTransport(peerId: string, transportId: string, dtlsParameters: any) {
    const peer = this.peers.get(peerId);
    if (!peer) throw new Error('Peer not found');
    const transport = peer.getTransport(transportId);
    if (!transport) throw new Error('Transport not found');

    await transport.connect({ dtlsParameters });
  }

  async produce(peerId: string, transportId: string, kind: any, rtpParameters: any) {
    const peer = this.peers.get(peerId);
    if (!peer) throw new Error('Peer not found');
    const transport = peer.getTransport(transportId);
    if (!transport) throw new Error('Transport not found');

    const producer = await transport.produce({ kind, rtpParameters });
    peer.addProducer(producer);

    return { id: producer.id };
  }

  async consume(peerId: string, producerId: string, rtpCapabilities: any) {
    if (!this.router.canConsume({ producerId, rtpCapabilities })) {
      throw new Error('Cannot consume');
    }

    const peer = this.peers.get(peerId);
    if (!peer) throw new Error('Peer not found');
    
    // Find a transport that is NOT used for producing (simplification)
    // In reality, we usually have separate transports for send and recv
    // Here we assume client sends correct transportId or we pick the recv one
    // For this prototype, we'll iterate to find a transport or assume the client manages transport selection
    // But consume usually happens on RecvTransport.
    
    // Let's assume we find the first transport for now, client should really tell us which one
    const transport = Array.from(peer.transports.values())[0]; 
    if (!transport) throw new Error('No transport found for consumption');

    const consumer = await transport.consume({
      producerId,
      rtpCapabilities,
      paused: true, // Start paused
    });

    peer.addConsumer(consumer);

    return {
      id: consumer.id,
      producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
    };
  }
}

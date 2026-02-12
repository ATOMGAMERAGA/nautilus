import * as mediasoup from 'mediasoup';

export class Peer {
  public id: string;
  public displayName: string;
  public device: any;
  public rtpCapabilities: mediasoup.types.RtpCapabilities | undefined;
  
  public transports: Map<string, mediasoup.types.WebRtcTransport> = new Map();
  public producers: Map<string, mediasoup.types.Producer> = new Map();
  public consumers: Map<string, mediasoup.types.Consumer> = new Map();

  constructor(id: string, displayName: string) {
    this.id = id;
    this.displayName = displayName;
  }

  addTransport(transport: mediasoup.types.WebRtcTransport) {
    this.transports.set(transport.id, transport);
  }

  getTransport(transportId: string) {
    return this.transports.get(transportId);
  }

  addProducer(producer: mediasoup.types.Producer) {
    this.producers.set(producer.id, producer);
  }

  getProducer(producerId: string) {
    return this.producers.get(producerId);
  }

  removeProducer(producerId: string) {
    this.producers.delete(producerId);
  }

  addConsumer(consumer: mediasoup.types.Consumer) {
    this.consumers.set(consumer.id, consumer);
  }

  removeConsumer(consumerId: string) {
    this.consumers.delete(consumerId);
  }

  close() {
    this.transports.forEach(transport => transport.close());
    this.producers.forEach(producer => producer.close());
    this.consumers.forEach(consumer => consumer.close());
  }
}

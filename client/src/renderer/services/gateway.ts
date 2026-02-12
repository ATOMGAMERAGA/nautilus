import { useChatStore } from '../store/chatStore';

class Gateway {
  private ws: WebSocket | null = null;
  private url = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/gateway';

  connect(token: string) {
    if (this.ws) return;

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.send({
        op: 'IDENTIFY',
        d: { token }
      });
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onclose = () => {
      this.ws = null;
      // Implement reconnect logic here
    };
  }

  private handleMessage(payload: any) {
    const { t, d, op } = payload;

    if (op === 'HEARTBEAT_ACK') {
      // Handle heartbeat ack
    }

    switch (t) {
      case 'READY':
        useChatStore.setState({ guilds: d.guilds });
        break;
      case 'MESSAGE_CREATE':
        useChatStore.getState().addMessage(d);
        break;
    }
  }

  public send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const gateway = new Gateway();

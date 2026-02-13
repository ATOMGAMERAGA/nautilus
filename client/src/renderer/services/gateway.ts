import { useChatStore } from '../store/chatStore';
import { isNative } from './platform';

class Gateway {
  private ws: WebSocket | null = null;
  private url = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/gateway';
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private networkListenerRegistered = false;

  connect(token: string) {
    if (this.ws) return;
    this.token = token;
    this.reconnectAttempts = 0;
    this.openSocket();
    this.registerNetworkListener();
  }

  private openSocket() {
    if (this.ws) return;
    if (!this.token) return;

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.send({
        op: 'IDENTIFY',
        d: { token: this.token }
      });
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onclose = () => {
      this.ws = null;
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      // onclose will fire after onerror
    };
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    if (this.reconnectTimer) return;

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.openSocket();
    }, delay);
  }

  private async registerNetworkListener() {
    if (this.networkListenerRegistered) return;
    this.networkListenerRegistered = true;

    if (isNative) {
      const { Network } = await import('@capacitor/network');
      Network.addListener('networkStatusChange', (status) => {
        if (status.connected && !this.ws) {
          this.reconnectAttempts = 0;
          this.openSocket();
        }
      });
    }

    window.addEventListener('online', () => {
      if (!this.ws) {
        this.reconnectAttempts = 0;
        this.openSocket();
      }
    });
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
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.token = null;
    this.reconnectAttempts = this.maxReconnectAttempts;
  }
}

export const gateway = new Gateway();

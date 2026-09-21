import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws';

class WebSocketService {
  private client: Client | null = null;
  private isConnected = false;

  public connect(onConnected?: () => void, onError?: (err: any) => void) {
    if (this.client && this.isConnected) {
      if (onConnected) onConnected();
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: () => {
        // quiet debug in production
      },
      onConnect: () => {
        this.isConnected = true;
        if (onConnected) onConnected();
      },
      onStompError: (frame) => {
        console.error('STOMP broker error: ' + frame.headers['message']);
        if (onError) onError(frame);
      },
      onDisconnect: () => {
        this.isConnected = false;
      },
    });

    this.client.activate();
  }

  public subscribe(topic: string, callback: (data: any) => void) {
    if (!this.client) {
      this.connect(() => {
        this.subscribe(topic, callback);
      });
      return () => {};
    }

    if (this.client.connected) {
      const sub = this.client.subscribe(topic, (message: IMessage) => {
        try {
          const payload = JSON.parse(message.body);
          callback(payload);
        } catch {
          callback(message.body);
        }
      });
      return () => sub.unsubscribe();
    } else {
      const timeout = setTimeout(() => {
        this.subscribe(topic, callback);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }

  public send(destination: string, body: any) {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination,
        body: JSON.stringify(body),
      });
    }
  }

  public disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
    }
  }
}

export const wsService = new WebSocketService();

export const connectWebSocket = (userId: number, onNotification: (notification: any) => void) => {
  wsService.connect();
  return wsService.subscribe(`/topic/notifications/${userId}`, onNotification);
};

export const disconnectWebSocket = () => {
  wsService.disconnect();
};

export default wsService;


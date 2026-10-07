import { Client, IMessage } from '@stomp/stompjs';

function getBrokerUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (envUrl) {
    if (envUrl.startsWith('ws://') || envUrl.startsWith('wss://')) {
      return envUrl;
    }
    if (envUrl.startsWith('http://')) {
      return envUrl.replace(/^http:\/\//, 'ws://');
    }
    if (envUrl.startsWith('https://')) {
      return envUrl.replace(/^https:\/\//, 'wss://');
    }
    if (typeof window !== 'undefined' && envUrl.startsWith('/')) {
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${proto}//${window.location.host}${envUrl}`;
    }
  }
  if (typeof window !== 'undefined') {
    const isHttps = window.location.protocol === 'https:';
    return isHttps ? 'wss://localhost:8080/ws' : 'ws://localhost:8080/ws';
  }
  return 'ws://localhost:8080/ws';
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      const parsed = JSON.parse(authData);
      if (parsed?.state?.token) {
        return parsed.state.token;
      }
      if (parsed?.state?.accessToken) {
        return parsed.state.accessToken;
      }
    }
    return localStorage.getItem('token') || localStorage.getItem('access_token');
  } catch {
    return null;
  }
}

type SubscriptionCallback = (data: any) => void;

class WebSocketService {
  private client: Client | null = null;
  private isConnected = false;
  private activeSubscriptions = new Map<string, Set<SubscriptionCallback>>();

  public connect(onConnected?: () => void, onError?: (err: any) => void) {
    if (this.client && this.isConnected) {
      if (onConnected) onConnected();
      return;
    }

    const brokerUrl = getBrokerUrl();
    const token = getAuthToken();

    this.client = new Client({
      brokerURL: brokerUrl,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {
        // Silent in production
      },
      beforeConnect: () => {
        const freshToken = getAuthToken();
        if (freshToken && this.client) {
          this.client.connectHeaders = { Authorization: `Bearer ${freshToken}` };
        }
      },
      onConnect: () => {
        this.isConnected = true;
        // Re-establish all registered subscriptions on reconnect
        this.activeSubscriptions.forEach((callbacks, topic) => {
          this.attachSubscription(topic, callbacks);
        });
        if (onConnected) onConnected();
      },
      onStompError: (frame) => {
        console.warn('STOMP broker error:', frame.headers['message']);
        if (onError) onError(frame);
      },
      onDisconnect: () => {
        this.isConnected = false;
      },
    });

    this.client.activate();
  }

  private attachSubscription(topic: string, callbacks: Set<SubscriptionCallback>) {
    if (!this.client || !this.client.connected) return;
    this.client.subscribe(topic, (message: IMessage) => {
      try {
        const payload = JSON.parse(message.body);
        callbacks.forEach((cb) => cb(payload));
      } catch {
        callbacks.forEach((cb) => cb(message.body));
      }
    });
  }

  public subscribe(topic: string, callback: SubscriptionCallback): () => void {
    if (!this.activeSubscriptions.has(topic)) {
      this.activeSubscriptions.set(topic, new Set());
    }
    this.activeSubscriptions.get(topic)!.add(callback);

    if (!this.client || !this.isConnected) {
      this.connect(() => {
        this.attachSubscription(topic, this.activeSubscriptions.get(topic)!);
      });
    } else if (this.client.connected) {
      this.attachSubscription(topic, this.activeSubscriptions.get(topic)!);
    }

    return () => {
      const set = this.activeSubscriptions.get(topic);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.activeSubscriptions.delete(topic);
        }
      }
    };
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
      this.activeSubscriptions.clear();
    }
  }
}

export const wsService = new WebSocketService();

// Real-time Order Tracking Hook / Helper
export const subscribeToOrder = (orderId: number, onUpdate: (payload: any) => void) => {
  return wsService.subscribe(`/topic/orders/${orderId}`, onUpdate);
};

// Real-time Driver GPS Location for an Order
export const subscribeToOrderLocation = (orderId: number, onLocation: (location: any) => void) => {
  return wsService.subscribe(`/topic/orders/${orderId}/location`, onLocation);
};

// Real-time Kitchen Orders for Restaurant Owners
export const subscribeToRestaurantOrders = (restaurantId: number, onNewOrder: (order: any) => void) => {
  return wsService.subscribe(`/topic/restaurants/${restaurantId}/orders`, onNewOrder);
};

// Real-time Available Deliveries for Drivers
export const subscribeToAvailableDeliveries = (onDelivery: (delivery: any) => void) => {
  return wsService.subscribe('/topic/deliveries/available', onDelivery);
};

// Real-time Driver GPS Location by Driver ID
export const subscribeToDriverLocation = (driverId: number, onLocation: (location: any) => void) => {
  return wsService.subscribe(`/topic/drivers/${driverId}/location`, onLocation);
};

// Real-time In-App Notifications
export const connectWebSocket = (userId: number, onNotification: (notification: any) => void) => {
  wsService.connect();
  return wsService.subscribe(`/topic/notifications/${userId}`, onNotification);
};

export const disconnectWebSocket = () => {
  wsService.disconnect();
};

export default wsService;

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  // KDS specific events
  subscribeToKDSUpdates(callback: (order: any) => void) {
    if (this.socket) {
      this.socket.on('kds:order:new', callback);
      this.socket.on('kds:order:update', callback);
      this.socket.on('kds:item:update', callback);
    }
  }

  unsubscribeFromKDSUpdates() {
    if (this.socket) {
      this.socket.off('kds:order:new');
      this.socket.off('kds:order:update');
      this.socket.off('kds:item:update');
    }
  }

  // Order status updates
  subscribeToOrderUpdates(callback: (order: any) => void) {
    if (this.socket) {
      this.socket.on('order:status:update', callback);
    }
  }

  unsubscribeFromOrderUpdates() {
    if (this.socket) {
      this.socket.off('order:status:update');
    }
  }
}

export const socketService = new SocketService();



import { io, Socket } from 'socket.io-client';

const BE_URL = (import.meta as any).env?.DEV
  ? 'http://localhost:5000'
  : 'https://pwa-home-be.onrender.com';

let _socket: Socket | null = null;

// Singleton — chỉ 1 kết nối socket cho toàn app
export const getSocket = (): Socket => {
  if (!_socket) {
    _socket = io(BE_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: false, // Kết nối thủ công khi cần
    });
  }
  return _socket;
};

export const connectSocket = (): Socket => {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
};

export const disconnectSocket = () => {
  if (_socket?.connected) {
    _socket.disconnect();
  }
};

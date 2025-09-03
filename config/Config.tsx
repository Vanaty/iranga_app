
export class Config {
  static API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';
  static WEBSOCKET_URL = process.env.EXPO_PUBLIC_WEBSOCKET_URL || 'http://localhost:8080/ws';
}

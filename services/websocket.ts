import { Config } from '@/config/Config';
import type { InstantMessage, Message, Publication } from '../types/chat';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export class WebSocketService {
  private wsUrl: string = Config.WEBSOCKET_URL;
  private client: Client | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 10000;

  constructor(
    private onMessage: (message: Message) => void, 
    private onUserStatusChange: (users: string[]) => void,
    private onTypingStatusChange?: (chatId: number, user: string, isTyping: boolean) => void,
    private onMessageRead?: (chatId: number, messageId: number) => void,
    private onNewPublication?: (publication: Publication) => void,
    private onPublicationUpdate?: (publication: Publication) => void,
    private onNewComment?: (comment: Comment) => void
  ) {}

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.client = new Client({
          webSocketFactory: () => new SockJS(this.wsUrl),
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },
          debug: (str) => {
            console.log('STOMP Debug:', str);
          },
          reconnectDelay: this.reconnectInterval,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        this.client.onConnect = () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // Subscribe to user status updates
          this.client?.subscribe('/topic/users/online', (message) => {
            const onlineUsers: string[] = JSON.parse(message.body);
            this.onUserStatusChange(onlineUsers);
          });

          // Subscribe to publications updates
          this.client?.subscribe('/topic/publications', (message) => {
            const publication: Publication = JSON.parse(message.body);
            if (this.onNewPublication) {
              this.onNewPublication(publication);
            }
          });

          // Subscribe to publication likes/comments
          this.client?.subscribe('/topic/publications/updates', (message) => {
            const publication: Publication = JSON.parse(message.body);
            if (this.onPublicationUpdate) {
              this.onPublicationUpdate(publication);
            }
          });

          // Subscribe to comments
          this.client?.subscribe('/topic/comments', (message) => {
            const comment: Comment = JSON.parse(message.body);
            if (this.onNewComment) {
              this.onNewComment(comment);
            }
          });

          resolve();
        };

        this.client.onStompError = (frame) => {
          console.error('STOMP error:', frame);
          this.isConnected = false;
          reject(new Error(`STOMP error: ${frame.headers.message}`));
        };

        this.client.onWebSocketError = (error) => {
          console.error('WebSocket error:', error);
          this.isConnected = false;
          reject(error);
        };

        this.client.onDisconnect = () => {
          console.log('WebSocket disconnected');
          this.isConnected = false;
          this.attemptReconnect(token);
        };

        this.client.activate();
      } catch (error) {
        console.error('Error connecting to WebSocket:', error);
        reject(error);
      }
    });
  }

  subscribeToChat(chatId: number): () => void {
    if (!this.client || !this.isConnected) {
      console.warn('Cannot subscribe to chat: WebSocket not connected');
      return () => {};
    }

    const messageSubscription = this.client.subscribe(`/topic/chat/${chatId}`, (message) => {
      try {
        const chatMessage: Message = JSON.parse(message.body);
        console.log("Received chat message:", chatMessage);
        this.onMessage(chatMessage);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    const typingSubscription = this.client.subscribe(`/topic/chat/${chatId}/typing`, (message) => {
      try {
        const typingData = JSON.parse(message.body);
        if (this.onTypingStatusChange) {
          this.onTypingStatusChange(chatId, typingData.username, typingData.typing);
        }
      } catch (error) {
        console.error('Error parsing typing status:', error);
      }
    });

    const readSubscription = this.client.subscribe(`/topic/chat/${chatId}/read`, (message) => {
      try {
        const readData = JSON.parse(message.body);
        if (this.onMessageRead) {
          this.onMessageRead(chatId, readData.messageId);
        }
      } catch (error) {
        console.error('Error parsing read status:', error);
      }
    });

    return () => {
      messageSubscription.unsubscribe();
      typingSubscription.unsubscribe();
      readSubscription.unsubscribe();
    };
  }

  sendMessage(chatId: number, message: Partial<InstantMessage>): void {
    if (!this.client || !this.isConnected) {
      console.warn('Cannot send message: WebSocket not connected');
      return;
    }

    this.client.publish({
      destination: `/app/chat.message`,
      body: JSON.stringify(message),
    });
  }

  sendTypingStatus(chatId: number, isTyping: boolean): void {
    if (!this.client || !this.isConnected) {
      return;
    }

    this.client.publish({
      destination: `/app/chat/${chatId}/typing`,
      body: JSON.stringify({ typing: isTyping }),
    });
  }

  markMessageAsRead(chatId: number, messageId: number): void {
    if (!this.client || !this.isConnected) {
      return;
    }

    this.client.publish({
      destination: `/app/chat/${chatId}/read`,
      body: JSON.stringify({ messageId }),
    });
  }

  publishNotification(userId: number, title: string, body: string, data?: any): void {
    if (!this.client || !this.isConnected) {
      return;
    }

    this.client.publish({
      destination: `/app/notifications/${userId}`,
      body: JSON.stringify({ title, body, data }),
    });
  }

  private attemptReconnect(token: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      if (!this.isConnected) {
        this.connect(token).catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }
    }, this.reconnectInterval);
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.isConnected = false;
    }
  }

  isWebSocketConnected(): boolean {
    return this.isConnected;
  }
}
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Publication, Message, Chat, User, Comment as CommentType } from '@/types/chat';
import { WebSocketService } from '@/services/websocket';
import { publicationAPI, chatAPI } from '@/services/api';
import { NotificationService } from '@/services/notifications';
import { useAuth } from './AuthContext';

interface ChatContextType {
  publications: Publication[];
  chats: Chat[];
  messages: { [chatId: number]: Message[] };
  onlineUsers: string[];
  typingUsers: { [chatId: number]: string[] };
  unreadMessages: number;
  isConnected: boolean;
  webSocketService: WebSocketService | null;
  refreshPublications: () => Promise<void>;
  addPublication: (publication: Publication) => void;
  updatePublication: (publication: Publication) => void;
  addMessage: (message: Message) => void;
  connectWebSocket: () => Promise<void>;
  disconnectWebSocket: () => void;
  markMessageAsRead: (chatId: number, messageId: number) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<{ [chatId: number]: Message[] }>({});
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<{ [chatId: number]: string[] }>({});
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [webSocketService, setWebSocketService] = useState<WebSocketService | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadInitialData();
      initializeWebSocket();
    } else {
      disconnectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [isAuthenticated, user]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        refreshPublications(),
        loadChats(),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const refreshPublications = async () => {
    try {
      const response = await publicationAPI.getAllPublications();
      setPublications(response.content);
    } catch (error) {
      console.error('Error loading publications:', error);
    }
  };

  const loadChats = async () => {
    try {
      const response = await chatAPI.getUserChats();
      setChats(response.content);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const initializeWebSocket = async () => {
    if (!user) return;

    const handleTypingUsers = (chatId: number, users: string[]) => {
      setTypingUsers(prev => ({
        ...prev,
        [chatId]: users,
      }));
    };

    try {
      const token = await require('@react-native-async-storage/async-storage').default.getItem('authToken');
      if (!token) return;

      const wsService = new WebSocketService(
        handleNewMessage,
        setOnlineUsers,
        handleTypingUsers,
        handleMessageRead,
        addPublication,
        updatePublication,
        handleNewComment
      );

      await wsService.connect(token);
      setWebSocketService(wsService);
      setIsConnected(true);
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      setIsConnected(false);
    }
  };

  const handleNewMessage = async (message: Message) => {
    setMessages(prev => ({
      ...prev,
      [message.chat.id]: [message, ...(prev[message.chat.id] || [])],
    }));

    // Show notification if message is not from current user
    if (message.sender.id !== user?.id) {
      setUnreadMessages(prev => prev + 1);
      try {
        await NotificationService.scheduleLocalNotification(
          `${message.sender.firstName} ${message.sender.lastName}`,
          message.contentText,
          { chatId: message.chat.id, messageId: message.id }
        );
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }
  };

  const handleMessageRead = (chatId: number, messageId: number) => {
    setMessages(prev => ({
      ...prev,
      [chatId]: prev[chatId]?.map(msg =>
        msg.id === messageId ? { ...msg, read: true } : msg
      ) || [],
    }));
  };

  const handleNewComment = async (comment: any) => {
    // Update publication comments count
    setPublications(prev =>
      prev.map(pub =>
        pub.id === comment.publication.id
          ? { ...pub, commentsCount: pub.commentsCount + 1 }
          : pub
      )
    );

    // Show notification if comment is not from current user
    if (comment.author.id !== user?.id) {
      await NotificationService.scheduleLocalNotification(
        `${comment.author.firstName} ${comment.author.lastName}`,
        `A commenté votre publication: ${comment.content.substring(0, 50)}...`,
        { publicationId: comment.publication.id, commentId: comment.id }
      );
    }
  };

  const addPublication = (publication: Publication) => {
    setPublications(prev => [publication, ...prev]);
  };

  const updatePublication = (updatedPublication: Publication) => {
    setPublications(prev =>
      prev.map(pub =>
        pub.id === updatedPublication.id ? updatedPublication : pub
      )
    );
  };

  const addMessage = (message: Message) => {
    setMessages(prev => ({
      ...prev,
      [message.chat.id]: [message, ...(prev[message.chat.id] || [])],
    }));
  };

  const markMessageAsRead = (chatId: number, messageId: number) => {
    if (webSocketService) {
      webSocketService.markMessageAsRead(chatId, messageId);
    }
    handleMessageRead(chatId, messageId);
  };

  const connectWebSocket = async () => {
    if (!isConnected) {
      await initializeWebSocket();
    }
  };

  const disconnectWebSocket = () => {
    if (webSocketService) {
      webSocketService.disconnect();
      setWebSocketService(null);
      setIsConnected(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        publications,
        chats,
        messages,
        onlineUsers,
        typingUsers,
        unreadMessages,
        isConnected,
        webSocketService,
        refreshPublications,
        addPublication,
        updatePublication,
        addMessage,
        connectWebSocket,
        disconnectWebSocket,
        markMessageAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

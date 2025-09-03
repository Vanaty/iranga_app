import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Publication, Message, Chat, User, Comment as CommentType } from '@/types/chat';
import { WebSocketService } from '@/services/websocket';
import { publicationAPI, chatAPI } from '@/services/api';
import { NotificationService } from '@/services/notifications';
import { StorageService } from '@/services/storage';
import { useAuth } from './AuthContext';

interface ChatContextType {
  publications: Publication[];
  chats: Chat[];
  messages: { [chatId: number]: Message[] };
  onlineUsers: string[];
  typingUser: { [chatId: number]: string[] };
  unreadMessages: number;
  unreadByChat: { [chatId: number]: number };
  isConnected: boolean;
  webSocketService: WebSocketService | null;
  refreshPublications: () => Promise<void>;
  addPublication: (publication: Publication) => void;
  updatePublication: (publication: Publication) => void;
  addChat: (chat: Chat) => void;
  addMessage: (message: Message) => void;
  connectWebSocket: () => Promise<void>;
  disconnectWebSocket: () => void;
  markMessageAsRead: (chatId: number, messageId: number) => void;
  setChatMessages: (chatId: number, messages: Message[]) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<{ [chatId: number]: Message[] }>({});
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUser, setTypingUser] = useState<{ [chatId: number]: string[] }>({});
  const [unreadMessages, setUnreadMessages] = useState(10);
  const [unreadByChat, setUnreadByChat] = useState<{ [chatId: number]: number }>({});
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

  useEffect(() => {
    const unreadCounts = chats.reduce((acc, chat) => {
      acc[chat.id] = messages[chat.id]?.filter(msg => !msg.read && msg.sender.id !== user?.id).length || 0;
      return acc;
    }, {} as { [chatId: number]: number });
    setUnreadMessages(Object.values(unreadCounts).reduce((a, b) => a + b, 0));
    setUnreadByChat(unreadCounts);
  }, [messages, user]);

    useEffect(() => {
      if (webSocketService?.isWebSocketConnected()) {
        console.log('Subscribing to chat updates via WebSocket', chats);
        const unsubscribes: (() => void)[] = [];
    
        chats.forEach(chat => {
          const unsubscribe = webSocketService.subscribeToChat(chat.id);
          unsubscribes.push(unsubscribe);
        });
    
        return () => {
          unsubscribes.forEach(unsub => unsub());
        };
      }
  }, [chats, webSocketService?.isWebSocketConnected()]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadChats(),
        refreshPublications(),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const refreshPublications = async () => {
    try {
      // Charger depuis le cache local d'abord
      const localPublications = await StorageService.getPublications();
      if (localPublications.length > 0) {
        setPublications(localPublications);
      }

      // Puis synchroniser avec le serveur
      const response = await publicationAPI.getAllPublications();
      setPublications(response.content);
      await StorageService.savePublications(response.content);
    } catch (error) {
      console.error('Error loading publications:', error);
    }
  };

  const addChat = (chat: Chat) => {
    setChats(prev => [...prev, chat]);
  };

  const loadChats = async () => {
    try {
      // Charger depuis le cache local d'abord
      const localChats = await StorageService.getChats();
      if (localChats.length > 0) {
        setChats(localChats);
      }

      // Puis synchroniser avec le serveur
      const response = await chatAPI.getUserChats();
      setChats(response.content);
      await StorageService.saveChats(response.content);

    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const initializeWebSocket = async () => {
    if (!user) return;

    const handleTypingUser = (chatId: number, user: string, isTyping: boolean) => {
      setTypingUser(prev => ({
        ...prev,
        [chatId]: isTyping
          ? [...(prev[chatId] || []), user]
          : prev[chatId]?.filter(u => u !== user) || [],
      }));
    };

    try {
      const token = await StorageService.getAuthToken();
      if (!token) return;

      // Déconnecter le service précédent s'il existe
      if (webSocketService) {
        webSocketService.disconnect();
      }

      const wsService = new WebSocketService(
        handleNewMessage,
        setOnlineUsers,
        handleTypingUser,
        handleMessageRead,
        addPublication,
        updatePublication,
        handleNewComment
      );

      await wsService.connect(token);
      setWebSocketService(wsService);
      setIsConnected(true);
      console.log('WebSocket service initialized successfully');
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
    try {
      await StorageService.addMessage(message.chat.id, message);
      
      if (message.sender.id === user?.id) return;
      await NotificationService.scheduleLocalNotification(
        `${message.sender.firstName} ${message.sender.lastName}`,
        message.contentText,
        { chatId: message.chat.id, messageId: message.id }
      );
    } catch (error) {
      console.error('Error storing WebSocket message:', error);
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
    setPublications(prev => {
      const updated = [publication, ...prev];
      StorageService.addPublication(publication).catch(console.error);
      return updated;
    });
  };

  const updatePublication = (updatedPublication: Publication) => {
    setPublications(prev => {
      const updated = prev.map(pub =>
        pub.id === updatedPublication.id ? updatedPublication : pub
      );
      StorageService.savePublications(updated).catch(console.error);
      return updated;
    });
  };

  const addMessage = (message: Message) => {
    setMessages(prev => {
      const updated = {
        ...prev,
        [message.chat.id]: [message, ...(prev[message.chat.id] || [])],
      };
      StorageService.addMessage(message.chat.id, message).catch(console.error);
      
      return updated;
    });
  };

  const setChatMessages = (chatId: number, messages: Message[]) => {
    setMessages(prev => ({
      ...prev,
      [chatId]: messages,
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
        typingUser,
        unreadMessages,
        unreadByChat,
        isConnected,
        webSocketService,
        refreshPublications,
        addPublication,
        updatePublication,
        addMessage,
        addChat,
        connectWebSocket,
        disconnectWebSocket,
        markMessageAsRead,
        setChatMessages,
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

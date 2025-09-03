import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import { Message, MessageType, Chat, InstantMessage } from '@/types/chat';
import { chatAPI } from '@/services/api';
import { StorageService } from '@/services/storage';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { MessageBubble } from '@/components/MessageBubble';
import { ChatInput } from '@/components/ChatInput';
import { ArrowLeft, Phone, Video, MoreVertical, Circle, UsersIcon } from 'lucide-react-native';
import { FileUploadService } from '@/services/fileUpload';
import { FileUploadProgress } from '@/components/FileUploadProgress';
import { Colors } from '@/constants/Colors';
import TypingIndicator from '@/components/messages/TypingIndicator';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [chatInfo, setChatInfo] = useState<Chat | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Array<{
    id: string;
    name: string;
    progress: number;
    status: 'uploading' | 'success' | 'error';
    error?: string;
  }>>([]);
  const flatListRef = useRef<FlatList>(null);
  const { user } = useAuth();
  const { typingUser, messages: contextMessages, setChatMessages, webSocketService, markMessageAsRead } = useChat();
  const chatId = parseInt(id as string, 10);
  const [messages, setMessages] = useState<Message[]>(contextMessages[chatId] || []);
  const [typingUserName, setTypingUserName] = useState<string | null>(null);

  useEffect(() => {
    if (chatId && !isNaN(chatId)) {
      loadChatInfo();
      loadMessages();
      
      // Marquer les messages comme lus quand on ouvre le chat
      markReadMessages();
    }
  }, [chatId, user, webSocketService?.isWebSocketConnected()]);

  useEffect(() => {
    let currentTypingUser = typingUser[chatId];
    if (currentTypingUser && currentTypingUser.length > 0) {
      currentTypingUser = currentTypingUser.filter(u => u !== user?.username);
      if (currentTypingUser.length > 0) {
        setTypingUserName(currentTypingUser?.join(', '));
        setIsTyping(true);
      } else {
        setIsTyping(false);
        setTypingUserName(null);
      }
    } else {
      setIsTyping(false);
      setTypingUserName(null);
    }
  }, [typingUser, chatId, user?.username]);

  useEffect(() => {
    setMessages(contextMessages[chatId] || []);
  }, [contextMessages, chatId]);

  useEffect(() => {
    markReadMessages();
  }, [contextMessages]);

  const markReadMessages = () => {
    if (user && chatId) {
      messages.forEach(message => {
        if (!message.read && message.sender.id !== user.id) {
          markMessageAsRead(chatId, message.id);
        }
      });
    }
  };

  const loadChatInfo = async () => {
    try {
      const chats = await StorageService.getChats();
      const currentChat = chats.find(chat => chat.id === chatId);
      setChatInfo(currentChat || null);
    } catch (error) {
      console.error('Error loading chat info:', error);
    }
  };

  const loadMessages = async () => {
    try {
      // Charger les messages reçus depuis le cache local
      const localMessages = await StorageService.getMessages(chatId);
      if (localMessages.length > 0) {
        setChatMessages(chatId, localMessages);
        setMessages(localMessages);
      }

      // Synchroniser avec le serveur pour avoir tous les messages (envoyés + reçus)
      const response = await chatAPI.getChatMessages(chatId);
      const serverMessages = response.content;
      setChatMessages(chatId, serverMessages);
      setMessages(serverMessages);
      await StorageService.saveMessages(chatId, serverMessages);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (text: string) => {
    if (!user || !chatInfo || text.length === 0) return;
    if (webSocketService) {
      const messageData = {
        content: text,
        sender: user.id,
        receiver: chatId,
        messageType: MessageType.TEXT,
      };
      webSocketService.sendMessage(chatId, messageData);
    }
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, 100);
  };

  const handleTyping = (typing: boolean) => {
    if (webSocketService) {
      webSocketService.sendTypingStatus(chatId, typing);
    }
  };

  const handleSendFile = async (file: { uri: string; type: string; name: string }) => {
    if (!user || !chatInfo) return;

    const uploadId = `upload_${Date.now()}`;
    
    // Ajouter à la liste des uploads
    setUploadingFiles(prev => [...prev, {
      id: uploadId,
      name: file.name,
      progress: 0,
      status: 'uploading',
    }]);

    try {
      const response = await FileUploadService.uploadFile(file, chatId, {
        onProgress: (progress) => {
          setUploadingFiles(prev => prev.map(upload => 
            upload.id === uploadId 
              ? { ...upload, progress: progress.percentage }
              : upload
          ));
        },
        onSuccess: (uploadResponse) => {
          // Créer un message avec le fichier pour affichage optimiste
          const messageType = file.type === 'image' ? MessageType.IMAGE : 
                             file.type === 'video' ? MessageType.VIDEO : MessageType.FILE;

          // Envoyer via WebSocket - sera persisté au retour
          if (webSocketService) {
            const messageData = {
              content: '',
              fileUrl: uploadResponse.fileDownloadUri,
              thumbnailUrl: uploadResponse.fileThumbnailUri,
              sender: user.id,
              receiver: chatId,
              type: messageType,
            };
            webSocketService.sendMessage(chatId, messageData);
          }

          setUploadingFiles(prev => prev.map(upload => 
            upload.id === uploadId 
              ? { ...upload, status: 'success', progress: 100 }
              : upload
          ));

          // Supprimer l'upload après 2 secondes
          setTimeout(() => {
            setUploadingFiles(prev => prev.filter(upload => upload.id !== uploadId));
          }, 2000);
        },
        onError: (error) => {
          setUploadingFiles(prev => prev.map(upload => 
            upload.id === uploadId 
              ? { ...upload, status: 'error', error: error.message }
              : upload
          ));
        },
      });
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
    }
  };

  const handleCancelUpload = (uploadId: string) => {
    setUploadingFiles(prev => prev.filter(upload => upload.id !== uploadId));
  };

  const handleRetryUpload = (uploadId: string) => {
    // Réimplémentation simple - dans une vraie app, vous garderiez les données du fichier
    setUploadingFiles(prev => prev.filter(upload => upload.id !== uploadId));
  };

  const getChatTitle = () => {
    if (!chatInfo) return 'Discussion';
    
    if (chatInfo.isGroupChat) {
      return chatInfo.chatName || 'Chat de groupe';
    } else {
      const otherParticipant = chatInfo.participants.find(p => p.user.id !== user?.id);
      return otherParticipant 
        ? `${otherParticipant.user.firstName}`
        : 'Discussion';
    }
  };

  const getOtherParticipant = () => {
    if (!chatInfo || chatInfo.isGroupChat) return null;
    return chatInfo.participants.find(p => p.user.id !== user?.id)?.user;
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMyMessage = item.sender.id === user?.id;
    const nextMessage = index > 0 ? messages[index - 1] : null;
    const showTimestamp = !nextMessage || 
      new Date(item.timestamp).getTime() - new Date(nextMessage.timestamp).getTime() > 300000; // 5 minutes

    return (
      <MessageBubble
        message={item}
        isMyMessage={isMyMessage}
        showTimestamp={showTimestamp}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Erreur: Utilisateur non connecté</Text>
      </View>
    );
  }

  const otherUser = getOtherParticipant();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#128C7E" barStyle="light-content" />
      
      {/* Header WhatsApp-like */}
      <View style={styles.header}>
        <Link href="/(tabs)" asChild>
          <TouchableOpacity style={styles.backButton}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </Link>
        
        <View style={styles.headerContent}>
          <View style={styles.avatar}>
              {chatInfo?.isGroupChat ? (
                <UsersIcon size={24} color={Colors.text.white} />
              ) : (
                <Text style={styles.avatarText}>
                  {otherUser?.firstName?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              )}
          </View>
          
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{getChatTitle()}</Text>
            {isTyping && typingUserName ? (
              <Text style={styles.typingText}>
                {chatInfo?.isGroupChat ? `${typingUserName} écrit...` : 'Écrit...'}
              </Text>
            ) : (
              <View style={styles.statusContainer}>
                <Circle size={8} color="#4FC3F7" fill="#4FC3F7" />
                <Text style={styles.statusText}>en ligne</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Phone size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Video size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MoreVertical size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Background pattern */}
      <View style={styles.chatBackground}>
        {/* Indicateurs d'upload */}
        {uploadingFiles.length > 0 && (
          <View style={styles.uploadContainer}>
            {uploadingFiles.map(upload => (
              <FileUploadProgress
                key={upload.id}
                fileName={upload.name}
                progress={upload.progress}
                status={upload.status}
                error={upload.error}
                onCancel={() => handleCancelUpload(upload.id)}
                onRetry={() => handleRetryUpload(upload.id)}
              />
            ))}
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          inverted
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            isTyping ? (
              <TypingIndicator
                userName={chatInfo?.isGroupChat ? (typingUserName ? typingUserName : undefined) : undefined}
                showUserName={chatInfo?.isGroupChat}
                style={styles.typingIndicatorMessage}
              />
            ) : null
          )}
        />
      </View>

      {/* Input zone */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onSendFile={handleSendFile}
        onTyping={handleTyping}
        placeholder="Message"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.chat,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.chat,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: Colors.primary.dark,
    elevation: 8,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  backButton: {
    padding: 10,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    elevation: 2,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  avatarText: {
    color: Colors.text.white,
    fontSize: 18,
    fontWeight: '700',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.white,
    letterSpacing: 0.3,
  },
  typingText: {
    fontSize: 13,
    color: Colors.status.typing,
    fontStyle: 'italic',
    marginTop: 2,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 6,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 10,
    marginLeft: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  chatBackground: {
    flex: 1,
    backgroundColor: Colors.background.chat,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  uploadContainer: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 12,
  },
  typingIndicatorMessage: {
    marginBottom: 8,
  },
});
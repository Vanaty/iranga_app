import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GiftedChat, IMessage, InputToolbar, Send } from 'react-native-gifted-chat';
import { Message, MessageType, Chat } from '@/types/chat';
import { chatAPI } from '@/services/api';
import { StorageService } from '@/services/storage';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react-native';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chatInfo, setChatInfo] = useState<Chat | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { typingUsers, webSocketService } = useChat();

  const chatId = parseInt(id as string, 10);

  useEffect(() => {
    if (chatId && !isNaN(chatId)) {
      loadMessages();
      loadChatInfo();
    }
  }, [chatId]);

  useEffect(() => {
    // Check if other users are typing
    const currentTypingUsers = typingUsers[chatId] || [];
    const othersTyping = currentTypingUsers.filter(username => username !== user?.username);
    setIsTyping(othersTyping.length > 0);
  }, [typingUsers, chatId, user?.username]);

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
      const localMessages = await StorageService.getMessages(chatId);
      if (localMessages.length > 0) {
        setMessages(convertToGiftedMessages(localMessages));
      }

      const response = await chatAPI.getChatMessages(chatId);
      const serverMessages = response.content;
      setMessages(convertToGiftedMessages(serverMessages));
      await StorageService.saveMessages(chatId, serverMessages);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const convertToGiftedMessages = (apiMessages: Message[]): IMessage[] => {
    return apiMessages.map(msg => ({
      _id: msg.id,
      text: msg.contentText,
      createdAt: new Date(msg.timestamp),
      user: {
        _id: msg.sender.id,
        name: `${msg.sender.firstName} ${msg.sender.lastName}`,
        avatar: msg.sender.profilePictureUrl,
      },
      image: msg.type === MessageType.IMAGE ? msg.fileUrl : undefined,
      video: msg.type === MessageType.VIDEO ? msg.fileUrl : undefined,
      sent: msg.sender.id === user?.id,
      received: msg.read,
    }));
  };

  const onSend = useCallback((newMessages: IMessage[] = []) => {
    if (!user || !chatInfo) return;
    
    const message = newMessages[0];
    
    // Optimistically update UI
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));

    // Send message via WebSocket
    if (webSocketService) {
      const messageData = {
        content: message.text,
        sender: user.id,
        receiver: chatId,
        messageType: MessageType.TEXT,
      };
      
      webSocketService.sendMessage(chatId, messageData);
    }

    // Save locally
    const apiMessage: Message = {
      id: message._id as number,
      contentText: message.text,
      timestamp: message.createdAt.toISOString(),
      type: MessageType.TEXT,
      sender: user,
      chat: chatInfo,
      read: false,
    };
    
    StorageService.addMessage(chatId, apiMessage).catch(console.error);
  }, [chatId, webSocketService, user, chatInfo]);

  const onInputTextChanged = useCallback((text: string) => {
    if (webSocketService) {
      webSocketService.sendTypingStatus(chatId, text.length > 0);
    }
  }, [webSocketService, chatId]);

  const getChatTitle = () => {
    if (!chatInfo) return 'Discussion';
    
    if (chatInfo.isGroupChat) {
      return chatInfo.chatName || 'Chat de groupe';
    } else {
      const otherParticipant = chatInfo.participants.find(p => p.user.id !== user?.id);
      return otherParticipant 
        ? `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`
        : 'Discussion';
    }
  };

  const handleCall = () => {
    Alert.alert('Appel', 'Fonctionnalité d\'appel à venir');
  };

  const handleVideoCall = () => {
    Alert.alert('Appel vidéo', 'Fonctionnalité d\'appel vidéo à venir');
  };

  const handleMore = () => {
    Alert.alert('Options', 'Plus d\'options à venir');
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#3B82F6" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{getChatTitle()}</Text>
          {isTyping && (
            <Text style={styles.typingIndicator}>En train d'écrire...</Text>
          )}
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <Phone size={20} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleVideoCall}>
            <Video size={20} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleMore}>
            <MoreVertical size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <GiftedChat
        messages={messages}
        onSend={onSend}
        onInputTextChanged={onInputTextChanged}
        user={{
          _id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          avatar: user.profilePictureUrl,
        }}
        renderAvatar={(props) => (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {props.currentMessage?.user.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
        showUserAvatar
        showAvatarForEveryMessage={false}
        placeholder="Tapez votre message..."
        alwaysShowSend
        keyboardShouldPersistTaps="never"
        renderInputToolbar={props => (
          <InputToolbar
            {...props}
            containerStyle={styles.inputContainer}
          />
        )}
        renderSend={props => (
          <Send
            {...props}
            containerStyle={styles.sendButtonContainer}
          >
            <Text style={styles.sendButtonText}>Envoyer</Text>
          </Send>
        )}
        messagesContainerStyle={styles.messageContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  typingIndicator: {
    fontSize: 12,
    color: '#10B981',
    fontStyle: 'italic',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 8,
    fontSize: 16,
    maxHeight: 100
  },
  sendButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginRight: 10,
  },
  sendButtonText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 16,
  },
  messageContainer: {
    backgroundColor: '#F9FAFB',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});
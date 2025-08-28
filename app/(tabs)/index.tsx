import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { StorageService } from '@/services/storage';
import { Chat } from '@/types/chat';
import { useRouter } from 'expo-router';
import { MessageCircle, Plus, Users as UsersIcon } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ChatsScreen() {
  const { chats, unreadByChat } = useChat();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastMessages, setLastMessages] = useState<{ [chatId: number]: any }>({});
  const { isConnected, webSocketService } = useChat();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    loadLastMessages();
  }, [chats]);

  useEffect(() => {
    if (!isConnected || !webSocketService) return;

    // tableau de fonctions de désabonnement
    const unsubscribes: (() => void)[] = [];

    chats.forEach(chat => {
      const unsubscribe = webSocketService.subscribeToChat(chat.id);
      unsubscribes.push(unsubscribe);
    });

    // cleanup -> désabonnement quand chats change ou au démontage
    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [isConnected, chats, webSocketService]);


  const loadLastMessages = async () => {
    const lastMessagesData: { [chatId: number]: any } = {};
    for (const chat of chats) {
      const lastMessage = await StorageService.getChatLastMessage(chat.id);
      lastMessagesData[chat.id] = lastMessage;
    }
    setLastMessages(lastMessagesData);
    setIsLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshing(false);
  };

  const navigateToChat = (chatId: number) => {
    router.push(`/chat/${chatId}`);
  };

  const getOtherParticipant = (chat: Chat) => {
    if (chat.isGroupChat) return null;
    return chat.participants.find(p => p.user.id !== user?.id)?.user;
  };

  const getChatDisplayName = (chat: Chat) => {
    if (chat.isGroupChat) {
      return chat.chatName || 'Chat de groupe';
    }
    const otherUser = getOtherParticipant(chat);
    return otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Utilisateur inconnu';
  };

  const renderChatItem = ({ item }: { item: Chat }) => {
    const displayName = getChatDisplayName(item);
    const otherUser = getOtherParticipant(item);
    const unreadCount = unreadByChat[item.id] || 0;
    const lastMessage = lastMessages[item.id];

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigateToChat(item.id)}
      >
        <View style={styles.avatarContainer}>
          {item.isGroupChat ? (
            <View style={styles.groupAvatar}>
              <UsersIcon size={24} color={Colors.primary.main} />
            </View>
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {otherUser?.firstName?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>{displayName}</Text>
          <Text style={[
            styles.chatPreview,
            unreadCount > 0 && styles.unreadPreview
          ]}>
            {lastMessage
              ? lastMessage.content.length > 50
                ? `${lastMessage.content.substring(0, 50)}...`
                : lastMessage.content
              : item.isGroupChat
                ? `${item.participants.length} participants`
                : '@' + otherUser?.username
            }
          </Text>
        </View>
        <View style={styles.chatMeta}>
          <Text style={styles.timestamp}>
            {lastMessage
              ? new Date(lastMessage.timestamp).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
              })
              : new Date(item.createdAt).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
              })
            }
          </Text>
          {unreadCount > 0 && (
            <View style={styles.unreadIndicator} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && chats.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MessageCircle size={64} color="#9CA3AF" />
        <Text style={styles.emptyText}>Chargement de vos discussions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discussions</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => Alert.alert('Nouveau chat', 'Fonctionnalité à venir')}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MessageCircle size={64} color="#9CA3AF" />
          <Text style={styles.emptyText}>Aucune discussion</Text>
          <Text style={styles.emptySubtext}>
            Commencez une nouvelle conversation
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Colors.primary.main,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text.white,
    letterSpacing: 0.5,
  },
  addButton: {
    backgroundColor: Colors.primary.accent,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  listContainer: {
    padding: 20,
    paddingTop: 25,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
    borderRadius: 20,
    elevation: 3,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.light,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatarText: {
    color: Colors.text.white,
    fontSize: 20,
    fontWeight: '700',
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  chatPreview: {
    fontSize: 15,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  chatMeta: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: Colors.text.muted,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: Colors.background.primary,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.secondary,
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 24,
  },
  groupAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background.input,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary.light,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.status.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.background.card,
  },
  unreadText: {
    color: Colors.text.white,
    fontSize: 11,
    fontWeight: '700',
  },
  unreadPreview: {
    fontWeight: '700',
    color: Colors.text.primary,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary.main,
    marginTop: 4,
  },
});
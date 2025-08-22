import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Chat } from '@/types/chat';
import { apiService, chatAPI } from '@/services/api';
import { StorageService } from '@/services/storage';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle, Plus, Users as UsersIcon } from 'lucide-react-native';

export default function ChatsScreen() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      // Charger depuis le stockage local d'abord
      const localChats = await StorageService.getChats();
      if (localChats.length > 0) {
        setChats(localChats);
      }

      // Puis synchroniser avec le serveur
      const response = await chatAPI.getUserChats();
      setChats(response.content);
      await StorageService.saveChats(response.content);
    } catch (error) {
      console.error('Erreur lors du chargement des chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChats();
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
    const unreadCount = 0; // TODO: Implement unread message count

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigateToChat(item.id)}
      >
        <View style={styles.avatarContainer}>
          {item.isGroupChat ? (
            <View style={styles.groupAvatar}>
              <UsersIcon size={24} color="#3B82F6" />
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
          <Text style={styles.chatPreview}>
            {item.isGroupChat ? `${item.participants.length} participants` : '@' + otherUser?.username}
          </Text>
        </View>
        <View style={styles.chatMeta}>
          <Text style={styles.timestamp}>
            {new Date(item.createdAt).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
            })}
          </Text>
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
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  chatPreview: {
    fontSize: 14,
    color: '#6B7280',
  },
  chatMeta: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  groupAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
});
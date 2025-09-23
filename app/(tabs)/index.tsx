import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { StorageService } from '@/services/storage';
import { Chat } from '@/types/chat';
import { useRouter } from 'expo-router';
import { MessageCircle, Plus, Users as UsersIcon, Search } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ModernCard } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';
import { GroupChatCreation } from '@/components/GroupChatCreation';

export default function ChatsScreen() {
  const { chats,addChat, unreadByChat } = useChat();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastMessages, setLastMessages] = useState<{ [chatId: number]: any }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const { isConnected, webSocketService } = useChat();
  const router = useRouter();
  const { user } = useAuth();
  const [showGroupCreation, setShowGroupCreation] = useState(false);

  useEffect(() => {
    if (!isConnected || !webSocketService) return;
    loadLastMessages();
  }, [chats]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = chats.filter(chat => {
        const displayName = getChatDisplayName(chat);
        return displayName.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredChats(filtered);
    } else {
      setFilteredChats(chats);
    }
  }, [searchQuery, chats]);

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
    return otherUser ? `${otherUser.firstName}` : 'Utilisateur inconnu';
  };

  const renderChatItem = ({ item }: { item: Chat }) => {
    const displayName = getChatDisplayName(item);
    const otherUser = getOtherParticipant(item);
    const unreadCount = unreadByChat[item.id] || 0;
    const lastMessage = lastMessages[item.id];

    return (
      <ModernCard
        variant="elevated"
        padding="medium"
        borderRadius="large"
        style={styles.chatItem}
        onPress={() => navigateToChat(item.id)}
      >
        <View style={styles.chatContent}>
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
            <View style={styles.chatHeader}>
              <Text style={styles.chatName} numberOfLines={1}>{displayName}</Text>
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
            </View>
            <Text style={[
              styles.chatPreview,
              unreadCount > 0 && styles.unreadPreview
            ]} numberOfLines={2}>
              {lastMessage
                ? lastMessage.content.length > 50
                  ? `${lastMessage.content.substring(0, 50)}...`
                  : lastMessage.content
                : item.isGroupChat
                  ? `${item.participants.length} participants`
                  : '@' + otherUser?.role?.libelle
              }
            </Text>
          </View>
        </View>
      </ModernCard>
    );
  };

  const handleGroupCreated = (chat: Chat) => {
    addChat(chat);
    // Naviguer vers le nouveau chat de groupe
    router.push(`/chat/${chat.id}`);
    // Recharger la liste des chats
    onRefresh();
  };

  const showCreateOptions = () => {
    Alert.alert(
      'Nouveau chat',
      'Choisissez le type de conversation',
      [
        {
          text: 'Chat privé',
          onPress: () => router.push('/(tabs)/users'),
        },
        {
          text: 'Groupe',
          onPress: () => setShowGroupCreation(true),
        },
        {
          text: 'Annuler',
          style: 'cancel',
        },
      ]
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
      <LinearGradient
        colors={Colors.primary.gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Discussions</Text>
          <ModernButton
            title=""
            onPress={showCreateOptions}
            variant="ghost"
            size="small"
            icon={<Plus size={20} color={Colors.text.white} />}
            style={styles.addButton}
          />
        </View>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={Colors.text.muted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher une conversation..."
              placeholderTextColor={Colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Text style={styles.clearText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {filteredChats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ModernCard variant="glass" padding="large" borderRadius="xl" style={styles.emptyCard}>
            <MessageCircle size={64} color={Colors.text.muted} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'Aucun résultat trouvé' : 'Aucune discussion'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery 
                ? 'Essayez avec d\'autres mots-clés'
                : 'Commencez une nouvelle conversation'
              }
            </Text>
            {!searchQuery && (
              <ModernButton
                title="Nouvelle conversation"
                onPress={showCreateOptions}
                variant="outline"
                style={styles.emptyButton}
                icon={<Plus size={16} color={Colors.primary.main} style={{ marginRight: 8 }} />}
              />
            )}
          </ModernCard>
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <GroupChatCreation
        visible={showGroupCreation}
        onClose={() => setShowGroupCreation(false)}
        onGroupCreated={handleGroupCreated}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '500',
    color: Colors.text.white,
    // letterSpacing: -0.5,
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
  },
  searchContainer: {
    marginTop: -5,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.white,
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
  },
  clearText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
    paddingTop: 20,
  },
  chatItem: {
    marginBottom: 16,
  },
  chatContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
    position: 'relative',
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarText: {
    color: Colors.text.white,
    fontSize: 20,
    fontWeight: '700',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  chatPreview: {
    fontSize: 15,
    color: Colors.text.secondary,
    fontWeight: '500',
    lineHeight: 20,
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
  },
  emptyCard: {
    alignItems: 'center',
    maxWidth: 300,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyButton: {
    marginTop: 8,
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
});
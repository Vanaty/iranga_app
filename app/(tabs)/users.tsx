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
import { userAPI, chatAPI } from '@/services/api';
import { Users, UserPlus, Circle } from 'lucide-react-native';

export default function UsersScreen() {
  const [allUsers, setAllUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const [usersData, onlineData] = await Promise.all([
        userAPI.getAllUsers(),
        userAPI.getOnlineUsers(),
      ]);

      setAllUsers(usersData);
      setOnlineUsers(onlineData);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const startPrivateChat = async (username: string) => {
    try {
      const chat = await chatAPI.createPrivateChat(username);
      router.push(`/chat/${chat.id}`);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer la discussion');
    }
  };

  const renderUserItem = ({ item }: { item: string }) => {
    const isOnline = onlineUsers.includes(item);

    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => startPrivateChat(item)}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={[
            styles.statusIndicator,
            isOnline ? styles.onlineIndicator : styles.offlineIndicator,
          ]} />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username}>@{item}</Text>
          <Text style={styles.status}>
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </Text>
        </View>
        <UserPlus size={20} color="#9CA3AF" />
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <Users size={64} color="#9CA3AF" />
        <Text style={styles.emptyText}>Chargement des utilisateurs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Utilisateurs</Text>
        <View style={styles.onlineCount}>
          <Circle size={8} color="#10B981" />
          <Text style={styles.onlineCountText}>{onlineUsers.length} en ligne</Text>
        </View>
      </View>

      {allUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Users size={64} color="#9CA3AF" />
          <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
        </View>
      ) : (
        <FlatList
          data={allUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item}
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
  onlineCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  onlineCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 4,
  },
  listContainer: {
    padding: 16,
  },
  userItem: {
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
    position: 'relative',
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
  statusIndicator: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    bottom: 2,
    right: 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  onlineIndicator: {
    backgroundColor: '#10B981',
  },
  offlineIndicator: {
    backgroundColor: '#9CA3AF',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  status: {
    fontSize: 14,
    color: '#6B7280',
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
    textAlign: 'center',
  },
});
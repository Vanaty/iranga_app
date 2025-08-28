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
import { Colors } from '@/constants/Colors';

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
  onlineCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  onlineCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text.white,
    marginLeft: 6,
  },
  listContainer: {
    padding: 20,
    paddingTop: 25,
  },
  userItem: {
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
    position: 'relative',
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
  statusIndicator: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    bottom: 2,
    right: 2,
    borderWidth: 3,
    borderColor: Colors.background.card,
    elevation: 2,
  },
  onlineIndicator: {
    backgroundColor: Colors.status.online,
  },
  offlineIndicator: {
    backgroundColor: Colors.status.offline,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  status: {
    fontSize: 15,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.secondary,
    marginTop: 20,
    textAlign: 'center',
  },
});
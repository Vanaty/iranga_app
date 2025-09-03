import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { chatAPI, userAPI } from '@/services/api';
import { Chat, User } from '@/types/chat';
import { Search, Users, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { UserSelectionItem } from './UserSelectionItem';

interface GroupChatCreationProps {
  visible: boolean;
  onClose: () => void;
  onGroupCreated: (chat: Chat) => void;
}

export function GroupChatCreation({ visible, onClose, onGroupCreated }: GroupChatCreationProps) {
  const { user } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (visible) {
      loadUsers();
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setGroupName('');
    setSearchQuery('');
    setSelectedUsers(new Set());
  };

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await userAPI.getAllUsers();
      // Filtrer l'utilisateur actuel
      const filteredUsers = response.filter(u => u.id !== user?.id);
      setAllUsers(filteredUsers);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      Alert.alert('Erreur', 'Impossible de charger la liste des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = allUsers.filter(user =>
    user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUserSelection = (username: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(username)) {
      newSelection.delete(username);
    } else {
      newSelection.add(username);
    }
    setSelectedUsers(newSelection);
  };

  const canCreateGroup = groupName.trim().length >= 3 && selectedUsers.size >= 1;

  const handleCreateGroup = async () => {
    if (!canCreateGroup) {
      Alert.alert('Erreur', 'Veuillez saisir un nom de groupe (min. 3 caractères) et sélectionner au moins un participant');
      return;
    }

    try {
      setIsCreating(true);
      
      const participants = Array.from(selectedUsers);
      // Ajouter l'utilisateur actuel comme admin
      if (user) {
        participants.push(user.username);
      }

      const response = await chatAPI.createGroupChat(
        groupName.trim(),
        participants
      );

      Alert.alert(
        'Succès', 
        'Le groupe a été créé avec succès',
        [
          {
            text: 'OK',
            onPress: () => {
              onGroupCreated(response);
              onClose();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erreur lors de la création du groupe:', error);
      Alert.alert('Erreur', 'Impossible de créer le groupe');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Nouveau groupe</Text>
          <TouchableOpacity
            style={[
              styles.createButton,
              canCreateGroup ? styles.createButtonActive : styles.createButtonDisabled
            ]}
            onPress={handleCreateGroup}
            disabled={!canCreateGroup || isCreating}
          >
            <Text style={[
              styles.createButtonText,
              canCreateGroup ? styles.createButtonTextActive : styles.createButtonTextDisabled
            ]}>
              {isCreating ? 'Création...' : 'Créer'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Group Info Section */}
          <View style={styles.section}>
            <View style={styles.groupInfoHeader}>
              <View style={styles.groupIcon}>
                <Users size={32} color={Colors.primary.main} />
              </View>
              <View style={styles.groupInputContainer}>
                <TextInput
                  style={styles.groupNameInput}
                  placeholder="Nom du groupe"
                  placeholderTextColor={Colors.text.muted}
                  value={groupName}
                  onChangeText={setGroupName}
                  maxLength={50}
                />
                <Text style={styles.characterCount}>
                  {groupName.length}/50
                </Text>
              </View>
            </View>
          </View>

          {/* Selected Users Preview */}
          {selectedUsers.size > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Participants sélectionnés ({selectedUsers.size})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.selectedUsersContainer}>
                  {Array.from(selectedUsers).map(username => {
                    const selectedUser = allUsers.find(u => u.username === username);
                    if (!selectedUser) return null;
                    
                    return (
                      <TouchableOpacity
                        key={username}
                        style={styles.selectedUserChip}
                        onPress={() => toggleUserSelection(username)}
                      >
                        <View style={styles.selectedUserAvatar}>
                          <Text style={styles.selectedUserAvatarText}>
                            {selectedUser.firstName.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <Text style={styles.selectedUserName}>
                          {selectedUser.firstName}
                        </Text>
                        <View style={styles.removeButton}>
                          <X size={12} color={Colors.text.white} />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Users Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ajouter des participants</Text>
            
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Search size={20} color={Colors.text.muted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher des utilisateurs..."
                placeholderTextColor={Colors.text.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Users List */}
            <View style={styles.usersList}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Chargement...</Text>
                </View>
              ) : (
                <FlatList
                  data={filteredUsers}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <UserSelectionItem
                      user={item}
                      selected={selectedUsers.has(item.username)}
                      onToggle={() => toggleUserSelection(item.username)}
                    />
                  )}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.background.input,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  createButtonActive: {
    backgroundColor: Colors.primary.main,
  },
  createButtonDisabled: {
    backgroundColor: Colors.background.input,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  createButtonTextActive: {
    color: Colors.text.white,
  },
  createButtonTextDisabled: {
    color: Colors.text.muted,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  groupInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.background.input,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  groupInputContainer: {
    flex: 1,
  },
  groupNameInput: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.background.input,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: Colors.ui.border,
  },
  characterCount: {
    fontSize: 12,
    color: Colors.text.muted,
    textAlign: 'right',
    marginTop: 4,
  },
  selectedUsersContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  selectedUserChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.light,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  selectedUserAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  selectedUserAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text.white,
  },
  selectedUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginRight: 8,
  },
  removeButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.status.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.input,
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 12,
  },
  usersList: {
    minHeight: 300,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.muted,
  },
});

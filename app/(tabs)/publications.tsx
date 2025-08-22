import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Publication, CreatePublicationRequest } from '@/types/chat';
import { PublicationCard } from '@/components/PublicationCard';
import { useChat } from '@/contexts/ChatContext';
import { apiService, publicationAPI } from '@/services/api';
import { Plus, X, Send } from 'lucide-react-native';

export default function PublicationsScreen() {
  const { publications, refreshPublications, addPublication, updatePublication } = useChat();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPublication, setNewPublication] = useState<CreatePublicationRequest>({
    title: '',
    content: '',
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadPublications();
  }, []);

  const loadPublications = async () => {
    try {
      await refreshPublications();
    } catch (error) {
      console.error('Error loading publications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshPublications();
    setRefreshing(false);
  };

  const handleCreatePublication = async () => {
    if (!newPublication.title.trim() || !newPublication.content.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setIsCreating(true);
    try {
      const publication = await publicationAPI.createPublication(newPublication);
      addPublication(publication);
      setNewPublication({ title: '', content: '' });
      setShowCreateModal(false);
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la création de la publication');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdatePublication = (updatedPublication: Publication) => {
    updatePublication(updatedPublication);
  };

  const handleDeletePublication = (publicationId: number) => {
    // Remove from local state - API call already handled in PublicationCard
    const updatedPublications = publications.filter(pub => pub.id !== publicationId);
    // Since we don't have a direct way to update the context state, we'll refresh
    refreshPublications();
  };

  const handleComment = (publication: Publication) => {
    // Navigate to comments screen or show comments modal
    Alert.alert('Commentaires', 'Fonctionnalité à venir');
  };

  const renderPublication = ({ item }: { item: Publication }) => (
    <PublicationCard
      publication={item}
      onUpdate={handleUpdatePublication}
      onDelete={handleDeletePublication}
      onComment={handleComment}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Chargement des publications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Publications</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {publications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucune publication</Text>
          <Text style={styles.emptySubtext}>
            Soyez le premier à publier quelque chose
          </Text>
        </View>
      ) : (
        <FlatList
          data={publications}
          renderItem={renderPublication}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCreateModal(false)}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nouvelle publication</Text>
            <TouchableOpacity
              style={[styles.modalSendButton, (!newPublication.title.trim() || !newPublication.content.trim() || isCreating) && styles.modalSendButtonDisabled]}
              onPress={handleCreatePublication}
              disabled={!newPublication.title.trim() || !newPublication.content.trim() || isCreating}
            >
              <Send size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Titre</Text>
              <TextInput
                style={styles.titleInput}
                value={newPublication.title}
                onChangeText={(text) => setNewPublication(prev => ({ ...prev, title: text }))}
                placeholder="Titre de votre publication"
                maxLength={100}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contenu</Text>
              <TextInput
                style={styles.contentInput}
                value={newPublication.content}
                onChangeText={(text) => setNewPublication(prev => ({ ...prev, content: text }))}
                placeholder="Que voulez-vous partager ?"
                multiline
                maxLength={1000}
                textAlignVertical="top"
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingVertical: 8,
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalSendButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    height: 200,
  },
});

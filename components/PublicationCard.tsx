import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Publication } from '@/types/chat';
import { publicationAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, MessageCircle, MoreVertical, Trash2, Edit } from 'lucide-react-native';

interface PublicationCardProps {
  publication: Publication;
  onUpdate: (publication: Publication) => void;
  onDelete: (publicationId: number) => void;
  onComment: (publication: Publication) => void;
}

export function PublicationCard({ publication, onUpdate, onDelete, onComment }: PublicationCardProps) {
  const { user } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      if (publication.isLiked) {
        await publicationAPI.unlikePublication(publication.id);
      } else {
        await publicationAPI.likePublication(publication.id);
      }

      onUpdate({
        ...publication,
        isLiked: !publication.isLiked,
        likesCount: publication.isLiked 
          ? publication.likesCount - 1 
          : publication.likesCount + 1,
      });
    } catch (error) {
      console.error('Error liking publication:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer la publication',
      'Êtes-vous sûr de vouloir supprimer cette publication ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await publicationAPI.deletePublication(publication.id);
              onDelete(publication.id);
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer la publication');
            }
          },
        },
      ]
    );
  };

  const isOwner = user?.id === publication.author.id;
  const formattedDate = new Date(publication.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {publication.author.firstName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.authorDetails}>
            <Text style={styles.authorName}>
              {publication.author.firstName} {publication.author.lastName}
            </Text>
            <Text style={styles.timestamp}>{formattedDate}</Text>
          </View>
        </View>
        {isOwner && (
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => setShowActions(!showActions)}
          >
            <MoreVertical size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {showActions && isOwner && (
        <View style={styles.actionsMenu}>
          <TouchableOpacity style={styles.actionItem}>
            <Edit size={16} color="#3B82F6" />
            <Text style={[styles.actionText, { color: '#3B82F6' }]}>Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={handleDelete}>
            <Trash2 size={16} color="#EF4444" />
            <Text style={[styles.actionText, { color: '#EF4444' }]}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{publication.title}</Text>
        <Text style={styles.description}>{publication.content}</Text>
        {publication.imageUrl && (
          <Image source={{ uri: publication.imageUrl }} style={styles.image} />
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLike}
          disabled={isLiking}
        >
          <Heart
            size={20}
            color={publication.isLiked ? '#EF4444' : '#6B7280'}
            fill={publication.isLiked ? '#EF4444' : 'transparent'}
          />
          <Text style={[
            styles.actionCount,
            publication.isLiked && styles.likedText
          ]}>
            {publication.likesCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onComment(publication)}
        >
          <MessageCircle size={20} color="#6B7280" />
          <Text style={styles.actionCount}>{publication.commentsCount}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  actionsMenu: {
    backgroundColor: '#F9FAFB',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    paddingVertical: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionCount: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  likedText: {
    color: '#EF4444',
  },
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Chat, Message, Publication } from '@/types/chat';

export class StorageService {
  private static readonly KEYS = {
    USER: 'user',
    CHATS: 'chats',
    MESSAGES: 'messages_',
    PUBLICATIONS: 'publications',
    AUTH_TOKEN: 'authToken',
  };

  // User management
  static async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.USER, JSON.stringify(user));
      console.log('Utilisateur sauvegardé:', user.username);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'utilisateur:', error);
    }
  }

  static async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(this.KEYS.USER);
      if (userData) {
        const user = JSON.parse(userData);
        console.log('Utilisateur récupéré du stockage:', user.username);
        return user;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }

  // Token management
  static async saveAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.AUTH_TOKEN, token);
      console.log('Token d\'authentification sauvegardé');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du token:', error);
    }
  }

  static async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(this.KEYS.AUTH_TOKEN);
      console.log('Token récupéré:', !!token);
      return token;
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  }

  static async removeAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.KEYS.AUTH_TOKEN);
      console.log('Token d\'authentification supprimé');
    } catch (error) {
      console.error('Erreur lors de la suppression du token:', error);
    }
  }

  // Chats management
  static async saveChats(chats: Chat[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.CHATS, JSON.stringify(chats));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des chats:', error);
    }
  }

  static async getChats(): Promise<Chat[]> {
    try {
      const chatsData = await AsyncStorage.getItem(this.KEYS.CHATS);
      return chatsData ? JSON.parse(chatsData) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des chats:', error);
      return [];
    }
  }

  // Messages management - optimisé pour WebSocket uniquement
  static async saveMessages(chatId: number, messages: Message[]): Promise<void> {
    try {
      const receivedMessages = messages.filter(msg => {
        return true;
      });
      
      await AsyncStorage.setItem(`${this.KEYS.MESSAGES}${chatId}`, JSON.stringify(receivedMessages));
      console.log(`${receivedMessages.length} messages reçus sauvegardés pour le chat ${chatId}`);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des messages:', error);
    }
  }

  static async getMessages(chatId: number): Promise<Message[]> {
    try {
      const messagesData = await AsyncStorage.getItem(`${this.KEYS.MESSAGES}${chatId}`);
      const messages = messagesData ? JSON.parse(messagesData) : [];
      console.log(`${messages.length} messages reçus récupérés pour le chat ${chatId}`);
      return messages;
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      return [];
    }
  }

  static async addMessage(chatId: number, message: Message): Promise<void> {
    try {
      const existingMessages = await this.getMessages(chatId);
      
      // Vérifier que le message n'existe pas déjà
      const messageExists = existingMessages.some(msg => msg.id === message.id);
      if (messageExists) {
        return;
      }
      
      const updatedMessages = [message, ...existingMessages];
      await this.saveMessages(chatId, updatedMessages);
      console.log(`Message WebSocket ajouté au cache local pour le chat ${chatId}`);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du message:', error);
    }
  }

  // Gestion des messages non lus
  static async getUnreadMessagesCount(chatId: number, currentUserId: number): Promise<number> {
    try {
      const messages = await this.getMessages(chatId);
      const unreadCount = messages.filter(msg => 
        !msg.read && msg.sender.id !== currentUserId
      ).length;
      console.log(`${unreadCount} messages non lus pour le chat ${chatId}`);
      return unreadCount;
    } catch (error) {
      console.error('Erreur lors du calcul des messages non lus:', error);
      return 0;
    }
  }

  static async getTotalUnreadMessagesCount(currentUserId: number): Promise<number> {
    try {
      const chats = await this.getChats();
      let totalUnread = 0;
      
      for (const chat of chats) {
        const unreadCount = await this.getUnreadMessagesCount(chat.id, currentUserId);
        totalUnread += unreadCount;
      }
      
      console.log(`Total messages non lus: ${totalUnread}`);
      return totalUnread;
    } catch (error) {
      console.error('Erreur lors du calcul total des messages non lus:', error);
      return 0;
    }
  }

  static async markChatMessagesAsRead(chatId: number, currentUserId: number): Promise<void> {
    try {
      const messages = await this.getMessages(chatId);
      const updatedMessages = messages.map(msg => ({
        ...msg,
        read: msg.sender.id === currentUserId ? msg.read : true
      }));
      
      await this.saveMessages(chatId, updatedMessages);
      console.log(`Messages du chat ${chatId} marqués comme lus`);
    } catch (error) {
      console.error('Erreur lors du marquage des messages comme lus:', error);
    }
  }

  // Chat metadata pour les derniers messages
  static async updateChatLastMessage(chatId: number, message: Message): Promise<void> {
    try {
      const key = `last_message_${chatId}`;
      await AsyncStorage.setItem(key, JSON.stringify({
        id: message.id,
        content: message.contentText || 'Fichier',
        timestamp: message.timestamp,
        senderName: `${message.sender.firstName} ${message.sender.lastName}`,
        isRead: message.read
      }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du dernier message:', error);
    }
  }

  static async getChatLastMessage(chatId: number): Promise<any> {
    try {
      const key = `last_message_${chatId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération du dernier message:', error);
      return null;
    }
  }

  // Publications management
  static async savePublications(publications: Publication[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.PUBLICATIONS, JSON.stringify(publications));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des publications:', error);
    }
  }

  static async getPublications(): Promise<Publication[]> {
    try {
      const publicationsData = await AsyncStorage.getItem(this.KEYS.PUBLICATIONS);
      return publicationsData ? JSON.parse(publicationsData) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des publications:', error);
      return [];
    }
  }

  static async addPublication(publication: Publication): Promise<void> {
    try {
      const existingPublications = await this.getPublications();
      const updatedPublications = [publication, ...existingPublications];
      await this.savePublications(updatedPublications);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la publication:', error);
    }
  }

  // File management
  static async saveUploadedFile(chatId: number, file: {
    uri: string;
    type: string;
    name: string;
    uploadUrl?: string;
  }): Promise<void> {
    try {
      const key = `uploaded_file_${chatId}_${Date.now()}`;
      await AsyncStorage.setItem(key, JSON.stringify(file));
      console.log('Fichier uploadé sauvegardé:', file.name);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du fichier:', error);
    }
  }

  static async getUploadedFiles(chatId: number): Promise<any[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const fileKeys = keys.filter(key => key.startsWith(`uploaded_file_${chatId}_`));
      const files = await AsyncStorage.multiGet(fileKeys);
      return files.map(([_, value]) => JSON.parse(value || '{}'));
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers:', error);
      return [];
    }
  }

  // Cache management for files
  static async cacheFile(uri: string, fileName: string): Promise<string> {
    try {
      // Ici vous pourriez implémenter une logique de cache plus sophistiquée
      const cacheKey = `cached_file_${fileName}`;
      await AsyncStorage.setItem(cacheKey, uri);
      return uri;
    } catch (error) {
      console.error('Erreur lors de la mise en cache du fichier:', error);
      return uri;
    }
  }

  // Clear all data
  static async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter(key => 
        key.startsWith(this.KEYS.USER) ||
        key.startsWith(this.KEYS.CHATS) ||
        key.startsWith(this.KEYS.MESSAGES) ||
        key.startsWith(this.KEYS.PUBLICATIONS) ||
        key.startsWith(this.KEYS.AUTH_TOKEN)
      );
      await AsyncStorage.multiRemove(appKeys);
      console.log('Toutes les données ont été effacées');
    } catch (error) {
      console.error('Erreur lors de l\'effacement des données:', error);
    }
  }

  // Debug: List all stored keys
  static async debugListKeys(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      console.log('Clés stockées:', keys);
    } catch (error) {
      console.error('Erreur lors de la récupération des clés:', error);
    }
  }
}
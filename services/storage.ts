import AsyncStorage from '@react-native-async-storage/async-storage';
import { Chat, Message, User, Publication } from '@/types/chat';

export class StorageService {
  private static readonly KEYS = {
    USER: 'user',
    CHATS: 'chats',
    MESSAGES: 'messages_',
    LAST_SYNC: 'last_sync',
  };

  static async saveUser(user: User): Promise<void> {
    await AsyncStorage.setItem(this.KEYS.USER, JSON.stringify(user));
  }

  static async getUser(): Promise<User | null> {
    const userData = await AsyncStorage.getItem(this.KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  }

  static async saveChats(chats: Chat[]): Promise<void> {
    await AsyncStorage.setItem(this.KEYS.CHATS, JSON.stringify(chats));
  }

  static async getChats(): Promise<Chat[]> {
    const chatsData = await AsyncStorage.getItem(this.KEYS.CHATS);
    return chatsData ? JSON.parse(chatsData) : [];
  }

  static async saveMessages(chatId: number, messages: Message[]): Promise<void> {
    await AsyncStorage.setItem(
      `${this.KEYS.MESSAGES}${chatId}`,
      JSON.stringify(messages)
    );
  }

  static async getMessages(chatId: number): Promise<Message[]> {
    const messagesData = await AsyncStorage.getItem(`${this.KEYS.MESSAGES}${chatId}`);
    return messagesData ? JSON.parse(messagesData) : [];
  }

  static async addMessage(chatId: number, message: Message): Promise<void> {
    const existingMessages = await this.getMessages(chatId);
    const updatedMessages = [...existingMessages, message];
    await this.saveMessages(chatId, updatedMessages);
  }

  static async updateLastSync(timestamp: number): Promise<void> {
    await AsyncStorage.setItem(this.KEYS.LAST_SYNC, timestamp.toString());
  }

  static async getLastSync(): Promise<number> {
    const timestamp = await AsyncStorage.getItem(this.KEYS.LAST_SYNC);
    return timestamp ? parseInt(timestamp, 10) : 0;
  }

  static async clearAll(): Promise<void> {
    await AsyncStorage.clear();
  }

  static async savePublications(publications: Publication[]): Promise<void> {
    await AsyncStorage.setItem('publications', JSON.stringify(publications));
  }

  static async getPublications(): Promise<Publication[]> {
    const publicationsData = await AsyncStorage.getItem('publications');
    return publicationsData ? JSON.parse(publicationsData) : [];
  }

  static async addPublication(publication: Publication): Promise<void> {
    const existingPublications = await this.getPublications();
    const updatedPublications = [publication, ...existingPublications];
    await this.savePublications(updatedPublications);
  }
}
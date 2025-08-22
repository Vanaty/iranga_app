import { useState, useEffect } from 'react';
import { Message } from '@/types/chat';
import { chatAPI } from '@/services/api';
import { StorageService } from '@/services/storage';
import { NotificationService } from '@/services/notifications';

export function useMessages(chatId: number) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(syncMessages, 5000); // Sync toutes les 5 secondes
    return () => clearInterval(interval);
  }, [chatId]);

  const loadMessages = async () => {
    try {
      // Charger depuis le cache local
      const localMessages = await StorageService.getMessages(chatId);
      if (localMessages.length > 0) {
        setMessages(localMessages.reverse());
      }

      // Synchroniser avec le serveur
      await syncMessages();
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncMessages = async () => {
    try {
      const response = await chatAPI.getChatMessages(chatId);
      const serverMessages = response.content.reverse();
      
      // Vérifier s'il y a de nouveaux messages
      const localMessages = await StorageService.getMessages(chatId);
      const newMessages = serverMessages.filter(
        serverMsg => !localMessages.some(localMsg => localMsg.id === serverMsg.id)
      );

      // Afficher notification pour les nouveaux messages
      if (newMessages.length > 0) {
        const lastMessage = newMessages[newMessages.length - 1];
        await NotificationService.scheduleLocalNotification(
          `${lastMessage.sender.firstName} ${lastMessage.sender.lastName}`,
          lastMessage.contentText,
          { chatId, messageId: lastMessage.id }
        );
      }

      setMessages(serverMessages);
      await StorageService.saveMessages(chatId, serverMessages);
    } catch (error) {
      console.error('Erreur lors de la synchronisation des messages:', error);
    }
  };

  const addMessage = async (message: Message) => {
    setMessages(prev => [message, ...prev]);
    await StorageService.addMessage(chatId, message);
  };

  return {
    messages,
    isLoading,
    addMessage,
    syncMessages,
  };
}
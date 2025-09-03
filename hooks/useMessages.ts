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
      
      // Ne stocker que les messages reçus (pas ceux envoyés par l'utilisateur actuel)
      const currentUser = await StorageService.getUser();
      const messagesToStore = serverMessages.filter(msg => 
        msg.sender.id !== currentUser?.id
      );

      // Vérifier s'il y a de nouveaux messages reçus
      const localMessages = await StorageService.getMessages(chatId);
      const newMessages = messagesToStore.filter(
        serverMsg => !localMessages.some(localMsg => localMsg.id === serverMsg.id)
      );

      // Afficher notification pour les nouveaux messages reçus uniquement
      if (newMessages.length > 0) {
        const lastMessage = newMessages[newMessages.length - 1];
        await NotificationService.scheduleLocalNotification(
          `${lastMessage.sender.firstName} ${lastMessage.sender.lastName}`,
          lastMessage.contentText,
          { chatId, messageId: lastMessage.id }
        );
      }

      setMessages(serverMessages); // Afficher tous les messages
      await StorageService.saveMessages(chatId, messagesToStore); // Stocker uniquement les messages reçus
    } catch (error) {
      console.error('Erreur lors de la synchronisation des messages:', error);
    }
  };

  const addMessage = async (message: Message) => {
    console.log('Ajout de message via hook:', message);
    setMessages(prev => [message, ...prev]);
    
    // Mettre à jour le dernier message
    await StorageService.updateChatLastMessage(chatId, message);
    
    // Ne stocker que si le message ne vient pas de l'utilisateur actuel
    const currentUser = await StorageService.getUser();
    if (message.sender.id !== currentUser?.id) {
      await StorageService.addMessage(chatId, message);
      console.log('Message stocké dans le hook');
    }
  };

  return {
    messages,
    isLoading,
    addMessage,
    syncMessages,
  };
}
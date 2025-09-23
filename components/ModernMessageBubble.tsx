import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Message, MessageType } from '@/types/chat';
import { Colors } from '@/constants/Colors';
import { AnimatedView } from './AnimatedView';
import { Check, CheckCheck, Clock } from 'lucide-react-native';

interface ModernMessageBubbleProps {
  message: Message;
  isMyMessage: boolean;
  showTimestamp?: boolean;
  onPress?: () => void;
}

export function ModernMessageBubble({
  message,
  isMyMessage,
  showTimestamp = true,
  onPress,
}: ModernMessageBubbleProps) {
  const getMessageStatus = () => {
    if (message.read) {
      return <CheckCheck size={16} color={Colors.text.muted} />;
    } else {
      return <Clock size={16} color={Colors.text.muted} />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMessageContent = () => {
    switch (message.type) {
      case MessageType.IMAGE:
        return (
          <View style={styles.imageContainer}>
            <Text style={styles.imageText}>📷 Image</Text>
          </View>
        );
      case MessageType.FILE:
        return (
          <View style={styles.fileContainer}>
            <Text style={styles.fileText}>📄 Fichier</Text>
          </View>
        );
      case MessageType.VIDEO:
        return (
          <View style={styles.videoContainer}>
            <Text style={styles.videoText}>🎥 Vidéo</Text>
          </View>
        );
      default:
        return (
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText
          ]}>
            {message.contentText}
          </Text>
        );
    }
  };

  return (
    <AnimatedView animation="slideUp" delay={0} style={styles.container}>
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
      ]}>
        {isMyMessage ? (
          <LinearGradient
            colors={Colors.message.gradient as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.messageBubble}
          >
            <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
              {getMessageContent()}
              {showTimestamp && (
                <View style={styles.messageFooter}>
                  <Text style={styles.timestamp}>
                    {formatTime(message.timestamp)}
                  </Text>
                  {getMessageStatus()}
                </View>
              )}
            </TouchableOpacity>
          </LinearGradient>
        ) : (
          <View style={[styles.messageBubble, styles.otherMessageBubble]}>
            <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
              {getMessageContent()}
              {showTimestamp && (
                <View style={styles.messageFooter}>
                  <Text style={styles.timestamp}>
                    {formatTime(message.timestamp)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    marginHorizontal: 8,
    maxWidth: '80%',
  },
  messageContainer: {
    marginBottom: 4,
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 2,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  otherMessageBubble: {
    backgroundColor: Colors.message.received,
    borderWidth: 1,
    borderColor: Colors.message.border,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  myMessageText: {
    color: Colors.text.primary,
  },
  otherMessageText: {
    color: Colors.text.primary,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
    gap: 4,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.text.muted,
    fontWeight: '500',
  },
  imageContainer: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
  },
  imageText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  fileContainer: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
  },
  fileText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  videoContainer: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
  },
  videoText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
  },
});

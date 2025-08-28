import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '@/types/chat';
import { MessageStatus } from '../MessageStatus';
import { Colors } from '@/constants/Colors';

interface TextMessageProps {
  message: Message;
  isMyMessage: boolean;
  showTimestamp?: boolean;
}

export function TextMessage({ message, isMyMessage, showTimestamp = true }: TextMessageProps) {
  const messageTime = new Date(message.timestamp).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  }) + ' ' + new Date(message.timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[
      styles.container,
      isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
    ]}>
      <View style={[
        styles.bubble,
        isMyMessage ? styles.myMessage : styles.otherMessage
      ]}>
        {!isMyMessage && (
          <Text style={styles.senderName}>
            {message.sender.firstName} {message.sender.lastName}
          </Text>
        )}
        
        <Text style={[
          styles.messageText,
          isMyMessage ? styles.myMessageText : styles.otherMessageText
        ]}>
          {message.contentText}
        </Text>
        
        <View style={styles.messageFooter}>
          {showTimestamp && (
            <Text style={[
              styles.timestamp,
              isMyMessage ? styles.myTimestamp : styles.otherTimestamp
            ]}>
              {messageTime}
            </Text>
          )}
          {isMyMessage && (
            <MessageStatus 
              sent={true}
              delivered={message.read}
              read={message.read}
            />
          )}
        </View>
      </View>
      
      {/* Queue de la bulle */}
      <View style={[
        styles.tail,
        isMyMessage ? styles.myTail : styles.otherTail
      ]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 3,
    marginHorizontal: 12,
    maxWidth: '85%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    position: 'relative',
    elevation: 2,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  myMessage: {
    backgroundColor: Colors.message.sent,
    marginRight: 10,
    borderBottomRightRadius: 6,
  },
  otherMessage: {
    backgroundColor: Colors.message.received,
    marginLeft: 10,
    borderBottomLeftRadius: 6,
  },
  senderName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary.main,
    marginBottom: 4,
    letterSpacing: 0.3,
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
  },
  timestamp: {
    fontSize: 11,
    marginRight: 6,
    fontWeight: '600',
  },
  myTimestamp: {
    color: Colors.text.tertiary,
  },
  otherTimestamp: {
    color: Colors.text.muted,
  },
  tail: {
    position: 'absolute',
    bottom: 0,
    width: 0,
    height: 0,
  },
  myTail: {
    right: 0,
    borderLeftWidth: 10,
    borderLeftColor: Colors.message.sent,
    borderBottomWidth: 10,
    borderBottomColor: 'transparent',
  },
  otherTail: {
    left: 0,
    borderRightWidth: 10,
    borderRightColor: Colors.message.received,
    borderBottomWidth: 10,
    borderBottomColor: 'transparent',
  },
});

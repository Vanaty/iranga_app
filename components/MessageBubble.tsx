import React from 'react';
import { Message, MessageType } from '@/types/chat';
import { TextMessage } from './messages/TextMessage';
import { ImageMessage } from './messages/ImageMessage';
import { FileMessage } from './messages/FileMessage';
import { StyleSheet } from 'react-native';

interface MessageBubbleProps {
  message: Message;
  isMyMessage: boolean;
  showTimestamp?: boolean;
}

export function MessageBubble({ message, isMyMessage, showTimestamp = true }: MessageBubbleProps) {
  switch (message.type) {
    case MessageType.IMAGE:
      return (
        <ImageMessage
          message={message}
          isMyMessage={isMyMessage}
          showTimestamp={showTimestamp}
        />
      );
    
    case MessageType.FILE:
      return (
        <FileMessage
          message={message}
          isMyMessage={isMyMessage}
          showTimestamp={showTimestamp}
        />
      );
    
    case MessageType.VIDEO:
      // Le composant FileMessage peut gérer les vidéos aussi
      return (
        <FileMessage
          message={message}
          isMyMessage={isMyMessage}
          showTimestamp={showTimestamp}
        />
      );
    
    case MessageType.TEXT:
    default:
      return (
        <TextMessage
          message={message}
          isMyMessage={isMyMessage}
          showTimestamp={showTimestamp}
        />
      );
  }
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    marginHorizontal: 8,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    position: 'relative',
  },
  myMessage: {
    backgroundColor: '#DCF8C6',
    marginRight: 8,
  },
  otherMessage: {
    backgroundColor: '#FFFFFF',
    marginLeft: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#25D366',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#000000',
  },
  otherMessageText: {
    color: '#000000',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    marginRight: 4,
  },
  myTimestamp: {
    color: '#666666',
  },
  otherTimestamp: {
    color: '#999999',
  },
  tail: {
    position: 'absolute',
    bottom: 0,
    width: 0,
    height: 0,
  },
  myTail: {
    right: 0,
    borderLeftWidth: 8,
    borderLeftColor: '#DCF8C6',
    borderBottomWidth: 8,
    borderBottomColor: 'transparent',
  },
  otherTail: {
    left: 0,
    borderRightWidth: 8,
    borderRightColor: '#FFFFFF',
    borderBottomWidth: 8,
    borderBottomColor: 'transparent',
  },
});

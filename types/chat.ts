export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  profilePictureUrl?: string;
  role?: Role;
}

export interface Role {
  id: number;
  libelle: string;
  type: string;
}

export interface Chat {
  id: number;
  chatName: string;
  isGroupChat: boolean;
  createdAt: string;
  participants: Participant[];
}

export interface Participant {
  id: number;
  user: User;
  joinedAt: string;
  isNotifActive: boolean;
  isAdmin: boolean;
}

export interface Message {
  id: number;
  contentText: string;
  timestamp: string;
  type: MessageType;
  media?: Media;
  sender: User;
  chat: Chat;
  read: boolean;
}

export interface InstantMessage {
  id: number;
  content: string;
  sender: number;
  receiver: number;
  messageType: MessageType;
}

export interface Media {
  id: number;
  fileName: string;
  thumbnailUrl: string;
  fileUrl: string;
  mediaType: string;
  fileSize: number;
  createdAt: string;
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  FILE = 'FILE',
  AUDIO = 'AUDIO'
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  profilePictureUrl?: string;
  roleId?: number;
}

export interface AuthResponse {
  token: string;
  username: string;
  userId: number;
  user: User;
}

export interface FileResponse {
  fileDownloadUri: string;
  fileThumbnailUri: string;
}

export interface ChatState {
  chats: Chat[];
  activeChat: Chat | null;
  messages: { [chatId: number]: Message[] };
  onlineUsers: string[];
  currentUser: User | null;
  isAuthenticated: boolean;
  typingUsers: { [chatId: number]: string[] };
  publications: Publication[];
  unreadMessages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Publication {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  author: User;
  likes: Like[];
  comments: Comment[];
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
}

export interface Like {
  id: number;
  user: User;
  createdAt: string;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: User;
  publication: Publication;
}

export interface CreatePublicationRequest {
  title: string;
  content: string;
  imageUrl?: string;
}

export interface CreateCommentRequest {
  content: string;
  publicationId: number;
}

export interface GiftedChatMessage {
  _id: string | number;
  text: string;
  createdAt: Date;
  user: GiftedChatUser;
  image?: string;
  video?: string;
  audio?: string;
  system?: boolean;
  sent?: boolean;
  received?: boolean;
  pending?: boolean;
}

export interface GiftedChatUser {
  _id: string | number;
  name?: string;
  avatar?: string;
}
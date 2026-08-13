export interface User {
  id: number;
  login: string;
  avatar: string | null;
  status: 'online' | 'offline' | 'away';
  created_at: string;
}

export interface Chat {
  id: number;
  type: 'dialog' | 'group';
  title: string;
  created_at: string;
  updated_at: string;
  participants: User[];
  last_message: string
  last_message_time: string;
}

export interface Message {
  id: number;
  chat_id: number;
  sender_id: number;
  text: string;
  sender?: User;
  status: string
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface MessageStatus {
  message_id: number;
  user_id: number;
  status: 'sent' | 'delivered' | 'read';
}

export interface SendMessagePayload {
  chatId: number;
  text: string;
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  hasMore: boolean
}
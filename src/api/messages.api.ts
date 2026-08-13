import { apiClient } from './client';
import type { Message, PaginatedResponse } from '../types';

export const messageApi = {
  async getMessages(chatId: number, page = 0, limit = 50): Promise<PaginatedResponse<Message>> {
    return apiClient.get<PaginatedResponse<Message>>(`/chats/${chatId}/messages?limit=${limit}&page=${page}`);
  },

  async sendMessage(chatId: number, text: string): Promise<Message> {
    return apiClient.post<Message>(`/chats/${chatId}/messages`, { text });
  },
};

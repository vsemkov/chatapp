import { apiClient } from './client';
import type { Chat, PaginatedResponse } from '../types';

export const chatApi = {
  async getChats(page: number, limit: number): Promise<PaginatedResponse<Chat>> {
    return apiClient.get<PaginatedResponse<Chat>>(`/chats?page=${page}&limit=${limit}`)
  },

  async getChatInfo(chatId: number): Promise<Chat> {
    return apiClient.get<Chat>(`/chats/${chatId}`);
  },

  async createDialog(title: string): Promise<Chat> {
    return apiClient.post<Chat>('/chats/dialog', { title });
  },

  async inviteUserToChat(chatId: number, nickName: string): Promise<void> {
    return apiClient.post(`/chats/${chatId}/invite`, { nickName });
  }
};

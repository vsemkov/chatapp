import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { chatApi } from '../api/chat.api'
import { Chat } from '../types'

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  hasMore: boolean
}

export const useChatsStore = defineStore('chats', () => {
  const chats = ref<Chat[]>([])
  const currentChatId = ref<number | null>(null)
  const page = ref(1)
  const limit = 25
  const hasMoreChats = ref(true)
  const isLoading = ref(false)

  const currentChat = computed(() => {
    return chats.value.find(c => c.id === currentChatId.value) || null
  })

  async function getChatInfo(chatId: number): Promise<Chat> {
    return chatApi.getChatInfo(chatId)
  }

  async function createDialog(chatname: string): Promise<Chat> {
    const chat = await chatApi.createDialog(chatname)
    addChat(chat)

    return chat
  }

  async function inviteUserToChat(chatId: number, nickName: string): Promise<void> {
    try {
      await chatApi.inviteUserToChat(chatId, nickName)
    } catch (error) {
      throw error
    }
  }

  async function fetchChats() {
    if (isLoading.value || !hasMoreChats.value) return

    isLoading.value = true

    try {

      const response = await chatApi.getChats(page.value, limit)

      chats.value = [...chats.value, ...response.items]
      hasMoreChats.value = response.hasMore
      page.value++
    } catch (error) {
      console.error('Ошибка загрузки чатов:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  function resetChats() {
    chats.value = []
    page.value = 1
    hasMoreChats.value = true
    isLoading.value = false
  }

  function setCurrentChat(chatId: number) {
    if (currentChatId.value === chatId) return
    currentChatId.value = chatId
  }

  function addChat(chat: Chat) {
    const exists = chats.value.some(c => c.id === chat.id)

    if (!exists) {
      chats.value = [...chats.value, chat]
    }
  }

  function updateChat(chatId: number, data: Partial<Chat>) {
    const index = chats.value.findIndex(c => c.id === chatId)
    if (index !== -1 && chats.value[index]) {
      chats.value[index] = { ...chats.value[index], ...data }
    }
  }

  function removeChat(chatId: number) {
    const index = chats.value.findIndex(c => c.id === chatId)
    if (index !== -1) {
      chats.value.splice(index, 1)
    }
    if (currentChatId.value === chatId) {
      currentChatId.value = null
    }
  }

  return {
    chats,
    currentChatId,
    page,
    hasMoreChats,
    isLoading,

    currentChat,

    getChatInfo,
    createDialog,
    inviteUserToChat,

    fetchChats,
    resetChats,
    setCurrentChat,
    addChat,
    updateChat,
    removeChat
  }
})
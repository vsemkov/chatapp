import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { User, type Message } from '../types';
import { messageApi } from '../api/messages.api';

export const useMessagesStore = defineStore('messages', () => {
    const messages = ref<Record<number, Message[]>>({});
    const currentChatId = ref<number | null>(null);
    const page = ref<Record<number, number>>({});
    const limit = 50;
    const hasMoreMessages = ref<Record<number, boolean>>({});
    const isLoadingMessages = ref(false);

    const currentMessages = computed(() => {
        if (!currentChatId.value) return [];
        return messages.value[currentChatId.value] || [];
    });

    const currentHasMore = computed(() => {
        if (!currentChatId.value) return false;
        return hasMoreMessages.value[currentChatId.value] ?? true;
    });

    const currentPage = computed(() => {
        if (!currentChatId.value) return 1;
        return page.value[currentChatId.value] || 1;
    });

    async function fetchMessages(chatId: number, reset: boolean = false) {
        currentChatId.value = chatId;

        if (isLoadingMessages.value) return
        if (!reset && hasMoreMessages.value[chatId] === false) return

        if (!messages.value[chatId]) {
            messages.value[chatId] = []
        }
        if (!page.value[chatId]) {
            page.value[chatId] = 1
        }
        if (reset) {
            page.value[chatId] = 1
            messages.value[chatId] = []
            hasMoreMessages.value[chatId] = true
        }

        isLoadingMessages.value = true

        try {
            const response = await messageApi.getMessages(chatId, page.value[chatId], limit);

            if (reset || page.value[chatId] === 1) {
                messages.value[chatId] = [...response.items]
            } else {
                messages.value[chatId] = [...response.items, ...messages.value[chatId]]
            }

            hasMoreMessages.value[chatId] = response.items?.length === limit
            page.value[chatId]++

            return response
        } catch (error) {
            throw error
        } finally {
            isLoadingMessages.value = false
        }
    }

    async function sendMessage(chatId: number, sender: User, text: string): Promise<Message> {

        if (!sender.id) throw new Error('Ошибка отправки сообщения, нет отправителя')

        const tempId = Date.now()

        const tempMessage: Message = {
            id: tempId,
            chat_id: chatId,
            sender_id: sender.id,
            text,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: 'sending',
            sender
        }

        if (!messages.value[chatId]) {
            messages.value[chatId] = []
        }
        messages.value[chatId] = [...messages.value[chatId], tempMessage]

        try {
            const message = await messageApi.sendMessage(chatId, text)
            const index = messages.value[chatId].findIndex(m => m.id === tempId)

            if (index !== -1) {
                messages.value[chatId][index] = { ...message, status: 'sent' }
                messages.value[chatId] = [...messages.value[chatId]]
            }

            return message
        } catch (error) {
            const index = messages.value[chatId].findIndex(m => m.id === tempId)
            if (index !== -1 && messages.value[chatId][index]) {
                messages.value[chatId][index].status = 'failed'
                messages.value[chatId] = [...messages.value[chatId]]
            }
            throw error
        }
    }

    function addMessage(chatId: number, message: Message) {
        if (currentChatId.value !== chatId) return

        if (!messages.value[chatId]) {
            messages.value[chatId] = []
        }

        const exists = messages.value[chatId].some(m => m.id === message.id)
        if (exists) return

        messages.value[chatId] = [...messages.value[chatId], message]
    }

    function updateMessageStatus(chatId: number, messageId: number, status: 'sent' | 'read' | 'failed') {
        if (!messages.value[chatId]) return

        const index = messages.value[chatId].findIndex(m => m.id === messageId)
        if (index !== -1 && messages.value[chatId][index]) {
            messages.value[chatId][index].status = status
            messages.value[chatId] = [...messages.value[chatId]]
        }
    }

    function resetMessages(chatId?: number) {
        if (chatId) {
            messages.value[chatId] = []
            page.value[chatId] = 1
            hasMoreMessages.value[chatId] = true
        } else {
            messages.value = {}
            page.value = {}
            hasMoreMessages.value = {}
        }
    }

    function setCurrentChat(chatId: number) {
        currentChatId.value = chatId;
    }

    return {
        messages,
        currentChatId,
        isLoadingMessages,

        currentMessages,
        currentHasMore,
        currentPage,

        setCurrentChat,
        fetchMessages,
        sendMessage,
        addMessage,
        updateMessageStatus,
        resetMessages,
    };
});
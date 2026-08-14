<template>
  <div class="flex h-screen">
    <ChatSidebar @select-chat="handleSelectChat"/>
    <div class="flex-1 flex flex-col bg-white">
      <div v-if="currentChat" class="flex-1 flex flex-col h-screen">
        <div class="flex justify-between border-b border-gray-300 h-16 items-center px-4 bg-gray-50">
          <div class="flex items-center">
            <div>
              <h2 class="font-semibold">
                {{ currentChat.title }}
              </h2>
            </div>
            <div class="relative flex ml-8">
              <div v-for="participant in currentChat.participants" class="absolutre -ml-4"><Avatar :showStatus="true" :user="participant" /></div>
            </div>
          </div>
          <div>
            <button
              v-if="currentChat?.id"
              @click="openInviteModal"
              class="text-sm text-gray-500 hover:text-gray-700"
            >
              + Пригласить
            </button>
          </div>
        </div>
        <MessageList :messages="currentMessages" :chat-id="currentChat?.id" />
        <MessageInput @send="handleSendMessage" />
      </div>
      <div v-else class="flex-1 flex items-center justify-center text-gray-400">
        <div class="text-center">
          <p class="text-lg">Выберете или создайте новый чат</p>
        </div>
      </div>
    </div>
    <InviteUserModal v-if="currentChat?.id"
      ref="inviteModalRef"
      @close="onModalClose"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import ChatSidebar from '../components/chat/ChatSidebar.vue'
import MessageList from '../components/chat/MessageList.vue'
import MessageInput from '../components/chat/MessageInput.vue'
import { useChatsStore } from '../stores/chats.store'
import { useAuthStore } from '../stores/auth.store'
import { socketService } from '../services/socket.service'
import { useMessagesStore } from '../stores/messages.store.ts'
import InviteUserModal from '../components/chat/InviteUserModal.vue'
import { Message } from '../types/index.ts'
import Avatar from '../components/common/Avatar.vue'

const chatsStore = useChatsStore()
const messagesStore = useMessagesStore()

const authStore = useAuthStore()

const isConnected = ref(false)

const inviteModalRef = ref<InstanceType<typeof InviteUserModal> | null>(null)

const currentChat = computed(() => chatsStore.currentChat)
const currentMessages = computed(() => messagesStore.currentMessages)

function openInviteModal() {
  inviteModalRef.value?.open()
}

function onModalClose() {
  console.log('Окно закрыто')
}

function handleSelectChat(chatId: number) {
  chatsStore.setCurrentChat(chatId)
}

async function handleSendMessage(text: string) {
  try {
      if (chatsStore.currentChatId && authStore.user) {
        const message = await messagesStore.sendMessage(chatsStore.currentChatId, authStore.user, text)
        updateChatLastMessage(chatsStore.currentChatId, message)
      }
  } catch (err) {
    console.error('Ошибка отправки сообщения:', err)
  }
}

function handleInvite(data: any) {
  console.log('Приглашение:', data)
}

function handleMessage(data: any) {
  const { chat_id, ...message } = data

  messagesStore.addMessage(chat_id, message)  
  updateChatLastMessage(chat_id, message)
}

function updateChatLastMessage(chat_id:number, message: Message) {
  const chat = chatsStore.chats.find(c => c.id === chat_id)
  
  if (chat) {
    chat.last_message = message.text
    chat.last_message_time = new Date().toISOString()

    const index = chatsStore.chats.indexOf(chat)
    chatsStore.chats.splice(index, 1)
    chatsStore.chats.unshift(chat)
  }
}

function handleTyping(data: any) {
  console.log('Печатает:', data)
}

function handleStatus(data: any) {
  const { userId, status, chatId } = data
  const chat = chatsStore.chats.find(c => c.id === chatId)

  if (chat) {
    const participant = chat.participants.find((p: any) => p.id === userId)

    if (participant) {
      participant.status = status
    }
  }
}

function handleRead(data: any) {
  console.log('Прочитано:', data)
}

function connectSocket() {
  if (!authStore.token || !chatsStore.currentChatId) return
  
  socketService.connect(chatsStore.currentChatId, authStore.token)
  
  socketService.on('connected', (data) => {
    isConnected.value = true
    console.log('Socket.IO подключен:', data)
  })
  socketService.on('message', handleMessage)
  socketService.on('invite', handleInvite)
  socketService.on('typing', handleTyping)
  socketService.on('status', handleStatus)
  socketService.on('read', handleRead)
  socketService.on('disconnect', () => {
    isConnected.value = false
  })
}

function disconnectSocket() {
  socketService.off('connected')
  socketService.off('message', handleMessage)
  socketService.off('invite', handleInvite)
  socketService.off('typing', handleTyping)
  socketService.off('status', handleStatus)
  socketService.off('read', handleRead)
  socketService.off('disconnect')
  socketService.disconnect()
}

onMounted(() => {
  // chatsStore.fetchChats()
  
  if (chatsStore.currentChatId && authStore.token) {
    messagesStore.fetchMessages(chatsStore.currentChatId, true)

    connectSocket()
  }
})

onUnmounted(() => {
  disconnectSocket()
})

watch(() => chatsStore.currentChatId, (newChatId) => {
  if (newChatId && authStore.token) {
    disconnectSocket()
    
    messagesStore.fetchMessages(newChatId, true)
    
    connectSocket()
  }
})

watch(() => authStore.token, (newToken) => {
  if (newToken && chatsStore.currentChatId) {
    connectSocket()
  } else {
    disconnectSocket()
  }
})
</script>

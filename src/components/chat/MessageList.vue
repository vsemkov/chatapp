<template>
  <div ref="containerRef" class="relative flex-1 overflow-y-auto">
    <div class="flex min-h-full flex-col">
      <div ref="triggerRef" class="h-1"></div>

      <div v-if="isLoadingMessages && messages.length > 0" class="py-2 text-center text-sm text-gray-400">
        <Spinner>
          Загружаем предыдущие сообщения
        </Spinner>
      </div>

      <div v-if="messages.length > 0" class="flex flex-col gap-1 p-4">
        <MessageItem
          v-for="message in messages"
          :key="message.id"
          :message="message"
          :is-own="message.sender_id === authStore.user?.id"
        />
      </div>

      <div v-else-if="!isLoadingMessages && messages.length === 0" class="flex flex-1 items-center justify-center">
        <div class="text-center text-gray-400">
          <p class="text-lg">Здесь пока нет сообщений!</p>
          <p class="text-sm">Отправь привет!</p>
        </div>
      </div>

      <div v-if="isLoadingMessages && messages.length === 0" class="flex flex-1 items-center justify-center">
        <Spinner>
          Загружаем сообщения чата
        </Spinner>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, nextTick, onMounted, computed } from 'vue'
import MessageItem from './MessageItem.vue'
import { useAuthStore } from '../../stores/auth.store'
import { useMessagesStore } from '../../stores/messages.store'
import { useInfiniteScroll } from '../../composables/useInfiniteScroll'
import Spinner from '../common/Spinner.vue'

const props = defineProps<{
  chatId: number
}>()

const authStore = useAuthStore()
const messagesStore = useMessagesStore()

const messages = computed(() => messagesStore.currentMessages)
const isLoadingMessages = computed(() => messagesStore.isLoadingMessages)
const hasMoreMessages = computed(() => messagesStore.currentHasMore)

const { 
  triggerRef, 
  containerRef, 
  scrollToBottom,
  refresh 
} = useInfiniteScroll(
  async () => {
    await messagesStore.fetchMessages(props.chatId, false)
  },
  {
    hasMore: () => hasMoreMessages.value,
    isLoading: () => isLoadingMessages.value,
    rootMargin: '200px',
    threshold: 0.1,
    autoLoad: true,
    direction: 'up'
  }
)

defineExpose({
  triggerRef,
  containerRef,
  scrollToBottom,
  refresh
})

watch(
  () => props.chatId,
  async (newChatId, oldChatId) => {
    if (newChatId === oldChatId) return

    messagesStore.resetMessages(newChatId)
    await messagesStore.fetchMessages(newChatId, true)
    scrollToBottom(false)
    
    nextTick(() => {
      refresh()
    })
  },
  { immediate: true }
)

watch(
  () => messages.value.length,
  (newLength, oldLength) => {
    if (newLength > oldLength) {
      scrollToBottom(false)
    }
  }
)

onMounted(async () => {
  if (props.chatId) {
    await messagesStore.fetchMessages(props.chatId, true)
    scrollToBottom(false)
  }
})
</script>
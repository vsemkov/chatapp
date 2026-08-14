<template>
  <div :class="['flex h-full w-16', isMenuOpen ? 'w-100' : 'w-16', 'flex-col bg-primary']">
    <div class="flex h-16 items-center justify-between px-4">
      <div v-if="isMenuOpen">
        <h1 class="text-xl font-bold text-white">Ваши чаты</h1>
        <button
          @click="openСreateModal"
          class="text-sm text-gray-200 hover:text-gray-100"
        >
        + Новый чат
        </button>
      </div>
      <HamburgerButton v-model="isMenuOpen" />
    </div>
    <div ref="containerRef" class="flex-1 overflow-y-auto scrollbar-hide">
      <div v-if="isLoading && chats.length === 0" class="p-4 text-center">
        <Spinner>
          <div v-if="isMenuOpen" class="text-white/70">Загружаем список чатов...</div>
          <div v-else />
        </Spinner>
      </div>
      <div v-else-if="chats.length === 0" class="flex h-full items-center justify-center">
        <button
          @click="openСreateModal"
          class="text-sm text-gray-100 hover:text-white"
        >
          {{ isMenuOpen ? '+ Начать новый чат' : '+ Новый чат'}}
        </button>
      </div>

      <div>
        <ChatItem
          v-for="chat in chats"
          :key="chat.id"
          :chat="chat"
          :is-active="chat.id === currentChatId"
          :is-compact="isMenuOpen"
          @click="handleSelectChat(chat.id)"
        />

        <div ref="triggerRef" class="h-1"></div>

        <div v-if="isLoading && chats.length > 0" class="py-4 text-center">
          <Spinner>
            <div v-if="isMenuOpen" class="text-white/70">Загружаем еще...</div>
            <div v-else />
          </Spinner>
        </div>
      </div>
    </div>

    <div class="flex h-16 items-center border-t border-blue-600 px-4">
      <div class="flex w-full items-center justify-between">
        <div class="flex items-center gap-2">
          <Avatar :user="authStore.user" size="sm" />
          <span v-if="isMenuOpen" class="text-sm text-white/70">
            {{ authStore.user?.login }}
          </span>
        </div>
        <button
          v-if="isMenuOpen"
          @click="handleLogout"
          class="text-sm text-white/70 hover:text-white"
        >
          Logout
        </button>
      </div>
    </div>
    <CreateChatModal 
      ref="createChatModalRef"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ChatItem from './ChatItem.vue'
import Avatar from '../common/Avatar.vue'
import HamburgerButton from '../common/HamburgerButton.vue'
import { useChatsStore } from '../../stores/chats.store'
import { useAuthStore } from '../../stores/auth.store'
import { useInfiniteScroll } from '../../composables/useInfiniteScroll'
import Spinner from '../common/Spinner.vue'
import { Chat } from '../../types'
import CreateChatModal from './CreateChatModal.vue'

const emit = defineEmits<{
  selectChat: [chatId: number]
}>()

const isMenuOpen = ref(true)

const router = useRouter()
const chatsStore = useChatsStore()
const authStore = useAuthStore()

const createChatModalRef = ref<InstanceType<typeof CreateChatModal> | null>(null)

const chats = computed<Chat[]>(() => chatsStore.chats)
const currentChatId = computed(() => chatsStore.currentChatId)
const isLoading = computed(() => chatsStore.isLoading)
const hasMoreChats = computed(() => chatsStore.hasMoreChats)

function handleSelectChat(chatId: number) {
  emit('selectChat', chatId)
}

async function handleLogout() {
  await authStore.logout()

  router.push('/login')
}

const {
  triggerRef,
  containerRef,
} = useInfiniteScroll(
  async () => {
    await chatsStore.fetchChats()
  },
  {
    hasMore: () => hasMoreChats.value,
    isLoading: () => isLoading.value,
    rootMargin: '100px',
    threshold: 0.1,
    autoLoad: true,
    direction: 'down'
  }
)

function openСreateModal() {
  if(!createChatModalRef.value) return;

  createChatModalRef.value.open()
}

defineExpose({
  triggerRef,
  containerRef
})

onMounted(() => {
  if (chats.value.length === 0 && !isLoading.value) {
    chatsStore.fetchChats()
  }
})
</script>
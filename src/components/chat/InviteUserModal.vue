<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    @click.self="close"
  >
    <div
      class="w-full max-w-md rounded-2xl bg-white shadow-2xl transition-all duration-300"
      :class="{
        'scale-95 opacity-0': !isVisible,
        'scale-100 opacity-100': isVisible
      }"
    >
      <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h2 class="text-xl font-semibold text-gray-800">
          Пригласить пользователя
        </h2>
        <button
          @click="close"
          class="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="px-6 py-4">
        <div class="relative">
          <input
            v-model="login"
            type="text"
            placeholder="Введите логин пользователя..."
            class="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            @keydown.enter="handleInvite"
            autofocus
          />
        </div>

        <p class="mt-2 text-xs text-gray-400">
          Введите логин пользователя для приглашения
        </p>

        <div v-if="error" class="mt-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {{ error }}
        </div>
      </div>

      <div class="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
        <button
          @click="close"
          class="rounded-lg px-4 py-2 text-gray-600 transition-colors hover:bg-gray-100"
        >
          Отмена
        </button>
        <button
          @click="handleInvite"
          :disabled="!login.trim() || isInviting"
          class="rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ isInviting ? 'Приглашение...' : 'Пригласить' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useChatsStore } from '../../stores/chats.store';

const chatsStore = useChatsStore()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const isOpen = ref(false)
const isVisible = ref(false)
const login = ref('')
const isInviting = ref(false)
const error = ref<string | null>(null)

function open() {
  isOpen.value = true
  login.value = ''
  error.value = null

  nextTick(() => {
    isVisible.value = true
  })
}

function close() {
    isVisible.value = false
    isOpen.value = false
    login.value = ''
    error.value = null
    isInviting.value = false
    emit('close')
}

async function handleInvite() {
  const trimmedLogin = login.value.trim()
  
  if (!trimmedLogin) {
    error.value = 'Введите логин пользователя'
    return
  }

  isInviting.value = true
  error.value = null

  try {
    if (chatsStore.currentChatId) {
        await chatsStore.inviteUserToChat(chatsStore.currentChatId, trimmedLogin)
    }
    close()
  } catch (err: any) {
    error.value = err.message || 'Ошибка приглашения пользователя'
  } finally {
    isInviting.value = false
  }
}

defineExpose({
  open,
  close
})
</script>
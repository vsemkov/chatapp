<template>
  <div class="flex flex-col gap-1 border-t border-gray-200 bg-white p-3 sm:p-4">
    <form @submit.prevent="handleSend" class="flex w-full gap-2 items-end">
      <textarea
        ref="textareaRef"
        v-model="text"
        :placeholder="placeholder"
        :disabled="disabled || isSending"
        :maxlength="maxLength"
        rows="1"
        class="flex-1 min-h-[40px] max-h-[160px] resize-none rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-800 placeholder:text-gray-400 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-70 disabled:bg-gray-100"
        :class="{
          'opacity-60': isSending,
          'border-red-500 focus:border-red-500 focus:ring-red-500/20': error
        }"
        @input="handleInput"
        @keydown="handleKeydown"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />

      <button
        type="submit"
        class="flex h-10 min-h-[40px] shrink-0 items-center justify-center gap-1 rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:opacity-60 disabled:hover:scale-100 sm:px-6"
        :disabled="!canSend || isSending || disabled"
        :title="buttonTitle"
      >
        <svg
          v-if="isSending"
          class="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-linecap="round" />
        </svg>
        <span v-else>Отправить</span>
      </button>
    </form>

    <div class="flex flex-wrap items-center justify-between gap-1 px-1 text-xs text-gray-400">
      <span v-if="showCounter && text.length > 0" class="transition-colors" :class="{ 'text-red-500': isOverLimit }">
        {{ text.length }} / {{ maxLength }}
      </span>

      <span v-if="error" class="text-red-500">{{ error }}</span>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'

interface Props {
  modelValue?: string
  placeholder?: string
  maxLength?: number
  disabled?: boolean
  isSending?: boolean
  error?: string | null
  showCounter?: boolean
  autoResize?: boolean
  maxRows?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Введите текст сообщение',
  maxLength: 1000,
  disabled: false,
  isSending: false,
  error: null,
  showCounter: true,
  autoResize: true,
  maxRows: 6
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'send', text: string): void
  (e: 'typing', isTyping: boolean): void
  (e: 'focus'): void
  (e: 'blur'): void
}>()

const text = ref(props.modelValue)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const isFocused = ref(false)
let typingTimeout: ReturnType<typeof setTimeout> | null = null

const canSend = computed(() => {
  return text.value.trim().length > 0 && !props.isSending && !props.disabled && !isOverLimit.value
})

const isOverLimit = computed(() => text.value.length > props.maxLength)

const buttonTitle = computed(() => {
  if (props.isSending) return 'Sending...'
  if (!text.value.trim()) return 'Type a message'
  if (isOverLimit.value) return 'Message is too long'
  return 'Send message'
})

function autoResize() {
  if (!props.autoResize || !textareaRef.value) return

  const textarea = textareaRef.value
  textarea.style.height = 'auto'

  const lineHeight = 24
  const padding = 16 
  const maxHeight = props.maxRows * lineHeight + padding
  const scrollHeight = textarea.scrollHeight

  textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px'
  textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden'
}

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  text.value = target.value

  if (text.value.length > props.maxLength) {
    text.value = text.value.slice(0, props.maxLength)
    target.value = text.value
  }

  if (props.autoResize) {
    nextTick(() => autoResize())
  }

  emitTyping(true)
  emit('update:modelValue', text.value)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()

    return
  }

  if (event.key === 'Escape') {
    text.value = ''
    emit('update:modelValue', '')
    textareaRef.value?.blur()
  }
}

function handleSend() {
  const message = text.value.trim()
  if (!message || !canSend.value) return

  emit('send', message)

  text.value = ''
  emit('update:modelValue', '')
  emitTyping(false)

  nextTick(() => {
    if (props.autoResize && textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }
    textareaRef.value?.focus()
  })
}

function emitTyping(isTyping: boolean) {
  if (typingTimeout) {
    clearTimeout(typingTimeout)
    typingTimeout = null
  }

  if (isTyping) {
    emit('typing', true)
    typingTimeout = setTimeout(() => {
      emit('typing', false)
    }, 1500)
  } else {
    emit('typing', false)
  }
}

function focus() {
  textareaRef.value?.focus()
}

function clear() {
  text.value = ''
  emit('update:modelValue', '')
  emitTyping(false)
  nextTick(() => autoResize())
}

watch(() => props.modelValue, (newValue) => {
  if (newValue !== text.value) {
    text.value = newValue
    nextTick(() => autoResize())
  }
})

watch(text, () => {
  if (props.autoResize) {
    nextTick(() => autoResize())
  }
})

onMounted(() => {
  if (props.autoResize && textareaRef.value) {
    nextTick(() => autoResize())
  }
})

defineExpose({
  focus,
  clear,
  setValue: (value: string) => {
    text.value = value
    emit('update:modelValue', value)
    nextTick(() => autoResize())
  }
})
</script>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 0.8s linear infinite;
}
</style>
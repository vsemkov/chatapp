<template>
  <div :class="['flex', isOwn ? 'justify-end' : 'justify-start', 'pb-2']">
    <div :class="[
      'max-w-[70%] rounded-lg px-4 py-2 relative',
      isOwn ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900',
      message.status === 'failed' && 'bg-red-400 text-white']">
      <div class="whitespace-pre-line">{{ message.text }}</div>
      <div :class="[
        'text-xs mt-1',
        isOwn ? 'text-primary-100 text-right opacity-80' : 'text-gray-400'

      ]">
        {{ formattedTime }} {{!isOwn ? `- ${message.sender?.login}` : '' }} {{ message.status === 'failed' ? 'Ошибка' : message.status === 'sending' ? 'Отправка' : '' }}
      </div>
      <div 
      :class="['absolute h-4 w-4 transform rotate-45 top-4', isOwn ? ' -right-2  bg-primary' : ' -left-2  bg-gray-100',
        message.status === 'failed' && 'bg-red-400'
      ]"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Message } from '../../types';

const props = defineProps<{
  message: Message;
  isOwn: boolean;
}>();

const formattedTime = computed(() => {
  const date = new Date(props.message.created_at);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
});
</script>

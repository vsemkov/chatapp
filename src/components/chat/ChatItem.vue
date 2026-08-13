<template>
  <div
    @click="emit('click')"
    :class="[
      'flex items-center gap-3 p-3 cursor-pointer transition hover:bg-blue-600',
      isActive ? 'bg-blue-600 border-l-4 border-blue-200' : ''
    ]"
  >
    <Avatar size="sm">
      <span class="font-medium text-gray-600">{{ shortTitle }}</span>
    </Avatar>
    <div v-if="!isHidden" class="w-full min-w-0">
      <div class="flex items-center justify-between">
        <span class="font-medium text-white truncate">{{ displayName }}</span>
        <span class="text-xs text-white">{{ fime }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm text-white truncate">
          {{ lastMessage || 'Нет новых сообщений' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Avatar from '../common/Avatar.vue';
import type { Chat } from '../../types';
import { useAuthStore } from '../../stores/auth.store';
import { formattedDate } from '../../untls/dates.ts';

const props = defineProps<{
  chat: Chat;
  isActive: boolean;
  isCompact: boolean
}>();

const emit = defineEmits<{
  click: [];
}>();

const authStore = useAuthStore();

const isHidden = computed(() => !props.isCompact)

const otherUser = computed(() => {
  const participants = props.chat.participants;
  if (participants.length === 2) {
    return participants.find(p => p.id !== authStore.user?.id) || participants[0];
  }
  return participants[0];
});

const displayName = computed(() => {
    return props.chat.title || otherUser.value?.login || 'Без названия';
});

const shortTitle = computed(() => {
  return props.chat.title.charAt(0).toUpperCase();
});

const fime = computed(() => formattedDate(props.chat.updated_at))

const lastMessage = computed(() => {
  return props.chat.last_message || null;
});

</script>

<template>
  <div
    :class="[
      'rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0',
      sizeClasses
    ]"
  >
    <slot>
      <img
        v-if="user?.avatar"
        :src="user.avatar"
        :alt="user.login"
        class="w-full h-full rounded-full object-cover"
      />
      <span v-else class="font-medium text-gray-600">
        {{ initials }}
      </span>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { User } from '../../types';

const props = defineProps<{
  user?: User | null;
  size?: 'sm' | 'md' | 'lg';
}>();

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-8 h-8 text-xs';
    case 'lg': return 'w-12 h-12 text-lg';
    default: return 'w-10 h-10 text-base';
  }
});

const initials = computed(() => {
  if (!props.user) return '?';
  return props.user.login.charAt(0).toUpperCase();
});
</script>

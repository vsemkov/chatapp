<template>
  <span class="inline-flex items-center gap-2 text-gray-400">
    <svg class="h-5 w-5 animate-spin" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.2" />
      <path d="M4 12a8 8 0 018-8v4l3-3-3-3v4" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" />
    </svg>
    <slot>Загрузка...</slot>
  </span>
</template>

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
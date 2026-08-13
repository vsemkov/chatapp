<template>
  <button
    @click="toggle"
    class="relative h-4 w-6"
  >
    <div class="relative flex h-full w-full items-center justify-center">
      <span
        class="absolute h-0.5 w-6 bg-white/70 transition-all duration-300"
        :class="{
          'top-1/2 -translate-y-1/2 -rotate-45': isOpen,
          'top-0 translate-y-0 rotate-0': !isOpen
        }"
      ></span>
  
      <span
        class="absolute h-0.5 w-6 bg-white/70  transition-opacity duration-300"
        :class="{
          'opacity-0': isOpen,
          'opacity-100': !isOpen
        }"
      ></span>
      <span
        class="absolute h-0.5 w-6 bg-white/70 transition-all duration-300"
        :class="{
          'top-1/2 -translate-y-1/2 rotate-45': isOpen,
          'bottom-0 translate-y-0 rotate-0': !isOpen
        }"
      ></span>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'toggle', value: boolean): void
}>()

const isOpen = computed({
  get: () => props.modelValue || false,
  set: (value: boolean) => {
    emit('update:modelValue', value)
    emit('toggle', value)
  }
})

function toggle() {
  isOpen.value = !isOpen.value
}
</script>
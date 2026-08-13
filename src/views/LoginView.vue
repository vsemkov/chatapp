<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold text-center mb-6">Чат</h1>
      
      <div class="mb-4">
        <div class="flex gap-2 mb-4">
          <button
            @click="mode = 'login'"
            :class="[
              'flex-1 py-2 px-4 rounded-lg font-medium transition',
              mode === 'login'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            ]"
          >
            Логин
          </button>
          <button
            @click="mode = 'register'"
            :class="[
              'flex-1 py-2 px-4 rounded-lg font-medium transition',
              mode === 'register'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            ]"
          >
            Регистрация
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Логин</label>
            <input
              v-model="login"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Укажите ваш логин"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <input
              v-model="password"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Укажите ваш пароль"
            />
          </div>

          <div v-if="mode === 'register'">
            <label class="block text-sm font-medium text-gray-700 mb-1">URL вашей аватарки (по желанию)</label>
            <input
              v-model="avatar"
              type="url"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-hover transition disabled:opacity-50"
          >
            {{ isLoading ? 'Загрузка...' : (mode === 'login' ? 'Вход' : 'Регистрация') }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();

const mode = ref<'login' | 'register'>('login');
const login = ref('');
const password = ref('');
const avatar = ref('');
const isLoading = ref(false);
const error = ref('');

async function handleSubmit() {
  error.value = '';
  isLoading.value = true;

  try {
    if (mode.value === 'login') {
      await authStore.login(login.value, password.value);
    } else {
      await authStore.register(login.value, password.value, avatar.value || undefined);
    }
    router.push('/');
  } catch (err: any) {
    error.value = err.message || 'Ошибка входа, неверный логин или пароль';
  } finally {
    isLoading.value = false;
  }
}
</script>

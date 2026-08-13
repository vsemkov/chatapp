import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../LoginView.vue';
import { useAuthStore } from '../../stores/auth.store';

vi.mock('../../api/auth.api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock('../../stores/auth.store', async () => {
  const actual = await vi.importActual('../../stores/auth.store');
  return {
    ...actual,
    cookieStore: {
      set: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
    },
  };
});

describe('LoginView', () => {
  let router: any;
  let authStore: any;

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'messenger', component: { template: '<div>Messenger</div>' } },
        { path: '/login', name: 'login', component: LoginView },
      ],
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createWrapper = () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
    });

    authStore = useAuthStore(pinia);

    return mount(LoginView, {
      global: {
        plugins: [pinia, router],
        stubs: {},
      },
      attachTo: document.body,
    });
  };

  it('Должен отображать форму входа по умолчанию', () => {
    const wrapper = createWrapper();

    expect(wrapper.find('h1').text()).toBe('Чат');
    expect(wrapper.find('button').text()).toContain('Логин');
    expect(wrapper.findAll('button')).toHaveLength(3);

    const inputs = wrapper.findAll('input');
    expect(inputs).toHaveLength(2);
    expect(inputs[0].attributes('placeholder')).toBe('Укажите ваш логин');
    expect(inputs[1].attributes('placeholder')).toBe('Укажите ваш пароль');

    const submitButton = wrapper.find('button[type="submit"]');
    expect(submitButton.text()).toBe('Вход');

    wrapper.unmount();
  });

  it('Должен переключаться в режим регистрации при нажатии на кнопку регистрации', async () => {
    const wrapper = createWrapper();

    const registerButton = wrapper.findAll('button')[1];
    await registerButton.trigger('click');

    expect((wrapper.vm as any).mode).toBe('register');

    const inputs = wrapper.findAll('input');
    expect(inputs).toHaveLength(3);
    expect(inputs[2].attributes('placeholder')).toBe('https://example.com/avatar.jpg');

    const submitButton = wrapper.find('button[type="submit"]');
    expect(submitButton.text()).toBe('Регистрация');

    wrapper.unmount();
  });

  it('Должен отображать сообщение об ошибке при неудачном входе', async () => {
    const wrapper = createWrapper();

    await wrapper.findAll('input')[0].setValue('testuser');
    await wrapper.findAll('input')[1].setValue('wrongpassword');

    const errorMessage = 'Invalid credentials';
    authStore.login = vi.fn().mockRejectedValue(new Error(errorMessage));

    // Отправка формы
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect((wrapper.vm as any).error).toBe(errorMessage);
    expect((wrapper.vm as any).isLoading).toBe(false);

    const errorDiv = wrapper.find('.text-red-500');
    expect(errorDiv.exists()).toBe(true);
    expect(errorDiv.text()).toBe(errorMessage);

    wrapper.unmount();
  });

  it('Должен отображать сообщение об ошибке по умолчанию, если у ошибки нет сообщения', async () => {
    const wrapper = createWrapper();

    await wrapper.findAll('input')[0].setValue('testuser');
    await wrapper.findAll('input')[1].setValue('wrongpassword');

    authStore.login = vi.fn().mockRejectedValue({});

    // Отправка формы
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect((wrapper.vm as any).error).toBe('Ошибка входа, неверный логин или пароль');

    wrapper.unmount();
  });
});
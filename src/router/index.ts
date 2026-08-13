import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import MessengerView from '../views/MessengerView.vue';
import { useAuthStore } from '../stores/auth.store';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'messenger',
    component: MessengerView,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, _, next) => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    await authStore.restoreSession();
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;

/**
 * ============================================================
 * app.js — Vue 3 Application Entry Point
 * ============================================================
 * Inisialisasi Vue app, registrasi komponen global,
 * setup router, dan mount ke #app.
 * ============================================================
 */
import { createApp }   from 'vue';
import router          from './router/index.js';
import appStore        from './stores/appStore.js';

// ─── Global Components ───────────────────────────────────────
import AppToast    from './components/ui/AppToast.js';
import AppModal    from './components/ui/AppModal.js';
import AppBadge    from './components/ui/AppBadge.js';
import AppPagination from './components/ui/AppPagination.js';
import AppEmptyState from './components/ui/AppEmptyState.js';
import AppLayout   from './components/layout/AppLayout.js';
import AppSidebar  from './components/layout/AppSidebar.js';
import AppNavbar   from './components/layout/AppNavbar.js';

// ─── Root Component (App Shell) ───────────────────────────────
const App = {
  name: 'App',

  /**
   * Template utama:
   * - RouterView: Menampilkan halaman sesuai route
   * - Transition pada halaman publik (Landing, Login)
   * - Halaman dashboard ditangani oleh AppLayoutShell (sidebar tidak di-refresh)
   * - AppToast: Toast notification yang selalu ada
   */
  template: `
    <div>
      <!-- Router View: Publik pages pakai transition biasa -->
      <RouterView v-slot="{ Component, route }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.meta?.requiresAuth ? 'layout-shell' : route.path" />
        </Transition>
      </RouterView>

      <!-- Toast Notification — Global -->
      <AppToast />
    </div>
  `,

  components: {
    AppToast,
  },
};

// ─── Buat Vue Application ─────────────────────────────────────
const app = createApp(App);

// ─── Registrasi Komponen Global ───────────────────────────────
// Komponen yang sering digunakan tidak perlu di-import per halaman
app.component('AppModal',      AppModal);
app.component('AppBadge',      AppBadge);
app.component('AppPagination', AppPagination);
app.component('AppEmptyState', AppEmptyState);
app.component('AppLayout',     AppLayout);
app.component('AppSidebar',    AppSidebar);
app.component('AppNavbar',     AppNavbar);
app.component('AppToast',      AppToast);

// ─── Pasang Router ────────────────────────────────────────────
app.use(router);

// ─── Inisialisasi Dark Mode ───────────────────────────────────
// Terapkan dark mode dari localStorage sebelum render
appStore.initDarkMode();

// ─── Mount Aplikasi ke DOM ────────────────────────────────────
app.mount('#app');

console.log('%c🚀 E-Inventory Management System', 'color: #3b82f6; font-size: 16px; font-weight: bold;');
console.log('%cVue 3 + CodeIgniter 4 + TailwindCSS', 'color: #94a3b8; font-size: 12px;');

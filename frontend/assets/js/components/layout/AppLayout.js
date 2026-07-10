/**
 * ============================================================
 * AppLayout.js — Dashboard Layout Wrapper
 * ============================================================
 * Layout utama dashboard: Sidebar + Navbar + Content Area.
 * Semua halaman dashboard menggunakan layout ini.
 * ============================================================
 */
import { defineComponent }  from 'vue';
import AppSidebar from './AppSidebar.js';
import AppNavbar  from './AppNavbar.js';
import appStore   from '../../stores/appStore.js';

export default defineComponent({
  name: 'AppLayout',
  components: { AppSidebar, AppNavbar },

  template: `
    <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <!-- Sidebar -->
      <AppSidebar />

      <!-- Main Content -->
      <div class="flex flex-col flex-1 overflow-hidden">
        <!-- Navbar -->
        <AppNavbar />

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto">
          <div class="p-6">
            <slot />
          </div>
        </main>
      </div>
    </div>
  `,
});

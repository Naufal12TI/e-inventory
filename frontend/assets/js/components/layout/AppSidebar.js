/**
 * ============================================================
 * AppSidebar.js — Dashboard Sidebar
 * ============================================================
 * Sidebar navigasi dengan:
 * - Logo & nama aplikasi
 * - Menu item dengan ikon Heroicons
 * - Active state berdasarkan route
 * - Collapsible (ikon saja saat collapsed)
 * - Dark mode support
 * ============================================================
 */
import { defineComponent, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import appStore from '../../stores/appStore.js';
import authStore from '../../stores/authStore.js';

export default defineComponent({
  name: 'AppSidebar',

  setup() {
    const router = useRouter();
    const route  = useRoute();

    // Daftar menu navigasi
    const menuItems = computed(() => {
      const items = [
        {
          name: 'Dashboard',
          routeName: 'dashboard',
          icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`,
        },
        {
          name: 'Barang',
          routeName: 'items',
          icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`,
        },
        {
          name: 'Kategori',
          routeName: 'categories',
          icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>`,
        },
        {
          name: 'Supplier',
          routeName: 'suppliers',
          icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`,
        },
        {
          name: 'Riwayat Stok',
          routeName: 'stocks',
          icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
        },
      ];

      if (authStore.userRole === 'Administrator') {
        items.push({
          name: 'Pengguna',
          routeName: 'users',
          icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
        });
      }

      return items;
    });

    const isActive = (routeName) => route.name === routeName;

    const navigate = (routeName) => {
      router.push({ name: routeName });
    };

    const collapsed = computed(() => appStore.sidebarCollapsed);

    return { menuItems, isActive, navigate, collapsed, appStore, authStore };
  },

  template: `
    <aside
      :class="[
        'sidebar-transition flex flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 h-full overflow-hidden flex-shrink-0',
        collapsed ? 'w-16' : 'w-64'
      ]"
    >
      <!-- Logo -->
      <div :class="['flex items-center gap-3 px-4 py-5 border-b border-gray-100 dark:border-gray-800', collapsed ? 'justify-center' : '']">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-md">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
        </div>
        <div v-if="!collapsed" class="overflow-hidden">
          <h1 class="text-sm font-bold text-gray-900 dark:text-white leading-tight whitespace-nowrap">E-Inventory</h1>
          <p class="text-xs text-gray-400 leading-tight">Management System</p>
        </div>
      </div>

      <!-- Navigasi -->
      <nav class="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        <p v-if="!collapsed" class="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">Menu</p>

        <button
          v-for="item in menuItems"
          :key="item.routeName"
          @click="navigate(item.routeName)"
          :title="collapsed ? item.name : ''"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
            collapsed ? 'justify-center' : '',
            isActive(item.routeName)
              ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
          ]"
        >
          <!-- Active indicator -->
          <span
            v-if="isActive(item.routeName)"
            class="absolute left-0 w-0.5 h-8 bg-blue-600 rounded-r-full"
          ></span>

          <span v-html="item.icon" class="flex-shrink-0"></span>
          <span v-if="!collapsed" class="truncate">{{ item.name }}</span>

          <!-- Active dot -->
          <span v-if="isActive(item.routeName) && !collapsed" class="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"></span>
        </button>
      </nav>

      <!-- Footer Sidebar — info user -->
      <div :class="['border-t border-gray-100 dark:border-gray-800 p-3', collapsed ? 'flex justify-center' : '']">
        <div v-if="!collapsed" class="flex items-center gap-3 px-2 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <!-- Avatar -->
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <span class="text-xs font-bold text-white">{{ authStore.userName.charAt(0).toUpperCase() }}</span>
          </div>
          <div class="flex-1 overflow-hidden">
            <p class="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{{ authStore.userName }}</p>
            <p class="text-[10px] text-gray-400 truncate">{{ authStore.userRole }}</p>
          </div>
        </div>
        <div v-else class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <span class="text-xs font-bold text-white">{{ authStore.userName.charAt(0).toUpperCase() }}</span>
        </div>
      </div>
    </aside>
  `,
});

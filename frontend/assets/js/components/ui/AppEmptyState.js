/**
 * AppEmptyState.js — Empty State Component
 * Ditampilkan ketika tidak ada data dalam tabel.
 */
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AppEmptyState',
  props: {
    title:       { type: String, default: 'Tidak Ada Data' },
    description: { type: String, default: 'Belum ada data yang tersedia saat ini.' },
    icon:        { type: String, default: 'box' }, // 'box' | 'search' | 'folder'
  },
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
      <!-- Ilustrasi -->
      <div class="w-20 h-20 mb-6 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <!-- Box icon -->
        <svg v-if="icon === 'box'" class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
        </svg>
        <!-- Search icon -->
        <svg v-else-if="icon === 'search'" class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <!-- Folder icon -->
        <svg v-else class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
        </svg>
      </div>
      <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">{{ title }}</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 max-w-xs">{{ description }}</p>
    </div>
  `,
});

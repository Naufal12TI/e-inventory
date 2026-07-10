/**
 * ============================================================
 * AppPagination.js — Pagination Component
 * ============================================================
 * Komponen paginasi yang dapat digunakan di semua halaman CRUD.
 *
 * Props:
 * - currentPage  {Number} — Halaman saat ini
 * - totalItems   {Number} — Total data
 * - perPage      {Number} — Data per halaman (default: 10)
 *
 * Emits:
 * - page-change  — Dipanggil dengan nomor halaman baru
 * ============================================================
 */
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'AppPagination',

  props: {
    currentPage: { type: Number, required: true },
    totalItems:  { type: Number, required: true },
    perPage:     { type: Number, default: 10 },
  },

  emits: ['page-change'],

  setup(props, { emit }) {
    // Hitung total halaman
    const totalPages = computed(() => Math.ceil(props.totalItems / props.perPage));

    // Hitung nomor item yang ditampilkan
    const fromItem = computed(() => ((props.currentPage - 1) * props.perPage) + 1);
    const toItem   = computed(() => Math.min(props.currentPage * props.perPage, props.totalItems));

    /**
     * Buat array nomor halaman yang ditampilkan.
     * Maksimal 5 halaman terlihat sekaligus.
     */
    const pages = computed(() => {
      const total = totalPages.value;
      const current = props.currentPage;
      const delta = 2; // halaman kiri & kanan dari current
      const pages = [];

      let start = Math.max(1, current - delta);
      let end   = Math.min(total, current + delta);

      // Pastikan selalu 5 halaman jika tersedia
      if (end - start < 4) {
        if (start === 1) end = Math.min(5, total);
        else start = Math.max(1, end - 4);
      }

      for (let i = start; i <= end; i++) pages.push(i);
      return pages;
    });

    const goTo = (page) => {
      if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
        emit('page-change', page);
      }
    };

    return { totalPages, fromItem, toItem, pages, goTo };
  },

  template: `
    <div v-if="totalItems > 0" class="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
      <!-- Info data -->
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Menampilkan
        <span class="font-semibold text-gray-700 dark:text-gray-300">{{ fromItem }}&ndash;{{ toItem }}</span>
        dari
        <span class="font-semibold text-gray-700 dark:text-gray-300">{{ totalItems }}</span>
        data
      </p>

      <!-- Tombol navigasi -->
      <div class="flex items-center gap-1">
        <!-- Prev -->
        <button
          @click="goTo(currentPage - 1)"
          :disabled="currentPage === 1"
          :class="['p-2 rounded-lg transition-colors text-sm',
            currentPage === 1
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800']"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <!-- Halaman pertama jika tidak termasuk -->
        <template v-if="pages[0] > 1">
          <button @click="goTo(1)" class="w-8 h-8 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">1</button>
          <span v-if="pages[0] > 2" class="text-gray-400 px-1">...</span>
        </template>

        <!-- Nomor halaman -->
        <button
          v-for="page in pages"
          :key="page"
          @click="goTo(page)"
          :class="['w-8 h-8 rounded-lg text-sm font-medium transition-colors',
            page === currentPage
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800']"
        >
          {{ page }}
        </button>

        <!-- Halaman terakhir jika tidak termasuk -->
        <template v-if="pages[pages.length - 1] < totalPages">
          <span v-if="pages[pages.length - 1] < totalPages - 1" class="text-gray-400 px-1">...</span>
          <button @click="goTo(totalPages)" class="w-8 h-8 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">{{ totalPages }}</button>
        </template>

        <!-- Next -->
        <button
          @click="goTo(currentPage + 1)"
          :disabled="currentPage === totalPages"
          :class="['p-2 rounded-lg transition-colors text-sm',
            currentPage === totalPages
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800']"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  `,
});

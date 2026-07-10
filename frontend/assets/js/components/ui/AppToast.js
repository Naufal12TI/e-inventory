/**
 * ============================================================
 * AppToast.js — Toast Notification Component
 * ============================================================
 * Menampilkan stack notifikasi di sudut kanan bawah.
 * Dikendalikan oleh appStore.toasts.
 * ============================================================
 */
import { defineComponent, h, TransitionGroup } from 'vue';
import appStore from '../../stores/appStore.js';

export default defineComponent({
  name: 'AppToast',

  setup() {
    // Icon SVG untuk tiap tipe toast
    const icons = {
      success: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`,
      error:   `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`,
      warning: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
      info:    `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    };

    // Style warna per tipe
    const styles = {
      success: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-300',
      error:   'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300',
      warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300',
      info:    'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300',
    };

    const iconStyles = {
      success: 'text-emerald-500',
      error:   'text-red-500',
      warning: 'text-amber-500',
      info:    'text-blue-500',
    };

    return { appStore, icons, styles, iconStyles };
  },

  template: `
    <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none" style="max-width: 380px;">
      <TransitionGroup name="toast" tag="div" class="flex flex-col gap-3">
        <div
          v-for="toast in appStore.toasts"
          :key="toast.id"
          :class="['pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-lg backdrop-blur-sm', styles[toast.type]]"
        >
          <!-- Icon -->
          <span :class="['flex-shrink-0 mt-0.5', iconStyles[toast.type]]" v-html="icons[toast.type]"></span>

          <!-- Pesan -->
          <p class="text-sm font-medium flex-1 leading-snug">{{ toast.message }}</p>

          <!-- Tombol tutup -->
          <button
            @click="appStore.removeToast(toast.id)"
            class="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity mt-0.5"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  `,
});

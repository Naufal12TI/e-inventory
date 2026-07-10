/**
 * ============================================================
 * appStore.js — Global App State
 * ============================================================
 * Menyimpan state global aplikasi:
 * - Dark mode (dengan localStorage)
 * - Toast notifications
 * - Sidebar collapsed state
 * - Global loading
 * ============================================================
 */
import { reactive } from 'vue';

const appStore = reactive({
  // ─── Dark Mode ──────────────────────────────────────────────
  isDarkMode: localStorage.getItem('darkMode') === 'true',

  /** Toggle dark mode */
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode);

    // Terapkan class 'dark' ke elemen html
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  /** Inisialisasi dark mode saat app pertama dimuat */
  initDarkMode() {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  },

  // ─── Sidebar ────────────────────────────────────────────────
  sidebarCollapsed: false,

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  },

  // ─── Toast Notifications ───────────────────────────────────
  toasts: [],
  toastIdCounter: 0,

  /**
   * Tampilkan toast notification.
   * @param {string} message  Pesan yang ditampilkan
   * @param {string} type     'success' | 'error' | 'warning' | 'info'
   * @param {number} duration Durasi tampil dalam ms (default: 3500)
   */
  showToast(message, type = 'success', duration = 3500) {
    const id = ++this.toastIdCounter;
    this.toasts.push({ id, message, type });

    // Auto-remove toast setelah durasi
    setTimeout(() => {
      this.removeToast(id);
    }, duration);
  },

  /** Hapus toast berdasarkan ID */
  removeToast(id) {
    const index = this.toasts.findIndex(t => t.id === id);
    if (index > -1) this.toasts.splice(index, 1);
  },

  // ─── Shorthand Toast Helpers ────────────────────────────────
  success(msg) { this.showToast(msg, 'success'); },
  error(msg)   { this.showToast(msg, 'error', 4500); },
  warning(msg) { this.showToast(msg, 'warning', 4000); },
  info(msg)    { this.showToast(msg, 'info'); },
});

export default appStore;

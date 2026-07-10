/**
 * ============================================================
 * authStore.js — Auth State Management
 * ============================================================
 * Menyimpan state autentikasi secara reaktif.
 * Sinkron dengan localStorage.
 * ============================================================
 */
import { reactive } from 'vue';

// State autentikasi yang bisa diakses dari semua komponen
const authStore = reactive({
  // ─── State ─────────────────────────────────────────────────
  token:       localStorage.getItem('token')      || null,
  user:        JSON.parse(localStorage.getItem('user') || 'null'),
  isLoggedIn:  localStorage.getItem('isLoggedIn') === 'true',

  // ─── Getters ────────────────────────────────────────────────
  /** Cek apakah user sudah login */
  get authenticated() {
    return this.isLoggedIn && !!this.token;
  },

  /** Ambil nama user */
  get userName() {
    return this.user?.nama || this.user?.username || 'Admin';
  },

  /** Ambil role user */
  get userRole() {
    return this.user?.role || 'Administrator';
  },

  // ─── Mutations ──────────────────────────────────────────────
  /**
   * Simpan data login ke state dan localStorage.
   * @param {string} token   Bearer token
   * @param {Object} user    Data user
   */
  setAuth(token, user) {
    this.token      = token;
    this.user       = user;
    this.isLoggedIn = true;

    // Simpan ke localStorage agar persist saat refresh
    localStorage.setItem('token',       token);
    localStorage.setItem('user',        JSON.stringify(user));
    localStorage.setItem('isLoggedIn',  'true');
  },

  /**
   * Hapus semua data autentikasi (logout).
   */
  clearAuth() {
    this.token      = null;
    this.user       = null;
    this.isLoggedIn = false;

    // Hapus dari localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
  },
});

export default authStore;

/**
 * ============================================================
 * authService.js
 * ============================================================
 * Service untuk semua operasi autentikasi.
 * Memisahkan logika API dari komponen Vue.
 * ============================================================
 */
import api from '../config/axios.js';

const authService = {
  /**
   * Login pengguna.
   * @param {string} username
   * @param {string} password
   * @returns {Promise} Response API dengan token dan data user
   */
  async login(username, password) {
    const response = await api.post('/login', { username, password });
    return response.data;
  },

  /**
   * Ambil profil user yang sedang login.
   * @returns {Promise} Data profil user
   */
  async getProfile() {
    const response = await api.get('/profile');
    return response.data;
  },

  /**
   * Logout pengguna.
   * @returns {Promise}
   */
  async logout() {
    const response = await api.post('/logout');
    return response.data;
  },
};

export default authService;

/**
 * ============================================================
 * Axios Configuration
 * ============================================================
 * Instance Axios terpusat dengan:
 * - Base URL API backend
 * - Request Interceptor: Auto-inject Bearer Token
 * - Response Interceptor: Handle 401 Unauthorized
 * ============================================================
 */
import axios from 'axios';

// ─── Base URL Backend CI4 ─────────────────────────────────────
const API_BASE_URL = 'http://localhost:8080/api';

// Buat instance Axios dengan konfigurasi dasar
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
  timeout: 15000, // 15 detik timeout
});

// ─── Request Interceptor ──────────────────────────────────────
// Otomatis menambahkan Authorization header pada setiap request
apiClient.interceptors.request.use(
  (config) => {
    // Ambil token dari localStorage
    const token = localStorage.getItem('token');

    if (token) {
      // Tambahkan Bearer Token ke header
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ─── Response Interceptor ─────────────────────────────────────
// Handle response error secara global
apiClient.interceptors.response.use(
  // Response sukses: langsung kembalikan data
  (response) => response,

  // Response error: handle berdasarkan status code
  (error) => {
    if (error.response && error.response.status === 401) {
      // 401 Unauthorized — Token tidak valid atau kedaluwarsa
      alert('Sesi login telah habis. Silakan login kembali.');

      // Hapus semua data sesi dari localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');

      // Redirect ke halaman login
      window.location.hash = '#/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;

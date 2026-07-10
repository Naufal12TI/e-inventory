/**
 * ============================================================
 * LoginPage.js — Halaman Login (/login)
 * ============================================================
 * Desain premium dengan:
 * - Split layout (gradient kiri + form kanan)
 * - Input dengan icon
 * - Password show/hide
 * - Loading spinner
 * - Toast notification
 * - Validasi form
 * ============================================================
 */
import { defineComponent, ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../services/authService.js';
import authStore from '../stores/authStore.js';
import appStore from '../stores/appStore.js';

export default defineComponent({
  name: 'LoginPage',

  setup() {
    const router = useRouter();

    // Form state
    const form = reactive({
      username: '',
      password: '',
    });

    // UI state
    const isLoading = ref(false);
    const showPassword = ref(false);
    const errors = reactive({ username: '', password: '', general: '' });

    /**
     * Validasi form sebelum submit.
     * @returns {boolean} true jika valid
     */
    const validateForm = () => {
      errors.username = '';
      errors.password = '';
      errors.general = '';

      let valid = true;

      if (!form.username.trim()) {
        errors.username = 'Username wajib diisi.';
        valid = false;
      }
      if (!form.password) {
        errors.password = 'Password wajib diisi.';
        valid = false;
      } else if (form.password.length < 6) {
        errors.password = 'Password minimal 6 karakter.';
        valid = false;
      }

      return valid;
    };

    /**
     * Handle form submission.
     */
    const handleLogin = async () => {
      if (!validateForm()) return;

      isLoading.value = true;
      errors.general = '';

      try {
        const res = await authService.login(form.username, form.password);

        if (res.status) {
          // Simpan data autentikasi ke store & localStorage
          authStore.setAuth(res.data.token, res.data.user);
          appStore.success(`Selamat datang, ${res.data.user.nama || res.data.user.username}!`);

          // Redirect ke dashboard
          router.push({ name: 'dashboard' });
        } else {
          errors.general = res.message || 'Login gagal.';
        }
      } catch (error) {
        if (error.response?.status === 401) {
          errors.general = 'Username atau password salah.';
        } else {
          errors.general = 'Gagal terhubung ke server. Pastikan backend berjalan.';
        }
      } finally {
        isLoading.value = false;
      }
    };

    return {
      form, errors, isLoading, showPassword, handleLogin,
    };
  },

  template: `
    <div class="min-h-screen flex">

      <!-- ──────────────────────────────────────────────────
           LEFT PANEL — Branding & Info
      ────────────────────────────────────────────────── -->
      <div class="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 relative overflow-hidden">
        <!-- Background decoration -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-2xl"></div>
          <div class="absolute bottom-20 -left-20 w-72 h-72 bg-blue-900/30 rounded-full blur-2xl"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/3 rounded-full blur-3xl"></div>
        </div>

        <!-- Logo -->
        <div class="relative flex items-center gap-3 z-10">
          <div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <div>
            <h1 class="text-white font-bold text-lg leading-tight">E-Inventory</h1>
            <p class="text-blue-200 text-xs">Management System</p>
          </div>
        </div>

        <!-- Main Content -->
        <div class="relative z-10">
          <h2 class="text-4xl font-black text-white leading-tight mb-4">
            Selamat Datang
            <br />
            <span class="text-blue-200">Kembali!</span>
          </h2>
          <p class="text-blue-100 text-lg leading-relaxed mb-8">
            Masuk untuk mengelola inventaris perusahaan Anda dengan mudah, cepat, dan aman.
          </p>

          <!-- Feature list -->
          <div class="space-y-3">
            <div v-for="f in ['Dashboard analitik real-time', 'Manajemen stok lengkap', 'Low stock alert otomatis', 'Export laporan PDF & Excel']"
              :key="f" class="flex items-center gap-3 text-white">
              <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <span class="text-sm text-blue-100">{{ f }}</span>
            </div>
          </div>
        </div>

        <!-- Bottom -->
        <p class="relative z-10 text-blue-300 text-xs">© 2026 E-Inventory Management System</p>
      </div>

      <!-- ──────────────────────────────────────────────────
           RIGHT PANEL — Login Form
      ────────────────────────────────────────────────── -->
      <div class="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-950">
        <div class="w-full max-w-md animate-slide-up">

          <!-- Mobile Logo -->
          <div class="lg:hidden flex items-center gap-3 mb-8">
            <div class="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <div>
              <h1 class="font-bold text-gray-900 dark:text-white">E-Inventory</h1>
              <p class="text-xs text-gray-400">Management System</p>
            </div>
          </div>

          <!-- Heading -->
          <div class="mb-8">
            <h2 class="text-3xl font-black text-gray-900 dark:text-white mb-2">Masuk ke Akun</h2>
            <p class="text-gray-500 dark:text-gray-400">Masukkan kredensial Anda untuk melanjutkan.</p>
          </div>

          <!-- Error Global -->
          <div
            v-if="errors.general"
            class="mb-6 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 flex items-start gap-3"
          >
            <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-sm text-red-700 dark:text-red-400">{{ errors.general }}</p>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleLogin" class="space-y-5">

            <!-- Username -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Username</label>
              <div class="relative">
                <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <input
                  id="input-username"
                  v-model="form.username"
                  type="text"
                  placeholder="Masukkan username"
                  autocomplete="username"
                  :class="[
                    'w-full pl-11 pr-4 py-3 rounded-xl border text-sm transition-all duration-200 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400',
                    errors.username
                      ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none'
                      : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none'
                  ]"
                />
              </div>
              <p v-if="errors.username" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                {{ errors.username }}
              </p>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div class="relative">
                <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input
                  id="input-password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Masukkan password"
                  autocomplete="current-password"
                  :class="[
                    'w-full pl-11 pr-12 py-3 rounded-xl border text-sm transition-all duration-200 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400',
                    errors.password
                      ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none'
                      : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none'
                  ]"
                />
                <!-- Toggle show/hide password -->
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  :title="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                >
                  <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                </button>
              </div>
              <p v-if="errors.password" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                {{ errors.password }}
              </p>
            </div>

            <!-- Submit Button -->
            <button
              id="btn-login"
              type="submit"
              :disabled="isLoading"
              class="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm transition-all duration-200 shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 disabled:cursor-not-allowed flex items-center justify-center gap-3 btn-ripple"
            >
              <!-- Loading spinner -->
              <svg v-if="isLoading" class="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <span>{{ isLoading ? 'Memproses...' : 'Masuk ke Dashboard' }}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
});

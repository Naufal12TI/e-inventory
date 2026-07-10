/**
 * ============================================================
 * AppNavbar.js — Top Navigation Bar
 * ============================================================
 * Navbar atas dashboard dengan:
 * - Tombol toggle sidebar
 * - Breadcrumb halaman
 * - Realtime jam & tanggal
 * - Notifikasi stok rendah (bell icon)
 * - Toggle dark mode
 * - Dropdown profil + modal edit profil + ganti password
 * ============================================================
 */
import { defineComponent, ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import appStore  from '../../stores/appStore.js';
import authStore from '../../stores/authStore.js';
import authService from '../../services/authService.js';
import dashboardService from '../../services/dashboardService.js';
import userService from '../../services/userService.js';
import AppModal from '../ui/AppModal.js';

export default defineComponent({
  name: 'AppNavbar',
  components: { AppModal },

  setup() {
    const route  = useRoute();
    const router = useRouter();

    // ─── Realtime Clock ─────────────────────────────────────
    const now       = ref(new Date());
    let clockInterval;

    onMounted(() => {
      clockInterval = setInterval(() => { now.value = new Date(); }, 1000);
    });
    onUnmounted(() => clearInterval(clockInterval));

    const timeStr = computed(() => now.value.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    const dateStr = computed(() => now.value.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));

    // ─── Breadcrumb ─────────────────────────────────────────
    const breadcrumb = computed(() => route.meta?.breadcrumb || 'Dashboard');

    // ─── Profile Dropdown & Modals ──────────────────────────
    const showProfileMenu = ref(false);
    const showProfileModal = ref(false);
    const showPasswordModal = ref(false);

    const toggleProfileMenu = () => {
      showProfileMenu.value = !showProfileMenu.value;
    };

    // Form profile state
    const profileForm = reactive({ nama: '', username: '' });
    const profileErrors = reactive({ nama: '', username: '' });
    const isSavingProfile = ref(false);

    // Form password state
    const passwordForm = reactive({ old_password: '', new_password: '' });
    const passwordErrors = reactive({ old_password: '', new_password: '' });
    const isSavingPassword = ref(false);

    const openProfileModal = () => {
      showProfileMenu.value = false;
      profileForm.nama = authStore.user?.nama || '';
      profileForm.username = authStore.user?.username || '';
      profileErrors.nama = '';
      profileErrors.username = '';
      showProfileModal.value = true;
    };

    const openPasswordModal = () => {
      showProfileMenu.value = false;
      passwordForm.old_password = '';
      passwordForm.new_password = '';
      passwordErrors.old_password = '';
      passwordErrors.new_password = '';
      showPasswordModal.value = true;
    };

    const handleUpdateProfile = async () => {
      profileErrors.nama = '';
      profileErrors.username = '';
      if (!profileForm.nama.trim()) { profileErrors.nama = 'Nama wajib diisi.'; return; }
      if (!profileForm.username.trim()) { profileErrors.username = 'Username wajib diisi.'; return; }

      isSavingProfile.value = true;
      try {
        const res = await userService.updateProfile(profileForm);
        if (res.status) {
          // Update authStore
          const updatedUser = { ...authStore.user, nama: res.data.nama, username: res.data.username };
          authStore.setAuth(authStore.token, updatedUser);
          appStore.success('Profil berhasil diperbarui!');
          showProfileModal.value = false;
        }
      } catch (e) {
        const msg = e.response?.data?.message || 'Gagal memperbarui profil.';
        appStore.error(msg);
      } finally {
        isSavingProfile.value = false;
      }
    };

    const handleChangePassword = async () => {
      passwordErrors.old_password = '';
      passwordErrors.new_password = '';
      if (!passwordForm.old_password) { passwordErrors.old_password = 'Password lama wajib diisi.'; return; }
      if (!passwordForm.new_password) { passwordErrors.new_password = 'Password baru wajib diisi.'; return; }
      if (passwordForm.new_password.length < 6) { passwordErrors.new_password = 'Password baru minimal 6 karakter.'; return; }

      isSavingPassword.value = true;
      try {
        const res = await userService.changePassword(passwordForm);
        if (res.status) {
          appStore.success('Password berhasil diubah!');
          showPasswordModal.value = false;
        }
      } catch (e) {
        const msg = e.response?.data?.message || 'Gagal mengubah password.';
        appStore.error(msg);
      } finally {
        isSavingPassword.value = false;
      }
    };

    // ─── Low Stock Notifications ─────────────────────────────
    const showNotification = ref(false);
    const lowStockItems = ref([]);
    let notifyInterval;

    const loadLowStock = async () => {
      try {
        const res = await dashboardService.getLowStock();
        if (res.status) {
          lowStockItems.value = res.data;
        }
      } catch (e) {
        // Abaikan error background check
      }
    };

    const toggleNotification = () => {
      showNotification.value = !showNotification.value;
      if (showNotification.value) {
        loadLowStock();
      }
    };

    onMounted(() => {
      loadLowStock();
      // Auto-refresh notifications setiap 2 menit
      notifyInterval = setInterval(loadLowStock, 120000);
    });

    onUnmounted(() => {
      clearInterval(notifyInterval);
    });

    // Tutup dropdown saat klik di luar
    const closeMenu = (e) => {
      if (!e.target.closest('#profile-btn')) {
        showProfileMenu.value = false;
      }
      if (!e.target.closest('#bell-btn')) {
        showNotification.value = false;
      }
    };
    onMounted(() => document.addEventListener('click', closeMenu));
    onUnmounted(() => document.removeEventListener('click', closeMenu));

    // ─── Logout ──────────────────────────────────────────────
    const isLoggingOut = ref(false);

    const logout = async () => {
      isLoggingOut.value = true;
      try {
        await authService.logout();
      } catch (e) {
        // Tetap logout meski API gagal
      } finally {
        authStore.clearAuth();
        appStore.success('Berhasil logout. Sampai jumpa!');
        router.push({ name: 'login' });
      }
    };

    return {
      appStore, authStore,
      timeStr, dateStr,
      breadcrumb,
      showProfileMenu, toggleProfileMenu,
      showProfileModal, showPasswordModal, profileForm, profileErrors, isSavingProfile,
      passwordForm, passwordErrors, isSavingPassword,
      openProfileModal, openPasswordModal, handleUpdateProfile, handleChangePassword,
      logout, isLoggingOut,
      showNotification, lowStockItems, toggleNotification
    };
  },

  template: `
    <header class="flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">

      <!-- Kiri: Toggle sidebar + Breadcrumb -->
      <div class="flex items-center gap-4">
        <!-- Tombol toggle sidebar -->
        <button
          @click="appStore.toggleSidebar()"
          class="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Toggle Sidebar"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        <!-- Breadcrumb -->
        <div class="hidden sm:flex items-center gap-2 text-sm">
          <span class="text-gray-400">Dashboard</span>
          <svg class="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
          <span class="font-semibold text-gray-700 dark:text-gray-300">{{ breadcrumb }}</span>
        </div>
      </div>

      <!-- Kanan: Jam, Notifikasi, Dark Mode, Profil -->
      <div class="flex items-center gap-2">

        <!-- Realtime Clock (hidden di mobile) -->
        <div class="hidden md:flex flex-col items-end mr-2">
          <span class="text-sm font-semibold text-gray-800 dark:text-gray-200 font-mono">{{ timeStr }}</span>
          <span class="text-xs text-gray-400 dark:text-gray-500">{{ dateStr }}</span>
        </div>

        <!-- Low Stock Bell Icon -->
        <div class="relative">
          <button
            id="bell-btn"
            @click="toggleNotification"
            class="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
            title="Notifikasi Stok Rendah"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <span v-if="lowStockItems.length" class="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </button>

          <!-- Notification Dropdown -->
          <Transition name="slide-down">
            <div
              v-if="showNotification"
              class="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl py-3 z-50 overflow-hidden"
            >
              <div class="px-4 pb-2 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <span class="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Stok Rendah</span>
                <span class="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full font-semibold">{{ lowStockItems.length }} Barang</span>
              </div>
              <div class="max-h-60 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
                <div v-if="!lowStockItems.length" class="px-4 py-6 text-center text-xs text-gray-500">
                  Semua stok barang aman.
                </div>
                <div
                  v-else
                  v-for="item in lowStockItems"
                  :key="item.id"
                  class="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors flex justify-between items-center"
                >
                  <div class="overflow-hidden pr-2">
                    <p class="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{{ item.nama_barang }}</p>
                    <p class="text-[10px] text-gray-400 font-mono mt-0.5">{{ item.kode_barang }}</p>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <span class="text-xs font-bold text-red-600">Stok: {{ item.stok }}</span>
                    <p class="text-[9px] text-gray-400 mt-0.5">Min: {{ item.stok_minimum }}</p>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Dark Mode Toggle -->
        <button
          @click="appStore.toggleDarkMode()"
          class="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          :title="appStore.isDarkMode ? 'Mode Terang' : 'Mode Gelap'"
        >
          <!-- Moon icon (dark mode off) -->
          <svg v-if="!appStore.isDarkMode" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
          <!-- Sun icon (dark mode on) -->
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
        </button>

        <!-- Divider -->
        <div class="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

        <!-- Profile Dropdown -->
        <div class="relative">
          <button
            id="profile-btn"
            @click="toggleProfileMenu"
            class="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <!-- Avatar -->
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span class="text-xs font-bold text-white">{{ authStore.userName.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="hidden sm:block text-left">
              <p class="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-tight">{{ authStore.userName }}</p>
              <p class="text-[10px] text-gray-400 leading-tight">{{ authStore.userRole }}</p>
            </div>
            <svg class="w-3.5 h-3.5 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <!-- Dropdown Menu -->
          <Transition name="slide-down">
            <div
              v-if="showProfileMenu"
              class="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl py-1.5 z-50"
            >
              <!-- Info User -->
              <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <p class="text-xs font-semibold text-gray-900 dark:text-gray-100">{{ authStore.userName }}</p>
                <p class="text-[11px] text-gray-400 mt-0.5">{{ authStore.userRole }}</p>
              </div>

              <!-- Menu Items -->
              <div class="py-1 border-b border-gray-100 dark:border-gray-800/80">
                <button
                  @click="openProfileModal"
                  class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  Edit Profil
                </button>
                <button
                  @click="openPasswordModal"
                  class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                  Ganti Password
                </button>
              </div>

              <div class="py-1">
                <button
                  @click="logout"
                  :disabled="isLoggingOut"
                  class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  {{ isLoggingOut ? 'Keluar...' : 'Logout' }}
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </header>

    <!-- Modal Edit Profil -->
    <AppModal :show="showProfileModal" @close="showProfileModal = false" title="Edit Profil Anda">
      <form @submit.prevent="handleUpdateProfile" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
          <input
            v-model="profileForm.nama"
            type="text"
            class="input-field"
            :class="{'border-red-500': profileErrors.nama}"
          />
          <p v-if="profileErrors.nama" class="text-xs text-red-500 mt-1">{{ profileErrors.nama }}</p>
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Username</label>
          <input
            v-model="profileForm.username"
            type="text"
            class="input-field font-mono"
            :class="{'border-red-500': profileErrors.username}"
          />
          <p v-if="profileErrors.username" class="text-xs text-red-500 mt-1">{{ profileErrors.username }}</p>
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            @click="showProfileModal = false"
            class="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-semibold transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="isSavingProfile"
            class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md flex items-center gap-2"
          >
            <svg v-if="isSavingProfile" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Simpan Perubahan
          </button>
        </div>
      </form>
    </AppModal>

    <!-- Modal Ganti Password -->
    <AppModal :show="showPasswordModal" @close="showPasswordModal = false" title="Ganti Password">
      <form @submit.prevent="handleChangePassword" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Password Lama</label>
          <input
            v-model="passwordForm.old_password"
            type="password"
            class="input-field"
            :class="{'border-red-500': passwordErrors.old_password}"
          />
          <p v-if="passwordErrors.old_password" class="text-xs text-red-500 mt-1">{{ passwordErrors.old_password }}</p>
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Password Baru</label>
          <input
            v-model="passwordForm.new_password"
            type="password"
            class="input-field"
            placeholder="Minimal 6 karakter"
            :class="{'border-red-500': passwordErrors.new_password}"
          />
          <p v-if="passwordErrors.new_password" class="text-xs text-red-500 mt-1">{{ passwordErrors.new_password }}</p>
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            @click="showPasswordModal = false"
            class="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-semibold transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="isSavingPassword"
            class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md flex items-center gap-2"
          >
            <svg v-if="isSavingPassword" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Ubah Password
          </button>
        </div>
      </form>
    </AppModal>
  `,
});

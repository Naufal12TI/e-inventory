/**
 * ============================================================
 * UserPage.js — Manajemen User (/users)
 * ============================================================
 * Menyediakan antarmuka manajemen user lengkap dengan CRUD,
 * filter, pencarian, dan restriksi hapus diri sendiri.
 * ============================================================
 */
import { defineComponent, ref, reactive, computed, onMounted, onActivated } from 'vue';
import AppModal      from '../components/ui/AppModal.js';
import AppPagination from '../components/ui/AppPagination.js';
import AppEmptyState from '../components/ui/AppEmptyState.js';
import userService   from '../services/userService.js';
import appStore      from '../stores/appStore.js';
import authStore     from '../stores/authStore.js';

export default defineComponent({
  name: 'UserPage',
  components: { AppModal, AppPagination, AppEmptyState },

  setup() {
    const users       = ref([]);
    const loading     = ref(false);
    const searchQuery = ref('');
    const currentPage = ref(1);
    const perPage     = 10;

    // Modal state
    const showModal = ref(false);
    const modalMode = ref('add'); // 'add' | 'edit'
    const isSaving  = ref(false);

    const form = reactive({ id: null, username: '', password: '', nama: '', role: 'Staff' });
    const formErrors = reactive({});

    // ─── Filter & Paginate ────────────────────────────────────
    const filteredUsers = computed(() => {
      if (!searchQuery.value) return users.value;
      const q = searchQuery.value.toLowerCase();
      return users.value.filter(u =>
        u.username.toLowerCase().includes(q) ||
        u.nama.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    });

    const paginatedUsers = computed(() => {
      const start = (currentPage.value - 1) * perPage;
      return filteredUsers.value.slice(start, start + perPage);
    });

    const loadUsers = async () => {
      loading.value = true;
      try {
        const res = await userService.getAll();
        if (res.status) users.value = res.data;
      } catch (e) {
        appStore.error('Gagal memuat data pengguna.');
      } finally {
        loading.value = false;
      }
    };

    onMounted(loadUsers);
    onActivated(loadUsers);

    // ─── Modal Helpers ────────────────────────────────────────
    const resetForm = () => {
      Object.assign(form, { id: null, username: '', password: '', nama: '', role: 'Staff' });
      Object.keys(formErrors).forEach(k => delete formErrors[k]);
    };

    const openAddModal = () => {
      modalMode.value = 'add';
      resetForm();
      showModal.value = true;
    };

    const openEditModal = (user) => {
      modalMode.value = 'edit';
      resetForm();
      form.id       = user.id;
      form.username = user.username;
      form.nama     = user.nama;
      form.role     = user.role;
      showModal.value = true;
    };

    const closeModal = () => { showModal.value = false; };

    // ─── Validasi Form ────────────────────────────────────────
    const validateForm = () => {
      Object.keys(formErrors).forEach(k => delete formErrors[k]);
      let valid = true;

      if (!form.username.trim()) {
        formErrors.username = 'Username wajib diisi.';
        valid = false;
      } else if (form.username.length < 3) {
        formErrors.username = 'Username minimal 3 karakter.';
        valid = false;
      }

      if (!form.nama.trim()) {
        formErrors.nama = 'Nama lengkap wajib diisi.';
        valid = false;
      }

      if (modalMode.value === 'add') {
        if (!form.password) {
          formErrors.password = 'Password wajib diisi.';
          valid = false;
        } else if (form.password.length < 6) {
          formErrors.password = 'Password minimal 6 karakter.';
          valid = false;
        }
      } else {
        if (form.password && form.password.length < 6) {
          formErrors.password = 'Password minimal 6 karakter.';
          valid = false;
        }
      }

      return valid;
    };

    // ─── Submit Form ──────────────────────────────────────────
    const handleSubmit = async () => {
      if (!validateForm()) return;

      isSaving.value = true;
      const payload = {
        username : form.username,
        nama     : form.nama,
        role     : form.role,
      };
      if (form.password) payload.password = form.password;

      try {
        if (modalMode.value === 'add') {
          const res = await userService.create(payload);
          if (res.status) appStore.success('Pengguna berhasil ditambahkan!');
        } else {
          const res = await userService.update(form.id, payload);
          if (res.status) appStore.success('Pengguna berhasil diperbarui!');
        }
        closeModal();
        loadUsers();
      } catch (e) {
        const errs = e.response?.data?.data;
        if (errs && typeof errs === 'object') {
          Object.assign(formErrors, errs);
        } else {
          appStore.error(e.response?.data?.message || 'Terjadi kesalahan.');
        }
      } finally {
        isSaving.value = false;
      }
    };

    // ─── Delete User ──────────────────────────────────────────
    const handleDelete = async (user) => {
      if (user.username === authStore.userName) {
        appStore.error('Anda tidak bisa menghapus akun Anda sendiri.');
        return;
      }

      const result = await Swal.fire({
        title: 'Hapus Pengguna?',
        html: `Pengguna <strong>"${user.nama}"</strong> akan dihapus secara permanen.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal',
        reverseButtons: true,
      });

      if (!result.isConfirmed) return;

      try {
        const res = await userService.delete(user.id);
        if (res.status) {
          appStore.success('Pengguna berhasil dihapus!');
          loadUsers();
        }
      } catch (e) {
        appStore.error(e.response?.data?.message || 'Gagal menghapus pengguna.');
      }
    };

    return {
      users, filteredUsers, paginatedUsers, loading, searchQuery, currentPage, perPage,
      showModal, modalMode, isSaving, form, formErrors,
      openAddModal, openEditModal, closeModal, handleSubmit, handleDelete,
      authStore,
    };
  },

  template: `
    <div class="space-y-6 animate-fade-in">

      <!-- ─── Header ─────────────────────────────────────────── -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Pengguna</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            <span class="font-semibold text-blue-600 dark:text-blue-400">{{ filteredUsers.length }}</span>
            pengguna ditemukan
          </p>
        </div>
        <button
          @click="openAddModal"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 btn-ripple"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Tambah Pengguna
        </button>
      </div>

      <!-- ─── Card Tabel ─────────────────────────────────────── -->
      <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">

        <!-- Search Bar -->
        <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div class="relative max-w-sm">
            <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari nama atau username..."
              class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        <!-- Skeleton Loading -->
        <div v-if="loading" class="p-6 space-y-3">
          <div v-for="i in 4" :key="i" class="skeleton h-14 w-full rounded-xl"></div>
        </div>

        <!-- Empty State -->
        <AppEmptyState
          v-else-if="!filteredUsers.length"
          :title="searchQuery ? 'Tidak Ditemukan' : 'Belum Ada Pengguna'"
          :description="searchQuery ? 'Coba gunakan kata kunci lain.' : 'Klik tombol Tambah Pengguna untuk memulai.'"
        />

        <!-- Table -->
        <div v-else class="table-container">
          <table class="w-full">
            <thead class="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th class="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                <th class="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama Lengkap</th>
                <th class="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Username</th>
                <th class="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th class="text-center py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 dark:divide-gray-800/80">
              <tr
                v-for="(u, i) in paginatedUsers"
                :key="u.id"
                class="table-row-hover hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
              >
                <!-- No -->
                <td class="py-4 px-6 text-sm text-gray-400">{{ (currentPage - 1) * perPage + i + 1 }}</td>

                <!-- Nama -->
                <td class="py-4 px-6">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span class="text-sm font-bold text-white">{{ u.nama.charAt(0).toUpperCase() }}</span>
                    </div>
                    <div>
                      <p class="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                        {{ u.nama }}
                        <span v-if="u.username === authStore.userName" class="ml-1.5 text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded-md font-medium">Saya</span>
                      </p>
                    </div>
                  </div>
                </td>

                <!-- Username -->
                <td class="py-4 px-6 text-sm text-gray-500 dark:text-gray-400 font-mono hidden sm:table-cell">
                  {{ u.username }}
                </td>

                <!-- Role Badge -->
                <td class="py-4 px-6">
                  <span :class="['inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold',
                    u.role === 'Administrator'
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400']">
                    {{ u.role }}
                  </span>
                </td>

                <!-- Aksi -->
                <td class="py-4 px-6">
                  <div class="flex items-center justify-center gap-1.5">
                    <button
                      @click="openEditModal(u)"
                      class="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                      title="Edit"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button
                      @click="handleDelete(u)"
                      :disabled="u.username === authStore.userName"
                      class="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Hapus"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="filteredUsers.length > perPage" class="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <AppPagination
            :current-page="currentPage"
            :total-items="filteredUsers.length"
            :per-page="perPage"
            @page-change="currentPage = $event"
          />
        </div>
      </div>

      <!-- ─── Modal Tambah/Edit ───────────────────────────────── -->
      <AppModal
        :show="showModal"
        :title="modalMode === 'add' ? '+ Tambah Pengguna' : '✏️ Edit Pengguna'"
        @close="closeModal"
        size="sm"
      >
        <form @submit.prevent="handleSubmit" class="space-y-4">

          <!-- Nama Lengkap -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Nama Lengkap <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.nama"
              type="text"
              placeholder="Contoh: Fauzi Aditya"
              :class="['w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all',
                formErrors.nama
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20']"
            />
            <p v-if="formErrors.nama" class="mt-1 text-xs text-red-500">{{ formErrors.nama }}</p>
          </div>

          <!-- Username -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Username <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.username"
              type="text"
              placeholder="Contoh: fauziaditya"
              autocomplete="off"
              :class="['w-full px-4 py-2.5 rounded-xl border text-sm font-mono bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all',
                formErrors.username
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20']"
            />
            <p v-if="formErrors.username" class="mt-1 text-xs text-red-500">{{ formErrors.username }}</p>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Password
              <span v-if="modalMode === 'add'" class="text-red-500">*</span>
              <span v-else class="text-gray-400 font-normal text-xs ml-1">(opsional)</span>
            </label>
            <input
              v-model="form.password"
              type="password"
              placeholder="Minimal 6 karakter"
              autocomplete="new-password"
              :class="['w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all',
                formErrors.password
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20']"
            />
            <p v-if="modalMode === 'edit'" class="mt-1 text-xs text-gray-400">Kosongkan jika tidak ingin mengubah password.</p>
            <p v-if="formErrors.password" class="mt-1 text-xs text-red-500">{{ formErrors.password }}</p>
          </div>

          <!-- Role -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Role <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.role"
              class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value="Administrator">Administrator</option>
              <option value="Staff">Staff</option>
            </select>
          </div>

        </form>
        <template #footer>
          <button
            @click="closeModal"
            class="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Batal
          </button>
          <button
            @click="handleSubmit"
            :disabled="isSaving"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold transition-colors btn-ripple"
          >
            <svg v-if="isSaving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {{ isSaving ? 'Menyimpan...' : (modalMode === 'add' ? 'Simpan' : 'Perbarui') }}
          </button>
        </template>
      </AppModal>

    </div>
  `,
});

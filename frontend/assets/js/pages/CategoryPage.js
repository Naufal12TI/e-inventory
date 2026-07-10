/**
 * ============================================================
 * CategoryPage.js — Manajemen Kategori (/categories)
 * ============================================================
 * Fitur: Search real-time, Tambah, Edit, Hapus,
 *        Modal, SweetAlert konfirmasi, Pagination.
 * ============================================================
 */
import { defineComponent, ref, reactive, computed, onMounted, onActivated, watch } from 'vue';
import AppModal      from '../components/ui/AppModal.js';
import AppPagination from '../components/ui/AppPagination.js';
import AppEmptyState from '../components/ui/AppEmptyState.js';
import categoryService from '../services/categoryService.js';
import appStore      from '../stores/appStore.js';

export default defineComponent({
  name: 'CategoryPage',
  components: { AppModal, AppPagination, AppEmptyState },

  setup() {
    // ─── State ──────────────────────────────────────────────
    const categories  = ref([]);
    const loading     = ref(false);
    const searchQuery = ref('');
    const currentPage = ref(1);
    const perPage     = 10;

    // Modal state
    const showModal   = ref(false);
    const modalMode   = ref('add'); // 'add' | 'edit'
    const isSaving    = ref(false);

    const form = reactive({ id: null, nama_kategori: '', deskripsi: '' });
    const formErrors = reactive({ nama_kategori: '' });

    // ─── Computed: Filter & Paginate ──────────────────────────
    const filteredCategories = computed(() => {
      if (!searchQuery.value) return categories.value;
      const q = searchQuery.value.toLowerCase();
      return categories.value.filter(c =>
        c.nama_kategori.toLowerCase().includes(q) ||
        (c.deskripsi || '').toLowerCase().includes(q)
      );
    });

    const paginatedCategories = computed(() => {
      const start = (currentPage.value - 1) * perPage;
      return filteredCategories.value.slice(start, start + perPage);
    });

    // Reset halaman saat pencarian berubah
    watch(searchQuery, () => { currentPage.value = 1; });

    // ─── Load Data ────────────────────────────────────────────
    const loadCategories = async () => {
      loading.value = true;
      try {
        const res = await categoryService.getAll();
        if (res.status) categories.value = res.data;
      } catch (e) {
        appStore.error('Gagal memuat data kategori.');
      } finally {
        loading.value = false;
      }
    };

    onMounted(loadCategories);
    onActivated(loadCategories); // Refresh data saat balik dari KeepAlive cache

    // ─── Modal Helpers ────────────────────────────────────────
    const openAddModal = () => {
      modalMode.value = 'add';
      form.id = null; form.nama_kategori = ''; form.deskripsi = '';
      formErrors.nama_kategori = '';
      showModal.value = true;
    };

    const openEditModal = (cat) => {
      modalMode.value = 'edit';
      form.id = cat.id; form.nama_kategori = cat.nama_kategori; form.deskripsi = cat.deskripsi || '';
      formErrors.nama_kategori = '';
      showModal.value = true;
    };

    const closeModal = () => { showModal.value = false; };

    // ─── Validasi Form ────────────────────────────────────────
    const validateForm = () => {
      formErrors.nama_kategori = '';
      if (!form.nama_kategori.trim()) {
        formErrors.nama_kategori = 'Nama kategori wajib diisi.';
        return false;
      }
      if (form.nama_kategori.length > 100) {
        formErrors.nama_kategori = 'Nama kategori maksimal 100 karakter.';
        return false;
      }
      return true;
    };

    // ─── Submit Form ──────────────────────────────────────────
    const handleSubmit = async () => {
      if (!validateForm()) return;

      isSaving.value = true;
      const payload = { nama_kategori: form.nama_kategori, deskripsi: form.deskripsi };

      try {
        if (modalMode.value === 'add') {
          const res = await categoryService.create(payload);
          if (res.status) {
            categories.value.unshift(res.data);
            appStore.success('Kategori berhasil ditambahkan!');
          }
        } else {
          const res = await categoryService.update(form.id, payload);
          if (res.status) {
            const idx = categories.value.findIndex(c => c.id === form.id);
            if (idx > -1) categories.value[idx] = res.data;
            appStore.success('Kategori berhasil diperbarui!');
          }
        }
        closeModal();
        loadCategories();
      } catch (e) {
        const msg = e.response?.data?.message || 'Terjadi kesalahan.';
        if (typeof msg === 'object') {
          formErrors.nama_kategori = msg.nama_kategori || 'Validasi gagal.';
        } else {
          appStore.error(msg);
        }
      } finally {
        isSaving.value = false;
      }
    };

    // ─── Delete ───────────────────────────────────────────────
    const handleDelete = async (cat) => {
      const result = await Swal.fire({
        title: 'Hapus Kategori?',
        html: `Kategori <strong>"${cat.nama_kategori}"</strong> akan dihapus secara permanen.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor:  '#6b7280',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText:  'Batal',
        reverseButtons: true,
      });

      if (!result.isConfirmed) return;

      try {
        const res = await categoryService.delete(cat.id);
        if (res.status) {
          categories.value = categories.value.filter(c => c.id !== cat.id);
          appStore.success('Kategori berhasil dihapus!');
        }
      } catch (e) {
        const msg = e.response?.data?.message || 'Gagal menghapus kategori.';
        appStore.error(msg);
      }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    return {
      categories, filteredCategories, paginatedCategories,
      loading, searchQuery, currentPage, perPage,
      showModal, modalMode, isSaving, form, formErrors,
      openAddModal, openEditModal, closeModal,
      handleSubmit, handleDelete, formatDate, loadCategories,
    };
  },

  template: `
    <div class="space-y-6 animate-fade-in">

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Kategori</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              <span class="font-semibold text-blue-600 dark:text-blue-400">{{ filteredCategories.length }}</span> kategori ditemukan
            </p>
          </div>
          <button
            id="btn-add-category"
            @click="openAddModal"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 btn-ripple"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Tambah Kategori
          </button>
        </div>

        <!-- Card Table -->
        <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">

          <!-- Search & Toolbar -->
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div class="relative max-w-sm">
              <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari kategori..."
                class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <!-- Skeleton Loading -->
          <div v-if="loading" class="p-6 space-y-4">
            <div v-for="i in 5" :key="i" class="skeleton h-14 w-full rounded-xl"></div>
          </div>

          <!-- Empty State -->
          <AppEmptyState
            v-else-if="!filteredCategories.length"
            :title="searchQuery ? 'Tidak Ditemukan' : 'Belum Ada Kategori'"
            :description="searchQuery ? 'Coba kata kunci lain.' : 'Tambah kategori pertama Anda.'"
            :icon="searchQuery ? 'search' : 'folder'"
          />

          <!-- Table -->
          <div v-else class="table-container">
            <table class="w-full">
              <thead class="bg-gray-50/80 dark:bg-gray-800/50">
                <tr>
                  <th class="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                  <th class="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama Kategori</th>
                  <th class="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Deskripsi</th>
                  <th class="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Dibuat</th>
                  <th class="text-center py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
                <tr
                  v-for="(cat, i) in paginatedCategories"
                  :key="cat.id"
                  class="table-row-hover hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <td class="py-4 px-6 text-sm text-gray-400">{{ (currentPage - 1) * perPage + i + 1 }}</td>
                  <td class="py-4 px-6">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center flex-shrink-0">
                        <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                        </svg>
                      </div>
                      <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ cat.nama_kategori }}</span>
                    </div>
                  </td>
                  <td class="py-4 px-6 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell max-w-xs truncate">
                    {{ cat.deskripsi || '—' }}
                  </td>
                  <td class="py-4 px-6 text-sm text-gray-400 hidden lg:table-cell whitespace-nowrap">{{ formatDate(cat.created_at) }}</td>
                  <td class="py-4 px-6">
                    <div class="flex items-center justify-center gap-2">
                      <!-- Edit -->
                      <button
                        @click="openEditModal(cat)"
                        class="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                        title="Edit"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <!-- Delete -->
                      <button
                        @click="handleDelete(cat)"
                        class="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Hapus"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="filteredCategories.length > perPage" class="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
            <AppPagination
              :current-page="currentPage"
              :total-items="filteredCategories.length"
              :per-page="perPage"
              @page-change="currentPage = $event"
            />
          </div>
        </div>

      <!-- ─── Modal Tambah/Edit ─────────────────────────── -->
      <AppModal
        :show="showModal"
        :title="modalMode === 'add' ? '+ Tambah Kategori' : '✏️ Edit Kategori'"
        @close="closeModal"
        size="sm"
      >
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Nama Kategori -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Nama Kategori <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.nama_kategori"
              type="text"
              placeholder="Contoh: Elektronik"
              maxlength="100"
              :class="['w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all',
                formErrors.nama_kategori
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20']"
            />
            <p v-if="formErrors.nama_kategori" class="mt-1 text-xs text-red-500">{{ formErrors.nama_kategori }}</p>
          </div>

          <!-- Deskripsi -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Deskripsi</label>
            <textarea
              v-model="form.deskripsi"
              rows="3"
              placeholder="Deskripsi kategori (opsional)..."
              class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            ></textarea>
          </div>
        </form>

        <template #footer>
          <button @click="closeModal" class="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
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

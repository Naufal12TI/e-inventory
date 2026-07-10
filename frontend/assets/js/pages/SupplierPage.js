/**
 * ============================================================
 * SupplierPage.js — Manajemen Supplier (/suppliers)
 * ============================================================
 */
import { defineComponent, ref, reactive, computed, onMounted, onActivated, watch } from 'vue';
import AppModal      from '../components/ui/AppModal.js';
import AppPagination from '../components/ui/AppPagination.js';
import AppEmptyState from '../components/ui/AppEmptyState.js';
import supplierService from '../services/supplierService.js';
import appStore      from '../stores/appStore.js';

export default defineComponent({
  name: 'SupplierPage',
  components: { AppModal, AppPagination, AppEmptyState },

  setup() {
    const suppliers   = ref([]);
    const loading     = ref(false);
    const searchQuery = ref('');
    const currentPage = ref(1);
    const perPage     = 10;

    const showModal = ref(false);
    const modalMode = ref('add');
    const isSaving  = ref(false);

    const form = reactive({ id: null, nama_supplier: '', alamat: '', telepon: '', email: '' });
    const formErrors = reactive({ nama_supplier: '', email: '' });

    const filteredSuppliers = computed(() => {
      if (!searchQuery.value) return suppliers.value;
      const q = searchQuery.value.toLowerCase();
      return suppliers.value.filter(s =>
        s.nama_supplier.toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q) ||
        (s.telepon || '').includes(q)
      );
    });

    const paginatedSuppliers = computed(() => {
      const start = (currentPage.value - 1) * perPage;
      return filteredSuppliers.value.slice(start, start + perPage);
    });

    watch(searchQuery, () => { currentPage.value = 1; });

    const loadSuppliers = async () => {
      loading.value = true;
      try {
        const res = await supplierService.getAll();
        if (res.status) suppliers.value = res.data;
      } catch { appStore.error('Gagal memuat supplier.'); }
      finally { loading.value = false; }
    };

    onMounted(loadSuppliers);
    onActivated(loadSuppliers); // Refresh data saat balik dari KeepAlive cache

    const resetForm = () => { form.id = null; form.nama_supplier = ''; form.alamat = ''; form.telepon = ''; form.email = ''; formErrors.nama_supplier = ''; formErrors.email = ''; };

    const openAddModal  = () => { modalMode.value = 'add';  resetForm(); showModal.value = true; };
    const openEditModal = (s)  => { modalMode.value = 'edit'; Object.assign(form, { id: s.id, nama_supplier: s.nama_supplier, alamat: s.alamat || '', telepon: s.telepon || '', email: s.email || '' }); formErrors.nama_supplier = ''; formErrors.email = ''; showModal.value = true; };
    const closeModal    = ()   => { showModal.value = false; };

    const validateForm = () => {
      formErrors.nama_supplier = ''; formErrors.email = '';
      let valid = true;
      if (!form.nama_supplier.trim()) { formErrors.nama_supplier = 'Nama supplier wajib diisi.'; valid = false; }
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { formErrors.email = 'Format email tidak valid.'; valid = false; }
      return valid;
    };

    const handleSubmit = async () => {
      if (!validateForm()) return;
      isSaving.value = true;
      const payload = { nama_supplier: form.nama_supplier, alamat: form.alamat, telepon: form.telepon, email: form.email };
      try {
        if (modalMode.value === 'add') {
          const res = await supplierService.create(payload);
          if (res.status) appStore.success('Supplier berhasil ditambahkan!');
        } else {
          const res = await supplierService.update(form.id, payload);
          if (res.status) appStore.success('Supplier berhasil diperbarui!');
        }
        closeModal();
        loadSuppliers();
      } catch (e) {
        appStore.error(e.response?.data?.message || 'Terjadi kesalahan.');
      } finally { isSaving.value = false; }
    };

    // ============================================================
    // Export ke Excel
    // ============================================================
    const isExporting = ref(false);

    const exportToExcel = async () => {
      if (!window.XLSX) {
        appStore.error('Library Excel belum dimuat. Refresh halaman dan coba lagi.');
        return;
      }

      const data = filteredSuppliers.value;
      if (!data.length) {
        appStore.error('Tidak ada data supplier untuk diekspor.');
        return;
      }

      isExporting.value = true;

      try {
        // Susun baris data
        const rows = data.map((s, i) => ({
          'No':            i + 1,
          'Nama Supplier': s.nama_supplier || '',
          'Telepon':       s.telepon       || '-',
          'Email':         s.email         || '-',
          'Alamat':        s.alamat        || '-',
        }));

        const ws = window.XLSX.utils.json_to_sheet(rows);

        // Auto lebar kolom
        ws['!cols'] = [
          { wch: 5  },  // No
          { wch: 30 },  // Nama Supplier
          { wch: 18 },  // Telepon
          { wch: 30 },  // Email
          { wch: 40 },  // Alamat
        ];

        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, 'Supplier');

        const now    = new Date();
        const tgl    = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
        const namaFile = `Data_Supplier_${tgl}.xlsx`;

        window.XLSX.writeFile(wb, namaFile);
        appStore.success(`${data.length} data supplier berhasil diekspor ke ${namaFile}`);
      } catch (e) {
        appStore.error('Gagal mengekspor data. Silakan coba lagi.');
        console.error(e);
      } finally {
        isExporting.value = false;
      }
    };

    const handleDelete = async (s) => {
      const result = await Swal.fire({
        title: 'Hapus Supplier?',
        html: `Supplier <strong>"${s.nama_supplier}"</strong> akan dihapus.`,
        icon: 'warning', showCancelButton: true,
        confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal', reverseButtons: true,
      });
      if (!result.isConfirmed) return;
      try {
        const res = await supplierService.delete(s.id);
        if (res.status) { suppliers.value = suppliers.value.filter(x => x.id !== s.id); appStore.success('Supplier berhasil dihapus!'); }
      } catch (e) { appStore.error(e.response?.data?.message || 'Gagal menghapus supplier.'); }
    };

    return {
      suppliers, filteredSuppliers, paginatedSuppliers,
      loading, searchQuery, currentPage, perPage,
      showModal, modalMode, isSaving, form, formErrors,
      openAddModal, openEditModal, closeModal, handleSubmit, handleDelete, loadSuppliers,
      isExporting, exportToExcel,
    };
  },

  template: `
    <div class="space-y-6 animate-fade-in">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Supplier</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              <span class="font-semibold text-blue-600 dark:text-blue-400">{{ filteredSuppliers.length }}</span> supplier ditemukan
            </p>
          </div>
          <div class="flex items-center gap-2">
            <!-- Tombol Export Excel -->
            <button
              @click="exportToExcel"
              :disabled="isExporting || !filteredSuppliers.length"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export data supplier ke file Excel"
            >
              <svg v-if="isExporting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <svg v-else class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              {{ isExporting ? 'Mengekspor...' : 'Export Excel' }}
            </button>

            <!-- Tombol Tambah Supplier -->
            <button @click="openAddModal" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 btn-ripple">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              Tambah Supplier
            </button>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <!-- Search -->
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div class="relative max-w-sm">
              <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input v-model="searchQuery" type="text" placeholder="Cari supplier..."
                class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"/>
            </div>
          </div>

          <div v-if="loading" class="p-6 space-y-4">
            <div v-for="i in 5" :key="i" class="skeleton h-14 w-full rounded-xl"></div>
          </div>

          <AppEmptyState v-else-if="!filteredSuppliers.length" :title="searchQuery ? 'Tidak Ditemukan' : 'Belum Ada Supplier'" :description="searchQuery ? 'Coba kata kunci lain.' : 'Tambah supplier pertama Anda.'" :icon="searchQuery ? 'search' : 'folder'" />

          <div v-else class="table-container">
            <table class="w-full">
              <thead class="bg-gray-50/80 dark:bg-gray-800/50">
                <tr>
                  <th class="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                  <th class="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama Supplier</th>
                  <th class="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Telepon</th>
                  <th class="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Email</th>
                  <th class="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell">Alamat</th>
                  <th class="text-center py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
                <tr v-for="(s, i) in paginatedSuppliers" :key="s.id" class="table-row-hover hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors">
                  <td class="py-4 px-6 text-sm text-gray-400">{{ (currentPage - 1) * perPage + i + 1 }}</td>
                  <td class="py-4 px-6">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span class="text-sm font-bold text-white">{{ s.nama_supplier.charAt(0) }}</span>
                      </div>
                      <div>
                        <p class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ s.nama_supplier }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="py-4 px-6 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">{{ s.telepon || '—' }}</td>
                  <td class="py-4 px-6 text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">{{ s.email || '—' }}</td>
                  <td class="py-4 px-6 text-sm text-gray-400 hidden xl:table-cell max-w-xs truncate">{{ s.alamat || '—' }}</td>
                  <td class="py-4 px-6">
                    <div class="flex items-center justify-center gap-2">
                      <button @click="openEditModal(s)" class="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors" title="Edit">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button @click="handleDelete(s)" class="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors" title="Hapus">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="filteredSuppliers.length > perPage" class="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
            <AppPagination :current-page="currentPage" :total-items="filteredSuppliers.length" :per-page="perPage" @page-change="currentPage = $event" />
          </div>
        </div>

      <!-- Modal -->
      <AppModal :show="showModal" :title="modalMode === 'add' ? '+ Tambah Supplier' : '✏️ Edit Supplier'" @close="closeModal" size="md">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Nama Supplier <span class="text-red-500">*</span></label>
            <input v-model="form.nama_supplier" type="text" placeholder="Nama perusahaan supplier" :class="['w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all', formErrors.nama_supplier ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20']"/>
            <p v-if="formErrors.nama_supplier" class="mt-1 text-xs text-red-500">{{ formErrors.nama_supplier }}</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Telepon</label>
              <input v-model="form.telepon" type="text" placeholder="08xxxxxxxxxx" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"/>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input v-model="form.email" type="email" placeholder="email@domain.com" :class="['w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all', formErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20']"/>
              <p v-if="formErrors.email" class="mt-1 text-xs text-red-500">{{ formErrors.email }}</p>
            </div>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Alamat</label>
            <textarea v-model="form.alamat" rows="3" placeholder="Alamat lengkap supplier..." class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"></textarea>
          </div>
        </form>
        <template #footer>
          <button @click="closeModal" class="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Batal</button>
          <button @click="handleSubmit" :disabled="isSaving" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold transition-colors btn-ripple">
            <svg v-if="isSaving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            {{ isSaving ? 'Menyimpan...' : (modalMode === 'add' ? 'Simpan' : 'Perbarui') }}
          </button>
        </template>
      </AppModal>
    </div>
  `,
});

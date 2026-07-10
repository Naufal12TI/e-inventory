/**
 * ============================================================
 * ItemPage.js — Manajemen Barang (/items)
 * ============================================================
 * Fitur: Search, Filter Kategori & Supplier,
 *        Sorting, CRUD lengkap, Kondisi badge.
 * ============================================================
 */
import { defineComponent, ref, reactive, computed, onMounted, onActivated, watch } from 'vue';
import AppModal      from '../components/ui/AppModal.js';
import AppBadge      from '../components/ui/AppBadge.js';
import AppPagination from '../components/ui/AppPagination.js';
import AppEmptyState from '../components/ui/AppEmptyState.js';
import itemService    from '../services/itemService.js';
import categoryService from '../services/categoryService.js';
import supplierService from '../services/supplierService.js';
import appStore      from '../stores/appStore.js';

export default defineComponent({
  name: 'ItemPage',
  components: { AppModal, AppBadge, AppPagination, AppEmptyState },

  setup() {
    const items       = ref([]);
    const categories  = ref([]);
    const suppliers   = ref([]);
    const loading     = ref(false);
    const currentPage = ref(1);
    const perPage     = 10;

    const filters = reactive({ search: '', kategori_id: '', supplier_id: '', kondisi: '', sort: 'i.created_at', order: 'DESC' });
    const showModal = ref(false);
    const modalMode = ref('add');
    const isSaving  = ref(false);

    const form = reactive({
      id: null, kode_barang: '', nama_barang: '', kategori_id: '', supplier_id: '',
      stok: 0, stok_minimum: 0, harga_beli: 0, harga_jual: 0, lokasi: '', kondisi: 'Baik',
    });
    const formErrors = reactive({});

    // ─── Pagination ───────────────────────────────────────────
    const paginatedItems = computed(() => {
      const start = (currentPage.value - 1) * perPage;
      return items.value.slice(start, start + perPage);
    });

    // ─── Format helpers ───────────────────────────────────────
    const formatCurrency = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);

    // ─── Load Data ────────────────────────────────────────────
    const loadItems = async () => {
      loading.value = true;
      try {
        const res = await itemService.getAll({
          search: filters.search, kategori_id: filters.kategori_id,
          supplier_id: filters.supplier_id, kondisi: filters.kondisi,
          sort: filters.sort, order: filters.order,
        });
        if (res.status) { items.value = res.data; currentPage.value = 1; }
      } catch { appStore.error('Gagal memuat data barang.'); }
      finally { loading.value = false; }
    };

    const loadDropdowns = async () => {
      const [catRes, supRes] = await Promise.all([categoryService.getAll(), supplierService.getAll()]);
      if (catRes.status) categories.value = catRes.data;
      if (supRes.status) suppliers.value  = supRes.data;
    };

    onMounted(() => { loadItems(); loadDropdowns(); });
    onActivated(loadItems); // Refresh data saat balik dari KeepAlive cache

    // Debounce search
    let searchTimer;
    watch(() => filters.search, () => { clearTimeout(searchTimer); searchTimer = setTimeout(loadItems, 400); });
    watch([() => filters.kategori_id, () => filters.supplier_id, () => filters.kondisi, () => filters.sort, () => filters.order], loadItems);

    // ─── Sorting ──────────────────────────────────────────────
    const setSort = (field) => {
      if (filters.sort === field) {
        filters.order = filters.order === 'ASC' ? 'DESC' : 'ASC';
      } else {
        filters.sort  = field;
        filters.order = 'ASC';
      }
    };

    // ─── Modal ───────────────────────────────────────────────
    const resetForm = () => {
      Object.assign(form, { id: null, kode_barang: '', nama_barang: '', kategori_id: '', supplier_id: '', stok: 0, stok_minimum: 0, harga_beli: 0, harga_jual: 0, lokasi: '', kondisi: 'Baik' });
      Object.keys(formErrors).forEach(k => delete formErrors[k]);
    };

    const openAddModal = () => { modalMode.value = 'add'; resetForm(); showModal.value = true; };
    const openEditModal = (item) => {
      modalMode.value = 'edit';
      Object.assign(form, {
        id: item.id, kode_barang: item.kode_barang, nama_barang: item.nama_barang,
        kategori_id: item.kategori_id, supplier_id: item.supplier_id,
        stok: item.stok, stok_minimum: item.stok_minimum,
        harga_beli: item.harga_beli, harga_jual: item.harga_jual,
        lokasi: item.lokasi || '', kondisi: item.kondisi,
      });
      Object.keys(formErrors).forEach(k => delete formErrors[k]);
      showModal.value = true;
    };
    const closeModal = () => { showModal.value = false; };

    const handleSubmit = async () => {
      Object.keys(formErrors).forEach(k => delete formErrors[k]);
      isSaving.value = true;
      const payload = {
        kode_barang: form.kode_barang, nama_barang: form.nama_barang,
        kategori_id: form.kategori_id, supplier_id: form.supplier_id,
        stok: Number(form.stok), stok_minimum: Number(form.stok_minimum),
        harga_beli: Number(form.harga_beli), harga_jual: Number(form.harga_jual),
        lokasi: form.lokasi, kondisi: form.kondisi,
      };
      try {
        if (modalMode.value === 'add') {
          const res = await itemService.create(payload);
          if (res.status) appStore.success('Barang berhasil ditambahkan!');
        } else {
          const res = await itemService.update(form.id, payload);
          if (res.status) appStore.success('Barang berhasil diperbarui!');
        }
        closeModal();
        loadItems();
      } catch (e) {
        const err = e.response?.data?.data;
        if (err && typeof err === 'object') {
          Object.assign(formErrors, err);
        } else {
          appStore.error(e.response?.data?.message || 'Terjadi kesalahan.');
        }
      } finally { isSaving.value = false; }
    };

    const handleDelete = async (item) => {
      const result = await Swal.fire({
        title: 'Hapus Barang?',
        html: `Barang <strong>"${item.nama_barang}"</strong> beserta riwayat stoknya akan dihapus.`,
        icon: 'warning', showCancelButton: true,
        confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal', reverseButtons: true,
      });
      if (!result.isConfirmed) return;
      try {
        await itemService.delete(item.id);
        appStore.success('Barang berhasil dihapus!');
        loadItems();
      } catch (e) { appStore.error(e.response?.data?.message || 'Gagal menghapus barang.'); }
    };

    const resetFilters = () => { Object.assign(filters, { search: '', kategori_id: '', supplier_id: '', kondisi: '', sort: 'i.created_at', order: 'DESC' }); };

    const handleExport = async () => {
      try {
        const response = await itemService.exportExcel(filters);
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `data_barang_${new Date().toISOString().slice(0, 10)}.xls`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
        appStore.error('Gagal mengekspor data barang.');
      }
    };

    return {
      items, paginatedItems, categories, suppliers,
      loading, filters, currentPage, perPage,
      showModal, modalMode, isSaving, form, formErrors,
      openAddModal, openEditModal, closeModal,
      handleSubmit, handleDelete, setSort, resetFilters, formatCurrency,
      handleExport,
    };
  },

  template: `
    <div class="space-y-6 animate-fade-in">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Barang</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              <span class="font-semibold text-blue-600">{{ items.length }}</span> barang ditemukan
            </p>
          </div>
          <div class="flex gap-2">
            <button @click="handleExport" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm shadow-sm transition-all">
              <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              Export Excel
            </button>
            <button @click="openAddModal" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 btn-ripple transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              Tambah Barang
            </button>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
          <div class="flex flex-wrap gap-3">
            <!-- Search -->
            <div class="relative flex-1 min-w-48">
              <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input v-model="filters.search" type="text" placeholder="Cari kode atau nama barang..."
                class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"/>
            </div>
            <!-- Filter Kategori -->
            <select v-model="filters.kategori_id" class="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all min-w-40">
              <option value="">Semua Kategori</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.nama_kategori }}</option>
            </select>
            <!-- Filter Supplier -->
            <select v-model="filters.supplier_id" class="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all min-w-40">
              <option value="">Semua Supplier</option>
              <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.nama_supplier }}</option>
            </select>
            <!-- Filter Kondisi -->
            <select v-model="filters.kondisi" class="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
              <option value="">Semua Kondisi</option>
              <option>Baik</option>
              <option>Rusak Ringan</option>
              <option>Rusak Berat</option>
            </select>
            <!-- Reset Filter -->
            <button @click="resetFilters" class="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              Reset
            </button>
          </div>
        </div>

        <!-- Table -->
        <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div v-if="loading" class="p-6 space-y-4">
            <div v-for="i in 6" :key="i" class="skeleton h-14 w-full rounded-xl"></div>
          </div>
          <AppEmptyState v-else-if="!items.length" title="Tidak Ada Barang" :description="filters.search || filters.kategori_id || filters.supplier_id ? 'Coba ubah filter pencarian.' : 'Tambah barang pertama Anda.'" :icon="filters.search ? 'search' : 'box'" />

          <div v-else class="table-container">
            <table class="w-full">
              <thead class="bg-gray-50/80 dark:bg-gray-800/50">
                <tr>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                  <th @click="setSort('i.kode_barang')" class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none">
                    Kode <span v-if="filters.sort === 'i.kode_barang'">{{ filters.order === 'ASC' ? '↑' : '↓' }}</span>
                  </th>
                  <th @click="setSort('i.nama_barang')" class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none">
                    Nama Barang <span v-if="filters.sort === 'i.nama_barang'">{{ filters.order === 'ASC' ? '↑' : '↓' }}</span>
                  </th>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Kategori</th>
                  <th @click="setSort('i.stok')" class="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none">
                    Stok <span v-if="filters.sort === 'i.stok'">{{ filters.order === 'ASC' ? '↑' : '↓' }}</span>
                  </th>
                  <th @click="setSort('i.harga_jual')" class="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell cursor-pointer hover:text-gray-700 select-none">
                    Harga Jual <span v-if="filters.sort === 'i.harga_jual'">{{ filters.order === 'ASC' ? '↑' : '↓' }}</span>
                  </th>
                  <th class="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Kondisi</th>
                  <th class="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
                <tr v-for="(item, i) in paginatedItems" :key="item.id"
                  :class="['table-row-hover hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors', item.stok <= item.stok_minimum ? 'bg-red-50/30 dark:bg-red-950/10' : '']">
                  <td class="py-3 px-4 text-sm text-gray-400">{{ (currentPage - 1) * perPage + i + 1 }}</td>
                  <td class="py-3 px-4">
                    <span class="font-mono text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-lg">{{ item.kode_barang }}</span>
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center flex-shrink-0">
                        <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                      </div>
                      <div>
                        <p class="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight">{{ item.nama_barang }}</p>
                        <p class="text-xs text-gray-400">{{ item.nama_supplier }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-4 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">{{ item.nama_kategori }}</td>
                  <td class="py-3 px-4 text-right">
                    <span :class="['font-bold text-sm', item.stok === 0 ? 'text-red-600 dark:text-red-400' : item.stok <= item.stok_minimum ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-gray-100']">
                      {{ item.stok }}
                    </span>
                    <p class="text-[10px] text-gray-400">min: {{ item.stok_minimum }}</p>
                  </td>
                  <td class="py-3 px-4 text-right text-sm text-gray-600 dark:text-gray-400 hidden lg:table-cell whitespace-nowrap">{{ formatCurrency(item.harga_jual) }}</td>
                  <td class="py-3 px-4 text-center hidden sm:table-cell">
                    <AppBadge :value="item.kondisi" />
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center justify-center gap-1.5">
                      <button @click="openEditModal(item)" class="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors" title="Edit">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button @click="handleDelete(item)" class="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors" title="Hapus">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="items.length > perPage" class="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
            <AppPagination :current-page="currentPage" :total-items="items.length" :per-page="perPage" @page-change="currentPage = $event" />
          </div>
        </div>

      <!-- Modal Barang -->
      <AppModal :show="showModal" :title="modalMode === 'add' ? '+ Tambah Barang' : '✏️ Edit Barang'" @close="closeModal" size="lg">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Kode Barang</label>
              <input v-model="form.kode_barang" type="text" placeholder="Auto-generate jika kosong" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"/>
              <p v-if="formErrors.kode_barang" class="mt-1 text-xs text-red-500">{{ formErrors.kode_barang }}</p>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Kondisi <span class="text-red-500">*</span></label>
              <select v-model="form.kondisi" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                <option>Baik</option><option>Rusak Ringan</option><option>Rusak Berat</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Nama Barang <span class="text-red-500">*</span></label>
            <input v-model="form.nama_barang" type="text" placeholder="Nama lengkap barang" :class="['w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all', formErrors.nama_barang ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20']"/>
            <p v-if="formErrors.nama_barang" class="mt-1 text-xs text-red-500">{{ formErrors.nama_barang }}</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Kategori <span class="text-red-500">*</span></label>
              <select v-model="form.kategori_id" :class="['w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all', formErrors.kategori_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20']">
                <option value="">-- Pilih Kategori --</option>
                <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.nama_kategori }}</option>
              </select>
              <p v-if="formErrors.kategori_id" class="mt-1 text-xs text-red-500">{{ formErrors.kategori_id }}</p>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Supplier <span class="text-red-500">*</span></label>
              <select v-model="form.supplier_id" :class="['w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all', formErrors.supplier_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20']">
                <option value="">-- Pilih Supplier --</option>
                <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.nama_supplier }}</option>
              </select>
              <p v-if="formErrors.supplier_id" class="mt-1 text-xs text-red-500">{{ formErrors.supplier_id }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Stok <span class="text-red-500">*</span></label>
              <input v-model.number="form.stok" type="number" min="0" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"/>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Stok Minimum <span class="text-red-500">*</span></label>
              <input v-model.number="form.stok_minimum" type="number" min="0" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"/>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Harga Beli <span class="text-red-500">*</span></label>
              <input v-model.number="form.harga_beli" type="number" min="0" step="1000" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"/>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Harga Jual <span class="text-red-500">*</span></label>
              <input v-model.number="form.harga_jual" type="number" min="0" step="1000" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"/>
            </div>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Lokasi Penyimpanan</label>
            <input v-model="form.lokasi" type="text" placeholder="Contoh: Gudang A - Rak 3" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"/>
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

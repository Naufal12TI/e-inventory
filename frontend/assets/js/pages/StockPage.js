/**
 * ============================================================
 * StockPage.js — Riwayat Stok (/stocks)
 * ============================================================
 * Fitur: Tambah Masuk/Keluar stok, Filter, Riwayat lengkap,
 *        Auto-update stok barang, Rollback saat hapus.
 * ============================================================
 */
import { defineComponent, ref, reactive, computed, onMounted, onActivated, watch } from 'vue';
import AppModal     from '../components/ui/AppModal.js';
import AppBadge     from '../components/ui/AppBadge.js';
import AppPagination from '../components/ui/AppPagination.js';
import AppEmptyState from '../components/ui/AppEmptyState.js';
import stockHistoryService from '../services/stockHistoryService.js';
import itemService  from '../services/itemService.js';
import appStore     from '../stores/appStore.js';

export default defineComponent({
  name: 'StockPage',
  components: { AppModal, AppBadge, AppPagination, AppEmptyState },

  setup() {
    const histories   = ref([]);
    const items       = ref([]);
    const loading     = ref(false);
    const currentPage = ref(1);
    const perPage     = 10;

    const filters = reactive({ search: '', jenis: '', barang_id: '', dari: '', sampai: '' });
    const showModal = ref(false);
    const isSaving  = ref(false);

    const form = reactive({ barang_id: '', jenis: 'Masuk', jumlah: 1, keterangan: '', tanggal: new Date().toISOString().split('T')[0] });
    const formErrors = reactive({});

    const selectedItem = computed(() => items.value.find(i => i.id == form.barang_id) || null);

    const paginatedHistories = computed(() => {
      const start = (currentPage.value - 1) * perPage;
      return histories.value.slice(start, start + perPage);
    });

    const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const formatCurrency = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);

    const loadHistories = async () => {
      loading.value = true;
      try {
        const res = await stockHistoryService.getAll({
          search: filters.search, jenis: filters.jenis,
          barang_id: filters.barang_id, dari: filters.dari, sampai: filters.sampai,
        });
        if (res.status) { histories.value = res.data; currentPage.value = 1; }
      } catch { appStore.error('Gagal memuat riwayat stok.'); }
      finally { loading.value = false; }
    };

    const loadItems = async () => {
      const res = await itemService.getAll();
      if (res.status) items.value = res.data;
    };

    onMounted(() => { loadHistories(); loadItems(); });
    onActivated(loadHistories); // Refresh data saat balik dari KeepAlive cache

    let searchTimer;
    watch(() => filters.search, () => { clearTimeout(searchTimer); searchTimer = setTimeout(loadHistories, 400); });
    watch([() => filters.jenis, () => filters.barang_id, () => filters.dari, () => filters.sampai], loadHistories);

    const openAddModal = (defaultJenis = 'Masuk') => {
      Object.assign(form, { barang_id: '', jenis: defaultJenis, jumlah: 1, keterangan: '', tanggal: new Date().toISOString().split('T')[0] });
      Object.keys(formErrors).forEach(k => delete formErrors[k]);
      showModal.value = true;
    };

    const closeModal = () => { showModal.value = false; };

    const handleSubmit = async () => {
      Object.keys(formErrors).forEach(k => delete formErrors[k]);

      if (!form.barang_id) { formErrors.barang_id = 'Pilih barang terlebih dahulu.'; return; }
      if (!form.jumlah || form.jumlah < 1) { formErrors.jumlah = 'Jumlah minimal 1.'; return; }
      if (!form.tanggal) { formErrors.tanggal = 'Tanggal wajib diisi.'; return; }

      isSaving.value = true;
      try {
        const res = await stockHistoryService.create({
          barang_id: form.barang_id, jenis: form.jenis,
          jumlah: Number(form.jumlah), keterangan: form.keterangan, tanggal: form.tanggal,
        });
        if (res.status) {
          appStore.success(res.message || `Stok ${form.jenis} berhasil dicatat!`);
          closeModal();
          loadHistories();
          loadItems(); // Refresh stok barang
        }
      } catch (e) {
        const msg = e.response?.data?.message || 'Terjadi kesalahan.';
        if (typeof msg === 'object') Object.assign(formErrors, msg);
        else appStore.error(msg);
      } finally { isSaving.value = false; }
    };

    const handleDelete = async (h) => {
      const result = await Swal.fire({
        title: 'Hapus Riwayat?',
        html: `Riwayat stok <strong>${h.jenis} ${h.jumlah} unit "${h.nama_barang}"</strong> akan dihapus.<br/><br/><small class="text-amber-600">⚠️ Stok barang akan di-rollback secara otomatis.</small>`,
        icon: 'warning', showCancelButton: true,
        confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal', reverseButtons: true,
      });
      if (!result.isConfirmed) return;
      try {
        const res = await stockHistoryService.delete(h.id);
        if (res.status) { appStore.success('Riwayat dihapus & stok di-rollback!'); loadHistories(); loadItems(); }
      } catch (e) { appStore.error(e.response?.data?.message || 'Gagal menghapus.'); }
    };

    const resetFilters = () => { Object.assign(filters, { search: '', jenis: '', barang_id: '', dari: '', sampai: '' }); };

    // Statistik ringkasan
    const totalMasuk  = computed(() => histories.value.filter(h => h.jenis === 'Masuk').reduce((a, b) => a + Number(b.jumlah), 0));
    const totalKeluar = computed(() => histories.value.filter(h => h.jenis === 'Keluar').reduce((a, b) => a + Number(b.jumlah), 0));

    const handleExport = async () => {
      try {
        const response = await stockHistoryService.exportExcel(filters);
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `riwayat_stok_${new Date().toISOString().slice(0, 10)}.xls`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
        appStore.error('Gagal mengekspor riwayat stok.');
      }
    };

    return {
      histories, paginatedHistories, items, loading,
      filters, currentPage, perPage,
      showModal, isSaving, form, formErrors,
      selectedItem, totalMasuk, totalKeluar,
      openAddModal, closeModal, handleSubmit, handleDelete, resetFilters,
      formatDate, formatCurrency, loadHistories, handleExport,
    };
  },

  template: `
    <div class="space-y-6 animate-fade-in">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Riwayat Stok</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              <span class="font-semibold text-blue-600">{{ histories.length }}</span> riwayat ditemukan
            </p>
          </div>
          <div class="flex gap-2">
            <button @click="handleExport" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm shadow-sm transition-all">
              <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              Export Excel
            </button>
            <button @click="openAddModal('Masuk')" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 btn-ripple transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              Stok Masuk
            </button>
            <button @click="openAddModal('Keluar')" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow-md shadow-orange-500/20 btn-ripple transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
              Stok Keluar
            </button>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Transaksi</p>
            <p class="text-3xl font-black text-gray-900 dark:text-white">{{ histories.length }}</p>
          </div>
          <div class="bg-white dark:bg-gray-900 rounded-2xl border border-blue-100 dark:border-blue-900/50 shadow-sm p-5">
            <p class="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-2">Total Masuk</p>
            <p class="text-3xl font-black text-blue-600 dark:text-blue-400">+{{ totalMasuk.toLocaleString('id-ID') }}</p>
          </div>
          <div class="bg-white dark:bg-gray-900 rounded-2xl border border-orange-100 dark:border-orange-900/50 shadow-sm p-5">
            <p class="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-2">Total Keluar</p>
            <p class="text-3xl font-black text-orange-500 dark:text-orange-400">-{{ totalKeluar.toLocaleString('id-ID') }}</p>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
          <div class="flex flex-wrap gap-3">
            <div class="relative flex-1 min-w-48">
              <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input v-model="filters.search" type="text" placeholder="Cari nama barang..." class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"/>
            </div>
            <select v-model="filters.jenis" class="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
              <option value="">Semua Jenis</option><option>Masuk</option><option>Keluar</option>
            </select>
            <select v-model="filters.barang_id" class="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all min-w-40">
              <option value="">Semua Barang</option>
              <option v-for="i in items" :key="i.id" :value="i.id">{{ i.nama_barang }}</option>
            </select>
            <div class="flex items-center gap-2">
              <input v-model="filters.dari" type="date" class="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"/>
              <span class="text-gray-400 text-sm">s/d</span>
              <input v-model="filters.sampai" type="date" class="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"/>
            </div>
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
          <AppEmptyState v-else-if="!histories.length" title="Belum Ada Riwayat Stok" description="Tambah pergerakan stok masuk atau keluar." icon="box" />
          <div v-else class="table-container">
            <table class="w-full">
              <thead class="bg-gray-50/80 dark:bg-gray-800/50">
                <tr>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Barang</th>
                  <th class="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Jenis</th>
                  <th class="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Jumlah</th>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Keterangan</th>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Tanggal</th>
                  <th class="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
                <tr v-for="(h, i) in paginatedHistories" :key="h.id" class="table-row-hover hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors">
                  <td class="py-3 px-4 text-sm text-gray-400">{{ (currentPage - 1) * perPage + i + 1 }}</td>
                  <td class="py-3 px-4">
                    <p class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ h.nama_barang }}</p>
                    <p class="text-xs text-gray-400 font-mono">{{ h.kode_barang }}</p>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <AppBadge :value="h.jenis" />
                  </td>
                  <td class="py-3 px-4 text-right">
                    <span :class="['font-bold text-base', h.jenis === 'Masuk' ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400']">
                      {{ h.jenis === 'Masuk' ? '+' : '-' }}{{ h.jumlah }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell max-w-xs truncate">{{ h.keterangan || '—' }}</td>
                  <td class="py-3 px-4 text-sm text-gray-400 hidden lg:table-cell whitespace-nowrap">{{ formatDate(h.tanggal) }}</td>
                  <td class="py-3 px-4 text-center">
                    <button @click="handleDelete(h)" class="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors" title="Hapus & Rollback">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="histories.length > perPage" class="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
            <AppPagination :current-page="currentPage" :total-items="histories.length" :per-page="perPage" @page-change="currentPage = $event" />
          </div>
        </div>
      </div>

      <!-- Modal Tambah Stok -->
      <AppModal :show="showModal" :title="form.jenis === 'Masuk' ? '📥 Tambah Stok Masuk' : '📤 Tambah Stok Keluar'" @close="closeModal" size="md">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Jenis -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Jenis Pergerakan <span class="text-red-500">*</span></label>
            <div class="grid grid-cols-2 gap-3">
              <button type="button" @click="form.jenis = 'Masuk'" :class="['py-2.5 rounded-xl border-2 text-sm font-semibold transition-all', form.jenis === 'Masuk' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300']">
                📥 Masuk
              </button>
              <button type="button" @click="form.jenis = 'Keluar'" :class="['py-2.5 rounded-xl border-2 text-sm font-semibold transition-all', form.jenis === 'Keluar' ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300']">
                📤 Keluar
              </button>
            </div>
          </div>

          <!-- Pilih Barang -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Barang <span class="text-red-500">*</span></label>
            <select v-model="form.barang_id" :class="['w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all', formErrors.barang_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20']">
              <option value="">-- Pilih Barang --</option>
              <option v-for="item in items" :key="item.id" :value="item.id">{{ item.nama_barang }} (Stok: {{ item.stok }})</option>
            </select>
            <p v-if="formErrors.barang_id" class="mt-1 text-xs text-red-500">{{ formErrors.barang_id }}</p>

            <!-- Info stok barang terpilih -->
            <div v-if="selectedItem" class="mt-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
              <p class="text-xs text-blue-700 dark:text-blue-400">
                Stok saat ini: <strong>{{ selectedItem.stok }}</strong> unit
                <span v-if="form.jenis === 'Keluar' && Number(form.jumlah) > selectedItem.stok" class="text-red-500 ml-2">⚠️ Melebihi stok!</span>
              </p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Jumlah -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Jumlah <span class="text-red-500">*</span></label>
              <input v-model.number="form.jumlah" type="number" min="1" :class="['w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all', formErrors.jumlah ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20']"/>
              <p v-if="formErrors.jumlah" class="mt-1 text-xs text-red-500">{{ formErrors.jumlah }}</p>
            </div>
            <!-- Tanggal -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Tanggal <span class="text-red-500">*</span></label>
              <input v-model="form.tanggal" type="date" :class="['w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all', formErrors.tanggal ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20']"/>
              <p v-if="formErrors.tanggal" class="mt-1 text-xs text-red-500">{{ formErrors.tanggal }}</p>
            </div>
          </div>

          <!-- Keterangan -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Keterangan</label>
            <textarea v-model="form.keterangan" rows="2" placeholder="Catatan pergerakan stok (opsional)..." class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"></textarea>
          </div>
        </form>
        <template #footer>
          <button @click="closeModal" class="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Batal</button>
          <button @click="handleSubmit" :disabled="isSaving" :class="['inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors btn-ripple', form.jenis === 'Masuk' ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400' : 'bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400']">
            <svg v-if="isSaving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            {{ isSaving ? 'Menyimpan...' : 'Simpan Pergerakan Stok' }}
          </button>
        </template>
      </AppModal>

    </div>
  `,
});

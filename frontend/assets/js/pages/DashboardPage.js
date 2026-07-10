/**
 * ============================================================
 * DashboardPage.js — Halaman Dashboard (/dashboard)
 * ============================================================
 * Dashboard admin dengan:
 * - Summary cards (total barang, supplier, dsb.)
 * - Chart stok masuk/keluar per bulan (Chart.js)
 * - Low Stock Alert
 * - Aktivitas terakhir
 * ============================================================
 */
import { defineComponent, ref, onMounted, onActivated, computed, watch } from 'vue';
import AppBadge    from '../components/ui/AppBadge.js';
import dashboardService from '../services/dashboardService.js';
import authStore   from '../stores/authStore.js';
import appStore    from '../stores/appStore.js';

export default defineComponent({
  name: 'DashboardPage',
  components: { AppBadge },

  setup() {
    // ─── State ──────────────────────────────────────────────
    const stats       = ref(null);
    const chartData   = ref([]);
    const lowStock    = ref([]);
    const activities  = ref([]);
    const loading     = ref(true);
    let chartInstance = null;

    // ─── Format Currency ─────────────────────────────────────
    const formatCurrency = (val) =>
      new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    const formatDate = (d) =>
      new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    // ─── Load Data ────────────────────────────────────────────
    const loadData = async () => {
      loading.value = true;
      try {
        const [statsRes, chartRes, lowRes, actRes] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getChartData(),
          dashboardService.getLowStock(),
          dashboardService.getRecentActivities(8),
        ]);

        if (statsRes.status)  stats.value      = statsRes.data;
        if (chartRes.status)  chartData.value  = chartRes.data;
        if (lowRes.status)    lowStock.value   = lowRes.data;
        if (actRes.status)    activities.value = actRes.data;
      } catch (e) {
        appStore.error('Gagal memuat data dashboard.');
      } finally {
        loading.value = false;
        // Render chart setelah data tersedia
        setTimeout(renderChart, 100);
      }
    };

    // ─── Render Chart.js ─────────────────────────────────────
    const renderChart = () => {
      const canvas = document.getElementById('stockChart');
      if (!canvas || !chartData.value.length) return;

      // Destroy chart lama jika ada
      if (chartInstance) { chartInstance.destroy(); chartInstance = null; }

      const labels   = chartData.value.map(d => d.label);
      const masuk    = chartData.value.map(d => parseInt(d.total_masuk));
      const keluar   = chartData.value.map(d => parseInt(d.total_keluar));

      const isDark = appStore.isDarkMode;
      const gridColor  = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
      const textColor  = isDark ? '#94a3b8' : '#64748b';

      chartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Masuk',
              data: masuk,
              backgroundColor: 'rgba(59, 130, 246, 0.8)',
              borderRadius: 6,
              borderSkipped: false,
            },
            {
              label: 'Keluar',
              data: keluar,
              backgroundColor: 'rgba(249, 115, 22, 0.8)',
              borderRadius: 6,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: { color: textColor, font: { family: 'Inter', size: 12 }, usePointStyle: true },
            },
          },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: textColor, font: { family: 'Inter', size: 11 } },
            },
            y: {
              grid: { color: gridColor },
              ticks: { color: textColor, font: { family: 'Inter', size: 11 } },
              beginAtZero: true,
            },
          },
        },
      });
    };

    onMounted(loadData);

    // Re-render chart saat kembali ke halaman (KeepAlive activated)
    onActivated(() => setTimeout(renderChart, 100));

    // Re-render chart saat dark mode berubah
    watch(() => appStore.isDarkMode, () => setTimeout(renderChart, 200));

    // ─── Summary Cards Config ─────────────────────────────────
    const summaryCards = computed(() => [
      {
        label: 'Total Barang',
        value: stats.value?.total_barang ?? 0,
        icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`,
        gradient: 'from-blue-500 to-blue-600',
        bg: 'bg-blue-50 dark:bg-blue-950/40',
        text: 'text-blue-600 dark:text-blue-400',
      },
      {
        label: 'Kategori',
        value: stats.value?.total_kategori ?? 0,
        icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>`,
        gradient: 'from-purple-500 to-purple-600',
        bg: 'bg-purple-50 dark:bg-purple-950/40',
        text: 'text-purple-600 dark:text-purple-400',
      },
      {
        label: 'Supplier',
        value: stats.value?.total_supplier ?? 0,
        icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`,
        gradient: 'from-emerald-500 to-emerald-600',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-600 dark:text-emerald-400',
      },
      {
        label: 'Barang Masuk',
        value: stats.value?.total_masuk ?? 0,
        icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m-8-8h16"/></svg>`,
        gradient: 'from-cyan-500 to-cyan-600',
        bg: 'bg-cyan-50 dark:bg-cyan-950/40',
        text: 'text-cyan-600 dark:text-cyan-400',
      },
      {
        label: 'Barang Keluar',
        value: stats.value?.total_keluar ?? 0,
        icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>`,
        gradient: 'from-orange-500 to-orange-600',
        bg: 'bg-orange-50 dark:bg-orange-950/40',
        text: 'text-orange-600 dark:text-orange-400',
      },
      {
        label: 'Stok Rendah',
        value: stats.value?.low_stock_count ?? 0,
        icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
        gradient: 'from-red-500 to-red-600',
        bg: 'bg-red-50 dark:bg-red-950/40',
        text: 'text-red-600 dark:text-red-400',
      },
    ]);

    return {
      stats, chartData, lowStock, activities,
      loading, summaryCards,
      formatCurrency, formatDate,
      loadData, authStore,
    };
  },

  template: `
    <div class="space-y-6 animate-fade-in">

        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Selamat datang kembali, <span class="font-semibold text-blue-600 dark:text-blue-400">{{ authStore.userName }}</span>!
            </p>
          </div>
          <button
            @click="loadData"
            class="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-500"
            title="Refresh Data"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </div>

        <!-- ─── Summary Cards ─────────────────────────────── -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div
            v-for="(card, i) in summaryCards"
            :key="i"
            :class="['card-hover rounded-2xl p-5 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm', i === 5 && stats?.low_stock_count > 0 ? 'ring-2 ring-red-300 dark:ring-red-800' : '']"
          >
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center mb-3', card.bg]">
              <span :class="card.text" v-html="card.icon"></span>
            </div>
            <p class="text-2xl font-black text-gray-900 dark:text-white leading-none mb-1">
              <span v-if="loading" class="skeleton w-12 h-6 block"></span>
              <span v-else>{{ card.value.toLocaleString('id-ID') }}</span>
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 font-medium leading-tight">{{ card.label }}</p>
          </div>
        </div>

        <!-- ─── Main Content Grid ──────────────────────────── -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- Chart Stok Masuk/Keluar -->
          <div class="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="font-bold text-gray-900 dark:text-white">Grafik Pergerakan Stok</h2>
                <p class="text-xs text-gray-400 mt-0.5">12 bulan terakhir</p>
              </div>
              <div class="flex items-center gap-3 text-xs text-gray-500">
                <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-blue-500 block"></span>Masuk</span>
                <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-orange-500 block"></span>Keluar</span>
              </div>
            </div>
            <div class="relative h-64">
              <div v-if="loading || !chartData.length" class="absolute inset-0 flex items-center justify-center">
                <div v-if="loading" class="text-center">
                  <svg class="animate-spin w-8 h-8 text-blue-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <p class="text-sm text-gray-400">Memuat chart...</p>
                </div>
                <div v-else class="text-center">
                  <p class="text-sm text-gray-400">Belum ada data pergerakan stok.</p>
                </div>
              </div>
              <canvas id="stockChart" class="w-full h-full"></canvas>
            </div>
          </div>

          <!-- Low Stock Alert -->
          <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
            <div class="flex items-center gap-2 mb-5">
              <div class="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 flex items-center justify-center">
                <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <div>
                <h2 class="font-bold text-gray-900 dark:text-white text-sm">Low Stock Alert</h2>
                <p class="text-xs text-gray-400">Barang stok rendah</p>
              </div>
              <span v-if="!loading" class="ml-auto text-xs bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-semibold">
                {{ lowStock.length }}
              </span>
            </div>

            <div v-if="loading" class="space-y-3">
              <div v-for="i in 4" :key="i" class="skeleton h-12 w-full rounded-xl"></div>
            </div>
            <div v-else-if="!lowStock.length" class="text-center py-8">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 mx-auto mb-3 flex items-center justify-center">
                <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Semua stok aman!</p>
              <p class="text-xs text-gray-400 mt-1">Tidak ada barang dengan stok rendah.</p>
            </div>
            <div v-else class="space-y-2 max-h-64 overflow-y-auto pr-1">
              <div
                v-for="item in lowStock"
                :key="item.id"
                class="flex items-center justify-between p-3 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50"
              >
                <div class="overflow-hidden">
                  <p class="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{{ item.nama_barang }}</p>
                  <p class="text-[10px] text-gray-400">Min: {{ item.stok_minimum }}</p>
                </div>
                <span :class="['text-xs font-bold px-2 py-1 rounded-lg ml-2 flex-shrink-0', item.stok === 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400']">
                  {{ item.stok }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- ─── Aktivitas Terakhir ─────────────────────────── -->
        <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <h2 class="font-bold text-gray-900 dark:text-white mb-5">Aktivitas Stok Terakhir</h2>

          <div v-if="loading" class="space-y-3">
            <div v-for="i in 5" :key="i" class="skeleton h-12 w-full rounded-xl"></div>
          </div>
          <div v-else-if="!activities.length" class="text-center py-8 text-gray-400 text-sm">
            Belum ada aktivitas stok.
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-100 dark:border-gray-800">
                  <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Barang</th>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Jenis</th>
                  <th class="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Jumlah</th>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tanggal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
                <tr v-for="act in activities" :key="act.id" class="table-row-hover hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td class="py-3 px-4">
                    <p class="font-medium text-gray-900 dark:text-gray-100">{{ act.nama_barang }}</p>
                    <p class="text-xs text-gray-400">{{ act.kode_barang }}</p>
                  </td>
                  <td class="py-3 px-4">
                    <AppBadge :value="act.jenis" />
                  </td>
                  <td class="py-3 px-4 text-right font-bold text-gray-900 dark:text-gray-100">
                    {{ act.jenis === 'Masuk' ? '+' : '-' }}{{ act.jumlah }}
                  </td>
                  <td class="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">{{ formatDate(act.tanggal) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

    </div>
  `,
});

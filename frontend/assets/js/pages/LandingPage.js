/**
 * ============================================================
 * LandingPage.js — Halaman Publik (/)
 * ============================================================
 * Halaman landing yang menarik dengan:
 * - Hero section dengan animasi
 * - Statistik ringkasan (dari API publik)
 * - Keunggulan aplikasi
 * - Footer
 * ============================================================
 */
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import dashboardService from '../services/dashboardService.js';
import authStore from '../stores/authStore.js';

export default defineComponent({
  name: 'LandingPage',

  setup() {
    const router = useRouter();
    const stats = ref({ total_barang: 0, total_kategori: 0, total_supplier: 0, total_masuk: 0, total_keluar: 0 });
    const loading = ref(true);

    onMounted(async () => {
      try {
        const res = await dashboardService.getStats();
        if (res.status) stats.value = res.data;
      } catch (e) {
        // Tampilkan 0 jika API tidak tersedia
      } finally {
        loading.value = false;
      }
    });

    const goToDashboard = () => {
      if (authStore.authenticated) {
        router.push({ name: 'dashboard' });
      } else {
        router.push({ name: 'login' });
      }
    };

    const features = [
      { icon: '📦', title: 'Manajemen Barang', desc: 'Kelola seluruh inventaris dengan mudah, lengkap dengan kode barang, lokasi, dan kondisi.' },
      { icon: '📊', title: 'Dashboard Analitik', desc: 'Pantau pergerakan stok secara real-time dengan grafik yang informatif dan interaktif.' },
      { icon: '⚠️', title: 'Low Stock Alert', desc: 'Dapatkan peringatan otomatis ketika stok barang mendekati batas minimum.' },
      { icon: '🏢', title: 'Manajemen Supplier', desc: 'Simpan dan kelola informasi supplier dengan lengkap untuk kemudahan pemesanan.' },
      { icon: '🔐', title: 'Keamanan Bearer Token', desc: 'Sistem autentikasi dengan Bearer Token memastikan data hanya diakses oleh pihak berwenang.' },
      { icon: '📤', title: 'Export Data', desc: 'Export laporan inventaris ke format PDF dan Excel untuk keperluan pelaporan.' },
    ];

    return { stats, loading, goToDashboard, features, authStore };
  },

  template: `
    <div class="min-h-screen bg-white dark:bg-gray-950">

      <!-- ──────────────────────────────────────────────────
           NAVBAR
      ────────────────────────────────────────────────── -->
      <nav class="fixed top-0 w-full z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-900">
        <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <span class="font-bold text-gray-900 dark:text-white">E-Inventory</span>
          </div>

          <!-- CTA Button -->
          <button
            @click="goToDashboard"
            class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all duration-200 shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 btn-ripple"
          >
            {{ authStore.authenticated ? 'Buka Dashboard' : 'Masuk' }}
          </button>
        </div>
      </nav>

      <!-- ──────────────────────────────────────────────────
           HERO SECTION
      ────────────────────────────────────────────────── -->
      <section class="relative pt-32 pb-20 px-6 overflow-hidden">
        <!-- Background decoration -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50/50 dark:bg-blue-950/20 rounded-full blur-3xl"></div>
        </div>

        <div class="relative max-w-4xl mx-auto text-center">
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 text-sm font-medium mb-8">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Sistem Inventaris Modern — v1.0
          </div>

          <!-- Heading -->
          <h1 class="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white leading-tight mb-6">
            Kelola Inventaris
            <br />
            <span class="gradient-text">Lebih Cerdas</span>
          </h1>

          <p class="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Sistem manajemen inventaris berbasis web yang modern, cepat, dan aman.
            Pantau stok, kelola supplier, dan buat laporan — semua dalam satu platform.
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              @click="goToDashboard"
              class="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition-all duration-200 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 btn-ripple"
            >
              🚀 Mulai Sekarang
            </button>
            <a
              href="#features"
              class="px-8 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200"
            >
              Lihat Fitur →
            </a>
          </div>
        </div>

        <!-- Floating illustration -->
        <div class="relative mt-20 max-w-5xl mx-auto animate-float">
          <div class="rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <!-- Mock Dashboard Preview -->
            <div class="bg-gray-800 dark:bg-gray-950 px-4 py-3 flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-red-500"></div>
              <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div class="w-3 h-3 rounded-full bg-green-500"></div>
              <div class="mx-auto text-xs text-gray-400 font-mono">Inventory Dashboard</div>
            </div>
            <div class="grid grid-cols-4 gap-4 p-6 bg-gray-50 dark:bg-gray-900">
              <div v-for="(item, i) in [
                { label: 'Total Barang', val: stats.total_barang, color: 'blue' },
                { label: 'Kategori', val: stats.total_kategori, color: 'purple' },
                { label: 'Supplier', val: stats.total_supplier, color: 'emerald' },
                { label: 'Stok Masuk', val: stats.total_masuk, color: 'amber' },
              ]" :key="i"
                class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <div :class="['w-8 h-8 rounded-lg mb-3 flex items-center justify-center text-sm',
                  item.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/40' :
                  item.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/40' :
                  item.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/40' :
                  'bg-amber-100 dark:bg-amber-900/40']">
                  📦
                </div>
                <p class="text-2xl font-black text-gray-900 dark:text-white">
                  <span v-if="loading" class="skeleton w-12 h-6 block"></span>
                  <span v-else>{{ item.val }}</span>
                </p>
                <p class="text-xs text-gray-500 mt-1">{{ item.label }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ──────────────────────────────────────────────────
           STATISTIK
      ────────────────────────────────────────────────── -->
      <section class="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div class="max-w-6xl mx-auto px-6">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-3">Statistik Inventaris</h2>
            <p class="text-gray-500 dark:text-gray-400">Data real-time dari sistem</p>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            <div v-for="(item, i) in [
              { label: 'Total Barang',  value: stats.total_barang,   emoji: '📦', color: 'from-blue-500 to-blue-600' },
              { label: 'Kategori',      value: stats.total_kategori,  emoji: '🏷️', color: 'from-purple-500 to-purple-600' },
              { label: 'Supplier',      value: stats.total_supplier,  emoji: '🏢', color: 'from-emerald-500 to-emerald-600' },
              { label: 'Barang Masuk',  value: stats.total_masuk,     emoji: '📥', color: 'from-cyan-500 to-cyan-600' },
              { label: 'Barang Keluar', value: stats.total_keluar,    emoji: '📤', color: 'from-orange-500 to-orange-600' },
            ]" :key="i"
              class="card-hover bg-white dark:bg-gray-900 rounded-2xl p-6 text-center shadow-sm border border-gray-100 dark:border-gray-800"
            >
              <div :class="['w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center text-xl bg-gradient-to-br shadow-md', item.color]">
                {{ item.emoji }}
              </div>
              <p class="text-3xl font-black text-gray-900 dark:text-white mb-1">
                <span v-if="loading" class="skeleton w-10 h-7 block mx-auto"></span>
                <span v-else>{{ item.value.toLocaleString('id-ID') }}</span>
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">{{ item.label }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ──────────────────────────────────────────────────
           FITUR UNGGULAN
      ────────────────────────────────────────────────── -->
      <section id="features" class="py-20 px-6">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">Fitur Unggulan</h2>
            <p class="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Dirancang khusus untuk memudahkan pengelolaan inventaris perusahaan secara modern dan efisien.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="(feature, i) in features"
              :key="i"
              class="card-hover group bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:border-blue-200 dark:hover:border-blue-900 transition-colors"
            >
              <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform">
                {{ feature.icon }}
              </div>
              <h3 class="font-bold text-gray-900 dark:text-white mb-2">{{ feature.title }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{{ feature.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ──────────────────────────────────────────────────
           CTA SECTION
      ────────────────────────────────────────────────── -->
      <section class="py-20 px-6 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
        <div class="absolute inset-0 pointer-events-none">
          <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-20 -translate-y-20"></div>
          <div class="absolute bottom-0 left-0 w-64 h-64 bg-blue-900/40 rounded-full blur-3xl transform -translate-x-20 translate-y-20"></div>
        </div>
        <div class="relative max-w-3xl mx-auto text-center text-white">
          <h2 class="text-4xl font-bold mb-4">Siap Mulai?</h2>
          <p class="text-blue-200 text-lg mb-8">Masuk ke dashboard dan mulai kelola inventaris Anda sekarang.</p>
          <button
            @click="goToDashboard"
            class="px-10 py-4 rounded-2xl bg-white text-blue-600 font-bold text-lg hover:bg-blue-50 transition-colors shadow-xl btn-ripple"
          >
            {{ authStore.authenticated ? '→ Buka Dashboard' : '→ Login Sekarang' }}
          </button>
        </div>
      </section>

      <!-- ──────────────────────────────────────────────────
           FOOTER
      ────────────────────────────────────────────────── -->
      <footer class="bg-gray-900 dark:bg-gray-950 text-gray-400 py-10 px-6">
        <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <span class="text-white font-bold">E-Inventory</span>
          </div>
          <p class="text-sm">© 2026 E-Inventory Management System.</p>
          <div class="flex gap-4 text-sm">
          </div>
        </div>
      </footer>

    </div>
  `,
});

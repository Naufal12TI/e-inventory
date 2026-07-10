/**
 * ============================================================
 * router/index.js — Vue Router Configuration
 * ============================================================
 * Mendefinisikan semua route SPA dan Navigation Guards.
 *
 * Navigation Guards:
 * - requiresAuth: true  → Redirect ke /login jika belum login
 * - Jika sudah login dan akses /login → Redirect ke /dashboard
 *
 * Struktur Route:
 * - "/" & "/login"  → Halaman publik, tanpa layout dashboard
 * - "/dashboard", "/items", dsb. → Nested di AppLayoutShell
 *   sehingga Sidebar + Navbar hanya di-mount SEKALI dan tidak
 *   di-refresh saat berpindah menu.
 * ============================================================
 */
import { createRouter, createWebHashHistory } from 'vue-router';
import authStore from '../stores/authStore.js';

// ─── Layout Shell (hanya di-mount sekali untuk semua halaman dashboard) ──
const AppLayoutShell = () => import('../components/layout/AppLayoutShell.js');

// ─── Lazy-load Page Components ────────────────────────────────
// Import halaman saat dibutuhkan untuk performa lebih baik
const LandingPage   = () => import('../pages/LandingPage.js');
const LoginPage     = () => import('../pages/LoginPage.js');
const DashboardPage = () => import('../pages/DashboardPage.js');
const CategoryPage  = () => import('../pages/CategoryPage.js');
const SupplierPage  = () => import('../pages/SupplierPage.js');
const ItemPage      = () => import('../pages/ItemPage.js');
const StockPage     = () => import('../pages/StockPage.js');
const UserPage      = () => import('../pages/UserPage.js');

// ─── Route Definitions ───────────────────────────────────────
const routes = [
  // ─── Halaman Publik (tanpa AppLayout) ─────────────────────
  {
    path: '/',
    name: 'landing',
    component: LandingPage,
    meta: {
      title: 'E-Inventory — Sistem Manajemen Inventaris',
      requiresAuth: false,
    },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: {
      title: 'Login — E-Inventory',
      requiresAuth: false,
    },
  },

  // ─── Halaman Dashboard (di dalam AppLayoutShell) ──────────
  // AppLayoutShell hanya di-mount SEKALI — Sidebar & Navbar
  // tidak akan refresh saat berpindah antar menu di bawah ini.
  {
    path: '/',
    component: AppLayoutShell,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: DashboardPage,
        meta: {
          title: 'Dashboard — E-Inventory',
          requiresAuth: true,
          breadcrumb: 'Dashboard',
        },
      },
      {
        path: 'categories',
        name: 'categories',
        component: CategoryPage,
        meta: {
          title: 'Kategori — E-Inventory',
          requiresAuth: true,
          breadcrumb: 'Manajemen Kategori',
        },
      },
      {
        path: 'suppliers',
        name: 'suppliers',
        component: SupplierPage,
        meta: {
          title: 'Supplier — E-Inventory',
          requiresAuth: true,
          breadcrumb: 'Manajemen Supplier',
        },
      },
      {
        path: 'items',
        name: 'items',
        component: ItemPage,
        meta: {
          title: 'Barang — E-Inventory',
          requiresAuth: true,
          breadcrumb: 'Manajemen Barang',
        },
      },
      {
        path: 'stocks',
        name: 'stocks',
        component: StockPage,
        meta: {
          title: 'Riwayat Stok — E-Inventory',
          requiresAuth: true,
          breadcrumb: 'Riwayat Stok',
        },
      },
      {
        path: 'users',
        name: 'users',
        component: UserPage,
        meta: {
          title: 'Pengguna — E-Inventory',
          requiresAuth: true,
          requiresAdmin: true,
          breadcrumb: 'Manajemen Pengguna',
        },
      },
    ],
  },

  // ─── Catch All: Redirect ke landing ─────────────────────────
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

// ─── Create Router ────────────────────────────────────────────
const router = createRouter({
  // Hash history (#/) untuk kompatibilitas tanpa konfigurasi server
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }; // Selalu scroll ke atas saat pindah halaman
  },
});

// ─── Navigation Guards ────────────────────────────────────────
router.beforeEach((to, from, next) => {
  // Update judul halaman browser
  if (to.meta?.title) {
    document.title = to.meta.title;
  }

  const isAuthenticated = authStore.authenticated;

  if (to.meta?.requiresAuth && !isAuthenticated) {
    // Halaman membutuhkan auth tapi belum login → ke /login
    next({ name: 'login' });

  } else if (to.name === 'login' && isAuthenticated) {
    // Sudah login tapi akses /login → ke /dashboard
    next({ name: 'dashboard' });

  } else if (to.meta?.requiresAdmin && authStore.userRole !== 'Administrator') {
    // Halaman membutuhkan role Administrator tapi user bukan Admin → ke /dashboard
    next({ name: 'dashboard' });

  } else {
    // Lanjutkan navigasi
    next();
  }
});

export default router;

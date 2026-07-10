<?php

use CodeIgniter\Router\RouteCollection;

/**
 * ============================================================
 * Routes Configuration — E-Inventory REST API
 * ============================================================
 *
 * Semua endpoint API dikelompokkan dalam prefix '/api'.
 * Menggunakan Resource Controller untuk CRUD otomatis.
 *
 * Tabel Route Resource:
 * GET    /resource         → index()   — Tampil semua
 * GET    /resource/(:num)  → show()    — Tampil satu
 * POST   /resource         → create()  — Tambah baru
 * PUT    /resource/(:num)  → update()  — Update data
 * DELETE /resource/(:num)  → delete()  — Hapus data
 * ============================================================
 *
 * @var RouteCollection $routes
 */

// ============================================================
// Nonaktifkan auto-routing untuk keamanan
// Hanya endpoint yang terdefinisi yang dapat diakses
// ============================================================
$routes->setAutoRoute(false);

// ============================================================
// Catch-All untuk HTTP OPTIONS (Preflight CORS)
// Tangani preflight secara global agar tidak kena 404/405 routing
// ============================================================
$routes->options('(:any)', function () {
    $response = service('response');
    $response->setStatusCode(200);
    $response->setHeader('Access-Control-Allow-Origin', '*');
    $response->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    $response->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    $response->setHeader('Access-Control-Max-Age', '3600');
    $response->send();
    exit;
});

// ============================================================
// Grup API — Semua endpoint menggunakan prefix /api
// ============================================================
$routes->group('api', ['namespace' => 'App\Controllers\Api'], function ($routes) {

    // ----------------------------------------------------------
    // AUTHENTICATION ENDPOINTS
    // ----------------------------------------------------------
    // POST /api/login  — Login, dapatkan token
    $routes->post('login', 'AuthController::login');

    // GET  /api/profile — Tampil profil user yang sedang login
    $routes->get('profile', 'AuthController::profile');

    // PUT  /api/profile — Update profil user yang sedang login
    $routes->put('profile', 'AuthController::updateProfile');

    // PUT  /api/profile/password — Ganti password sendiri
    $routes->put('profile/password', 'AuthController::changePassword');

    // POST /api/logout — Logout, hapus token
    $routes->post('logout', 'AuthController::logout');

    // ----------------------------------------------------------
    // USER ENDPOINTS — CRUD User
    // ----------------------------------------------------------
    $routes->resource('users', [
        'controller' => 'UserController',
        'only'       => ['index', 'show', 'create', 'update', 'delete'],
    ]);

    // ----------------------------------------------------------
    // CATEGORY ENDPOINTS — CRUD Kategori
    // ----------------------------------------------------------
    // GET    /api/categories
    // GET    /api/categories/(:num)
    // POST   /api/categories
    // PUT    /api/categories/(:num)
    // DELETE /api/categories/(:num)
    $routes->resource('categories', [
        'controller' => 'CategoryController',
        'only'       => ['index', 'show', 'create', 'update', 'delete'],
    ]);

    // ----------------------------------------------------------
    // SUPPLIER ENDPOINTS — CRUD Supplier
    // ----------------------------------------------------------
    $routes->resource('suppliers', [
        'controller' => 'SupplierController',
        'only'       => ['index', 'show', 'create', 'update', 'delete'],
    ]);

    // ----------------------------------------------------------
    // ITEM ENDPOINTS — CRUD Barang
    // ----------------------------------------------------------
    // Custom export route (harus didefinisikan sebelum resource agar tidak dianggap ID)
    $routes->get('items/export', 'ItemController::export');

    $routes->resource('items', [
        'controller' => 'ItemController',
        'only'       => ['index', 'show', 'create', 'update', 'delete'],
    ]);

    // ----------------------------------------------------------
    // STOCK HISTORY ENDPOINTS — CRUD Riwayat Stok
    // ----------------------------------------------------------
    // Custom export route
    $routes->get('stock-histories/export', 'StockHistoryController::export');

    $routes->resource('stock-histories', [
        'controller' => 'StockHistoryController',
        'only'       => ['index', 'show', 'create', 'update', 'delete'],
    ]);


    // ----------------------------------------------------------
    // DASHBOARD ENDPOINT — Statistik ringkasan
    // ----------------------------------------------------------
    // GET /api/dashboard — Semua statistik untuk dashboard
    $routes->get('dashboard', 'DashboardController::index');

    // GET /api/dashboard/chart — Data chart stok per bulan
    $routes->get('dashboard/chart', 'DashboardController::chart');

    // GET /api/dashboard/low-stock — Barang dengan stok rendah
    $routes->get('dashboard/low-stock', 'DashboardController::lowStock');

    // GET /api/dashboard/recent-activities — Aktivitas terakhir
    $routes->get('dashboard/recent-activities', 'DashboardController::recentActivities');
});

$routes->set404Override(function () {
    $response = service('response');
    $response->setStatusCode(404);
    $response->setContentType('application/json');
    $response->setJSON([
        'status'  => false,
        'message' => 'Endpoint tidak ditemukan.',
        'data'    => null,
    ]);
    $response->send();
    exit;
});

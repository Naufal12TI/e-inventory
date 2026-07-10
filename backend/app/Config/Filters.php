<?php

namespace Config;

use App\Filters\AuthFilter;
use App\Filters\CORSFilter;
use CodeIgniter\Config\Filters as BaseFilters;
use CodeIgniter\Filters\CSRF;
use CodeIgniter\Filters\DebugToolbar;
use CodeIgniter\Filters\ForceHTTPS;
use CodeIgniter\Filters\Honeypot;
use CodeIgniter\Filters\InvalidChars;
use CodeIgniter\Filters\PageCache;
use CodeIgniter\Filters\PerformanceMetrics;
use CodeIgniter\Filters\SecureHeaders;

/**
 * ============================================================
 * Filters Configuration
 * ============================================================
 * Registrasi semua filter yang digunakan dalam aplikasi.
 *
 * Filter kustom yang ditambahkan:
 * - 'cors'   => CORSFilter  : Mengizinkan akses dari frontend Vue
 * - 'auth'   => AuthFilter  : Memvalidasi Bearer Token
 * ============================================================
 */
class Filters extends BaseFilters
{
    /**
     * Daftar alias filter yang tersedia.
     *
     * @var array<string, class-string|list<class-string>>
     */
    public array $aliases = [
        'csrf'          => CSRF::class,
        'toolbar'       => DebugToolbar::class,
        'honeypot'      => Honeypot::class,
        'invalidchars'  => InvalidChars::class,
        'secureheaders' => SecureHeaders::class,
        'forcehttps'    => ForceHTTPS::class,
        'pagecache'     => PageCache::class,
        'performance'   => PerformanceMetrics::class,

        // Filter kustom untuk aplikasi
        'cors' => CORSFilter::class, // CORS — izinkan akses dari frontend
        'auth' => AuthFilter::class, // Auth — validasi Bearer Token
    ];

    /**
     * Filter wajib yang selalu berjalan.
     *
     * @var array{before: list<string>, after: list<string>}
     */
    public array $required = [
        'before' => [
            'pagecache', // Web Page Caching
        ],
        'after' => [
            'pagecache',   // Web Page Caching
            'performance', // Performance Metrics
            'toolbar',     // Debug Toolbar
        ],
    ];

    /**
     * Filter global yang berjalan pada SETIAP request.
     *
     * 'cors' ditambahkan agar setiap response memiliki header CORS.
     *
     * @var array{before: list<string>|array, after: list<string>|array}
     */
    public array $globals = [
        'before' => [
            'cors', // Jalankan CORS filter sebelum setiap request
        ],
        'after' => [
            'cors', // Tambahkan header CORS setelah setiap response
        ],
    ];

    /**
     * Filter berdasarkan HTTP Method.
     * Tidak menggunakan method-based agar /api/login bebas dari auth.
     *
     * @var array<string, list<string>>
     */
    public array $methods = [];

    /**
     * Filter berdasarkan pola URI.
     * Auth hanya berlaku untuk endpoint yang memerlukan autentikasi.
     * /api/login dan /api/* GET dikecualikan.
     *
     * @var array<string, array<string, list<string>>>
     */
    public array $filters = [
        // Auth filter untuk semua POST kecuali login
        'auth' => [
            'before' => [
                'api/categories',          // POST tambah kategori
                'api/suppliers',           // POST tambah supplier
                'api/items',               // POST tambah barang
                'api/stock-histories',     // POST tambah riwayat stok
                'api/logout',              // POST logout
                'api/categories/*',        // PUT/DELETE edit/hapus kategori
                'api/suppliers/*',         // PUT/DELETE edit/hapus supplier
                'api/items/*',             // PUT/DELETE edit/hapus barang
                'api/stock-histories/*',   // PUT/DELETE edit/hapus histori
                'api/profile',             // GET profil user
                'api/dashboard/chart',     // GET chart data
                'api/dashboard/low-stock', // GET low stock items
                'api/dashboard/recent-activities', // GET recent stock activities
                'api/users',               // GET/POST user management
                'api/users/*',             // GET/PUT/DELETE user management
            ],
        ],
    ];
}

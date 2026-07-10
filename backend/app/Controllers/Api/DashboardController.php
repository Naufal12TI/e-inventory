<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\CategoryModel;
use App\Models\ItemModel;
use App\Models\StockHistoryModel;
use App\Models\SupplierModel;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * ============================================================
 * DashboardController
 * ============================================================
 * Controller untuk data statistik dashboard admin.
 *
 * Endpoint:
 * GET /api/dashboard                   → index()            — Statistik lengkap
 * GET /api/dashboard/chart             → chart()            — Data chart per bulan
 * GET /api/dashboard/low-stock         → lowStock()         — Barang stok rendah
 * GET /api/dashboard/recent-activities → recentActivities() — Aktivitas terakhir
 * ============================================================
 */
class DashboardController extends BaseController
{
    private CategoryModel    $categoryModel;
    private SupplierModel    $supplierModel;
    private ItemModel        $itemModel;
    private StockHistoryModel $stockModel;

    public function __construct()
    {
        $this->categoryModel = new CategoryModel();
        $this->supplierModel = new SupplierModel();
        $this->itemModel     = new ItemModel();
        $this->stockModel    = new StockHistoryModel();
    }

    // ============================================================
    // GET /api/dashboard
    // ============================================================
    /**
     * Ambil semua statistik untuk dashboard utama.
     *
     * Response:
     * {
     *   "total_barang": 50,
     *   "total_kategori": 8,
     *   "total_supplier": 5,
     *   "total_masuk": 200,
     *   "total_keluar": 150,
     *   "low_stock_count": 3
     * }
     */
    public function index(): ResponseInterface
    {
        // Hitung total masing-masing data
        $totalBarang    = $this->itemModel->countAll();
        $totalKategori  = $this->categoryModel->countAll();
        $totalSupplier  = $this->supplierModel->countAll();
        $stokSummary    = $this->stockModel->getTotalMasukKeluar();
        $lowStockCount  = count($this->itemModel->getLowStockItems());

        return $this->respond([
            'status'  => true,
            'message' => 'Data dashboard berhasil diambil.',
            'data'    => [
                'total_barang'   => $totalBarang,
                'total_kategori' => $totalKategori,
                'total_supplier' => $totalSupplier,
                'total_masuk'    => $stokSummary['total_masuk'],
                'total_keluar'   => $stokSummary['total_keluar'],
                'low_stock_count' => $lowStockCount,
            ],
        ], ResponseInterface::HTTP_OK);
    }

    // ============================================================
    // GET /api/dashboard/chart
    // ============================================================
    /**
     * Ambil data chart stok masuk dan keluar per bulan (12 bulan terakhir).
     * Digunakan untuk menampilkan grafik batang di dashboard.
     */
    public function chart(): ResponseInterface
    {
        $chartData = $this->stockModel->getChartDataPerMonth();

        return $this->respond([
            'status'  => true,
            'message' => 'Data chart berhasil diambil.',
            'data'    => $chartData,
        ], ResponseInterface::HTTP_OK);
    }

    // ============================================================
    // GET /api/dashboard/low-stock
    // ============================================================
    /**
     * Ambil daftar barang yang stoknya di bawah atau sama dengan stok minimum.
     * Digunakan untuk komponen Low Stock Alert.
     */
    public function lowStock(): ResponseInterface
    {
        $lowStockItems = $this->itemModel->getLowStockItems();

        return $this->respond([
            'status'  => true,
            'message' => 'Data barang stok rendah berhasil diambil.',
            'data'    => $lowStockItems,
        ], ResponseInterface::HTTP_OK);
    }

    // ============================================================
    // GET /api/dashboard/recent-activities
    // ============================================================
    /**
     * Ambil aktivitas stok terbaru.
     * Default: 10 aktivitas terakhir.
     * Parameter: ?limit=N (maksimal 50)
     */
    public function recentActivities(): ResponseInterface
    {
        $limit  = min((int) ($this->request->getGet('limit') ?? 10), 50);
        $recent = $this->stockModel->getRecentActivities($limit);

        return $this->respond([
            'status'  => true,
            'message' => 'Data aktivitas terakhir berhasil diambil.',
            'data'    => $recent,
        ], ResponseInterface::HTTP_OK);
    }
}

<?php

namespace App\Models;

use CodeIgniter\Model;

/**
 * ============================================================
 * StockHistoryModel
 * ============================================================
 * Model untuk mengelola riwayat pergerakan stok (tabel: stock_histories).
 *
 * Fitur:
 * - CRUD riwayat stok
 * - Query dengan relasi ke tabel items
 * - Statistik total masuk/keluar
 * - Data chart per bulan
 * ============================================================
 */
class StockHistoryModel extends Model
{
    protected $table      = 'stock_histories';
    protected $primaryKey = 'id';

    protected $useTimestamps = true;
    protected $returnType    = 'array';

    protected $allowedFields = [
        'barang_id',
        'jenis',
        'jumlah',
        'keterangan',
        'tanggal',
    ];

    /**
     * Aturan validasi riwayat stok.
     */
    protected $validationRules = [
        'barang_id' => [
            'label' => 'Barang',
            'rules' => 'required|integer|is_not_unique[items.id]',
        ],
        'jenis' => [
            'label' => 'Jenis',
            'rules' => 'required|in_list[Masuk,Keluar]',
        ],
        'jumlah' => [
            'label' => 'Jumlah',
            'rules' => 'required|integer|greater_than[0]',
        ],
        'tanggal' => [
            'label' => 'Tanggal',
            'rules' => 'required|valid_date[Y-m-d]',
        ],
    ];

    /**
     * Ambil semua riwayat stok beserta nama barang.
     *
     * @param array $params Parameter filter
     * @return array
     */
    public function getHistoriesWithItem(array $params = []): array
    {
        $builder = $this->db->table('stock_histories sh')
            ->select('sh.*, i.nama_barang, i.kode_barang')
            ->join('items i', 'i.id = sh.barang_id', 'left');

        // Filter berdasarkan barang
        if (!empty($params['barang_id'])) {
            $builder->where('sh.barang_id', $params['barang_id']);
        }

        // Filter berdasarkan jenis (Masuk/Keluar)
        if (!empty($params['jenis'])) {
            $builder->where('sh.jenis', $params['jenis']);
        }

        // Filter berdasarkan rentang tanggal
        if (!empty($params['dari'])) {
            $builder->where('sh.tanggal >=', $params['dari']);
        }
        if (!empty($params['sampai'])) {
            $builder->where('sh.tanggal <=', $params['sampai']);
        }

        // Pencarian berdasarkan nama barang
        if (!empty($params['search'])) {
            $builder->groupStart()
                        ->like('i.nama_barang', $params['search'])
                        ->orLike('i.kode_barang', $params['search'])
                    ->groupEnd();
        }

        return $builder->orderBy('sh.tanggal', 'DESC')
                       ->orderBy('sh.created_at', 'DESC')
                       ->get()
                       ->getResultArray();
    }

    /**
     * Hitung total barang masuk dan keluar.
     *
     * @return array ['total_masuk' => int, 'total_keluar' => int]
     */
    public function getTotalMasukKeluar(): array
    {
        $result = $this->db->table('stock_histories')
            ->select("
                SUM(CASE WHEN jenis = 'Masuk' THEN jumlah ELSE 0 END) AS total_masuk,
                SUM(CASE WHEN jenis = 'Keluar' THEN jumlah ELSE 0 END) AS total_keluar
            ")
            ->get()
            ->getRowArray();

        return [
            'total_masuk'  => (int) ($result['total_masuk'] ?? 0),
            'total_keluar' => (int) ($result['total_keluar'] ?? 0),
        ];
    }

    /**
     * Ambil data chart: total masuk dan keluar per bulan (12 bulan terakhir).
     * Digunakan untuk menampilkan grafik di dashboard.
     *
     * @return array Data chart per bulan
     */
    public function getChartDataPerMonth(): array
    {
        $results = $this->db->query("
            SELECT
                DATE_FORMAT(tanggal, '%Y-%m') AS bulan,
                DATE_FORMAT(tanggal, '%b %Y') AS label,
                SUM(CASE WHEN jenis = 'Masuk'  THEN jumlah ELSE 0 END) AS total_masuk,
                SUM(CASE WHEN jenis = 'Keluar' THEN jumlah ELSE 0 END) AS total_keluar
            FROM stock_histories
            WHERE tanggal >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(tanggal, '%Y-%m'), DATE_FORMAT(tanggal, '%b %Y')
            ORDER BY bulan ASC
        ")->getResultArray();

        return $results;
    }

    /**
     * Ambil aktivitas stok terbaru (untuk dashboard).
     *
     * @param int $limit Jumlah data yang diambil
     * @return array
     */
    public function getRecentActivities(int $limit = 10): array
    {
        return $this->db->table('stock_histories sh')
            ->select('sh.*, i.nama_barang, i.kode_barang')
            ->join('items i', 'i.id = sh.barang_id', 'left')
            ->orderBy('sh.created_at', 'DESC')
            ->limit($limit)
            ->get()
            ->getResultArray();
    }
}

<?php

namespace App\Models;

use CodeIgniter\Model;

/**
 * ============================================================
 * ItemModel
 * ============================================================
 * Model untuk mengelola data barang inventaris (tabel: items).
 *
 * Fitur:
 * - CRUD barang dengan relasi kategori & supplier
 * - Filter berdasarkan kategori, supplier, kondisi
 * - Pencarian berdasarkan nama/kode barang
 * - Deteksi low stock
 * - Auto-generate kode barang
 * ============================================================
 */
class ItemModel extends Model
{
    protected $table      = 'items';
    protected $primaryKey = 'id';

    protected $useTimestamps = true;
    protected $returnType    = 'array';

    protected $allowedFields = [
        'kode_barang',
        'nama_barang',
        'kategori_id',
        'supplier_id',
        'stok',
        'stok_minimum',
        'harga_beli',
        'harga_jual',
        'lokasi',
        'kondisi',
    ];

    /**
     * Aturan validasi barang.
     */
    protected $validationRules = [
        'kode_barang' => [
            'label' => 'Kode Barang',
            'rules' => 'required|max_length[50]|is_unique[items.kode_barang,id,{id}]',
        ],
        'nama_barang' => [
            'label' => 'Nama Barang',
            'rules' => 'required|max_length[150]',
        ],
        'kategori_id' => [
            'label' => 'Kategori',
            'rules' => 'required|integer|is_not_unique[categories.id]',
        ],
        'supplier_id' => [
            'label' => 'Supplier',
            'rules' => 'required|integer|is_not_unique[suppliers.id]',
        ],
        'stok' => [
            'label' => 'Stok',
            'rules' => 'required|integer|greater_than_equal_to[0]',
        ],
        'stok_minimum' => [
            'label' => 'Stok Minimum',
            'rules' => 'required|integer|greater_than_equal_to[0]',
        ],
        'harga_beli' => [
            'label' => 'Harga Beli',
            'rules' => 'required|decimal|greater_than_equal_to[0]',
        ],
        'harga_jual' => [
            'label' => 'Harga Jual',
            'rules' => 'required|decimal|greater_than_equal_to[0]',
        ],
        'kondisi' => [
            'label' => 'Kondisi',
            'rules' => 'required|in_list[Baik,Rusak Ringan,Rusak Berat]',
        ],
    ];

    /**
     * Ambil semua barang beserta nama kategori dan supplier.
     * Mendukung filter, pencarian, dan pengurutan.
     *
     * @param array $params Parameter filter/search/sort
     * @return array Daftar barang
     */
    public function getItemsWithRelations(array $params = []): array
    {
        $builder = $this->db->table('items i')
            ->select('
                i.*,
                c.nama_kategori,
                s.nama_supplier
            ')
            ->join('categories c', 'c.id = i.kategori_id', 'left')
            ->join('suppliers s', 's.id = i.supplier_id', 'left');

        // Filter berdasarkan kategori
        if (!empty($params['kategori_id'])) {
            $builder->where('i.kategori_id', $params['kategori_id']);
        }

        // Filter berdasarkan supplier
        if (!empty($params['supplier_id'])) {
            $builder->where('i.supplier_id', $params['supplier_id']);
        }

        // Filter berdasarkan kondisi
        if (!empty($params['kondisi'])) {
            $builder->where('i.kondisi', $params['kondisi']);
        }

        // Pencarian berdasarkan nama atau kode barang
        if (!empty($params['search'])) {
            $builder->groupStart()
                        ->like('i.nama_barang', $params['search'])
                        ->orLike('i.kode_barang', $params['search'])
                    ->groupEnd();
        }

        // Pengurutan (sorting)
        $sortField = $params['sort'] ?? 'i.created_at';
        $sortDir   = strtoupper($params['order'] ?? 'DESC');

        // Whitelist kolom yang boleh di-sort (mencegah SQL injection)
        $allowedSorts = ['i.nama_barang', 'i.kode_barang', 'i.stok', 'i.harga_jual', 'i.created_at'];
        if (!in_array($sortField, $allowedSorts)) {
            $sortField = 'i.created_at';
        }

        $builder->orderBy($sortField, $sortDir === 'ASC' ? 'ASC' : 'DESC');

        return $builder->get()->getResultArray();
    }

    /**
     * Ambil satu barang beserta relasi kategori dan supplier.
     *
     * @param int $id ID barang
     * @return array|null
     */
    public function getItemWithRelations(int $id): ?array
    {
        $result = $this->db->table('items i')
            ->select('i.*, c.nama_kategori, s.nama_supplier')
            ->join('categories c', 'c.id = i.kategori_id', 'left')
            ->join('suppliers s', 's.id = i.supplier_id', 'left')
            ->where('i.id', $id)
            ->get()
            ->getRowArray();

        return $result ?: null;
    }

    /**
     * Ambil barang yang stoknya di bawah atau sama dengan stok minimum.
     * Digunakan untuk fitur Low Stock Alert.
     *
     * @return array Daftar barang dengan stok rendah
     */
    public function getLowStockItems(): array
    {
        return $this->db->table('items i')
            ->select('i.*, c.nama_kategori, s.nama_supplier')
            ->join('categories c', 'c.id = i.kategori_id', 'left')
            ->join('suppliers s', 's.id = i.supplier_id', 'left')
            ->where('i.stok <=', $this->db->escapeIdentifiers('i.stok_minimum'), false)
            ->orderBy('i.stok', 'ASC')
            ->get()
            ->getResultArray();
    }

    /**
     * Perbarui stok barang (naik atau turun).
     *
     * @param int    $itemId ID barang
     * @param int    $jumlah Jumlah perubahan stok
     * @param string $jenis  'Masuk' atau 'Keluar'
     * @return bool Berhasil atau gagal
     */
    public function updateStock(int $itemId, int $jumlah, string $jenis): bool
    {
        $item = $this->find($itemId);

        if (!$item) {
            return false;
        }

        if ($jenis === 'Masuk') {
            // Stok bertambah
            $stokBaru = $item['stok'] + $jumlah;
        } else {
            // Stok berkurang — pastikan tidak minus
            $stokBaru = $item['stok'] - $jumlah;
            if ($stokBaru < 0) {
                return false; // Stok tidak mencukupi
            }
        }

        return $this->update($itemId, ['stok' => $stokBaru]);
    }

    /**
     * Generate kode barang otomatis berformat ITM-XXX.
     *
     * @return string Kode barang baru
     */
    public function generateKodeBarang(): string
    {
        // Ambil kode terakhir
        $last = $this->orderBy('id', 'DESC')->first();

        if (!$last) {
            return 'ITM-001';
        }

        // Ekstrak nomor dari kode terakhir
        preg_match('/ITM-(\d+)/', $last['kode_barang'], $matches);
        $nomor = isset($matches[1]) ? (int) $matches[1] + 1 : 1;

        return 'ITM-' . str_pad($nomor, 3, '0', STR_PAD_LEFT);
    }
}

<?php

namespace App\Models;

use CodeIgniter\Model;

/**
 * ============================================================
 * CategoryModel
 * ============================================================
 * Model untuk mengelola data kategori barang (tabel: categories).
 *
 * Fitur:
 * - CRUD kategori
 * - Pencarian berdasarkan nama
 * - Cek apakah kategori masih digunakan oleh barang
 * ============================================================
 */
class CategoryModel extends Model
{
    protected $table      = 'categories';
    protected $primaryKey = 'id';

    protected $useTimestamps = true;
    protected $returnType    = 'array';

    /** Kolom yang boleh diisi */
    protected $allowedFields = [
        'nama_kategori',
        'deskripsi',
    ];

    /**
     * Aturan validasi kategori.
     *
     * @var array<string, array<string, string>>
     */
    protected $validationRules = [
        'nama_kategori' => [
            'label' => 'Nama Kategori',
            'rules' => 'required|max_length[100]',
        ],
    ];

    /**
     * Cari kategori berdasarkan kata kunci (nama).
     *
     * @param string $keyword Kata kunci pencarian
     * @return array Hasil pencarian
     */
    public function search(string $keyword): array
    {
        return $this->like('nama_kategori', $keyword)
                    ->orLike('deskripsi', $keyword)
                    ->findAll();
    }

    /**
     * Cek apakah kategori masih digunakan oleh barang.
     * Digunakan sebelum hapus kategori untuk mencegah error FK.
     *
     * @param int $categoryId ID kategori
     * @return bool true jika masih digunakan
     */
    public function isUsedByItems(int $categoryId): bool
    {
        $db    = \Config\Database::connect();
        $count = $db->table('items')
                    ->where('kategori_id', $categoryId)
                    ->countAllResults();

        return $count > 0;
    }
}

<?php

namespace App\Models;

use CodeIgniter\Model;

/**
 * ============================================================
 * SupplierModel
 * ============================================================
 * Model untuk mengelola data supplier (tabel: suppliers).
 * ============================================================
 */
class SupplierModel extends Model
{
    protected $table      = 'suppliers';
    protected $primaryKey = 'id';

    protected $useTimestamps = true;
    protected $returnType    = 'array';

    protected $allowedFields = [
        'nama_supplier',
        'alamat',
        'telepon',
        'email',
    ];

    /**
     * Aturan validasi supplier.
     */
    protected $validationRules = [
        'nama_supplier' => [
            'label' => 'Nama Supplier',
            'rules' => 'required|max_length[100]',
        ],
        'email' => [
            'label' => 'Email',
            'rules' => 'permit_empty|valid_email|max_length[100]',
        ],
        'telepon' => [
            'label' => 'Telepon',
            'rules' => 'permit_empty|max_length[20]',
        ],
    ];

    /**
     * Pencarian supplier berdasarkan nama, email, atau telepon.
     *
     * @param string $keyword Kata kunci pencarian
     * @return array Hasil pencarian
     */
    public function search(string $keyword): array
    {
        return $this->groupStart()
                        ->like('nama_supplier', $keyword)
                        ->orLike('email', $keyword)
                        ->orLike('telepon', $keyword)
                    ->groupEnd()
                    ->findAll();
    }

    /**
     * Cek apakah supplier masih digunakan oleh barang.
     *
     * @param int $supplierId ID supplier
     * @return bool
     */
    public function isUsedByItems(int $supplierId): bool
    {
        $db    = \Config\Database::connect();
        $count = $db->table('items')
                    ->where('supplier_id', $supplierId)
                    ->countAllResults();

        return $count > 0;
    }
}

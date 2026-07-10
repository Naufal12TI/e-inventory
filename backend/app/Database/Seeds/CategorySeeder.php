<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

/**
 * ============================================================
 * CategorySeeder
 * ============================================================
 * Data awal kategori barang inventaris.
 * ============================================================
 */
class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['nama_kategori' => 'Elektronik',        'deskripsi' => 'Perangkat elektronik seperti komputer, laptop, dan aksesoris'],
            ['nama_kategori' => 'Furniture',          'deskripsi' => 'Perabotan kantor seperti kursi, meja, dan lemari'],
            ['nama_kategori' => 'Alat Tulis Kantor',  'deskripsi' => 'Perlengkapan tulis menulis dan administrasi'],
            ['nama_kategori' => 'Peralatan Jaringan', 'deskripsi' => 'Perangkat jaringan seperti router, switch, dan kabel'],
            ['nama_kategori' => 'Kendaraan',          'deskripsi' => 'Kendaraan operasional perusahaan'],
            ['nama_kategori' => 'Mesin & Peralatan',  'deskripsi' => 'Mesin industri dan peralatan berat'],
            ['nama_kategori' => 'Keamanan',           'deskripsi' => 'Perangkat keamanan seperti CCTV dan alarm'],
            ['nama_kategori' => 'Konsumabel',         'deskripsi' => 'Barang habis pakai seperti tinta, kertas, dan baterai'],
        ];

        // Tambahkan timestamp ke setiap data
        $now = date('Y-m-d H:i:s');
        foreach ($data as &$row) {
            $row['created_at'] = $now;
            $row['updated_at'] = $now;
        }

        $this->db->table('categories')->insertBatch($data);
        echo "✅ CategorySeeder: " . count($data) . " kategori berhasil dibuat.\n";
    }
}

<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

/**
 * ============================================================
 * SupplierSeeder
 * ============================================================
 * Data awal supplier/pemasok barang.
 * ============================================================
 */
class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        $now  = date('Y-m-d H:i:s');
        $data = [
            [
                'nama_supplier' => 'PT. Teknindo Makmur',
                'alamat'        => 'Jl. Sudirman No. 45, Jakarta Pusat, DKI Jakarta 10220',
                'telepon'       => '021-55512345',
                'email'         => 'info@teknindo.co.id',
                'created_at'    => $now,
                'updated_at'    => $now,
            ],
            [
                'nama_supplier' => 'CV. Maju Bersama',
                'alamat'        => 'Jl. Raya Bogor Km 25, Cibinong, Bogor, Jawa Barat 16916',
                'telepon'       => '021-87654321',
                'email'         => 'sales@majubersama.com',
                'created_at'    => $now,
                'updated_at'    => $now,
            ],
            [
                'nama_supplier' => 'Toko Elektronik Sejahtera',
                'alamat'        => 'Jl. Pahlawan No. 12, Glodok, Jakarta Barat 11140',
                'telepon'       => '021-62534567',
                'email'         => 'eleksejahtera@gmail.com',
                'created_at'    => $now,
                'updated_at'    => $now,
            ],
            [
                'nama_supplier' => 'PT. Global Furniture Indonesia',
                'alamat'        => 'Kawasan Industri Cikarang Barat, Bekasi, Jawa Barat 17520',
                'telepon'       => '021-89101112',
                'email'         => 'order@globalfurniture.id',
                'created_at'    => $now,
                'updated_at'    => $now,
            ],
            [
                'nama_supplier' => 'UD. Sarana Kantor',
                'alamat'        => 'Jl. Gatot Subroto No. 7, Bandung, Jawa Barat 40262',
                'telepon'       => '022-78901234',
                'email'         => 'saranakantor@yahoo.com',
                'created_at'    => $now,
                'updated_at'    => $now,
            ],
        ];

        $this->db->table('suppliers')->insertBatch($data);
        echo "✅ SupplierSeeder: " . count($data) . " supplier berhasil dibuat.\n";
    }
}

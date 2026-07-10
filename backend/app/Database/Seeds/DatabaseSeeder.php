<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

/**
 * ============================================================
 * DatabaseSeeder — Master Seeder
 * ============================================================
 * Seeder utama yang memanggil semua seeder secara berurutan.
 *
 * Urutan WAJIB karena ada relasi antar tabel:
 * 1. UserSeeder        (tidak ada FK)
 * 2. CategorySeeder    (tidak ada FK)
 * 3. SupplierSeeder    (tidak ada FK)
 * 4. ItemSeeder        (FK: kategori_id, supplier_id)
 * 5. StockHistorySeeder (FK: barang_id → items.id)
 *
 * Cara menjalankan:
 * php spark db:seed DatabaseSeeder
 * ============================================================
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        echo "\n🚀 Memulai proses seeding database E-Inventory...\n\n";

        // 1. Users — akun admin
        $this->call(UserSeeder::class);

        // 2. Categories — kategori barang
        $this->call(CategorySeeder::class);

        // 3. Suppliers — data supplier
        $this->call(SupplierSeeder::class);

        // 4. Items — data barang (butuh kategori & supplier sudah ada)
        $this->call(ItemSeeder::class);

        // 5. Stock Histories — riwayat stok (butuh items sudah ada)
        $this->call(StockHistorySeeder::class);

        echo "\n✅ Seeding selesai! Database siap digunakan.\n";
        echo "   Login: admin / admin123\n\n";
    }
}

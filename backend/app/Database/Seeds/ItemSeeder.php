<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

/**
 * ============================================================
 * ItemSeeder
 * ============================================================
 * Data awal barang inventaris dengan variasi kondisi dan stok.
 * Beberapa barang sengaja memiliki stok di bawah minimum
 * untuk testing fitur Low Stock Alert.
 * ============================================================
 */
class ItemSeeder extends Seeder
{
    public function run(): void
    {
        $now  = date('Y-m-d H:i:s');
        $data = [
            // Elektronik (kategori_id=1, supplier_id=1)
            [
                'kode_barang'  => 'ITM-001', 'nama_barang' => 'Laptop Dell Inspiron 15',
                'kategori_id'  => 1, 'supplier_id' => 1,
                'stok' => 15, 'stok_minimum' => 5,
                'harga_beli' => 8500000, 'harga_jual' => 10500000,
                'lokasi' => 'Gudang A - Rak 1', 'kondisi' => 'Baik',
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'kode_barang'  => 'ITM-002', 'nama_barang' => 'Monitor LG 24 inch',
                'kategori_id'  => 1, 'supplier_id' => 1,
                'stok' => 3, 'stok_minimum' => 5, // LOW STOCK
                'harga_beli' => 1800000, 'harga_jual' => 2500000,
                'lokasi' => 'Gudang A - Rak 2', 'kondisi' => 'Baik',
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'kode_barang'  => 'ITM-003', 'nama_barang' => 'Keyboard Logitech MK270',
                'kategori_id'  => 1, 'supplier_id' => 3,
                'stok' => 20, 'stok_minimum' => 10,
                'harga_beli' => 250000, 'harga_jual' => 380000,
                'lokasi' => 'Gudang A - Rak 3', 'kondisi' => 'Baik',
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'kode_barang'  => 'ITM-004', 'nama_barang' => 'Printer Epson L3210',
                'kategori_id'  => 1, 'supplier_id' => 1,
                'stok' => 8, 'stok_minimum' => 3,
                'harga_beli' => 1600000, 'harga_jual' => 2200000,
                'lokasi' => 'Gudang B - Rak 1', 'kondisi' => 'Baik',
                'created_at' => $now, 'updated_at' => $now,
            ],
            // Furniture (kategori_id=2, supplier_id=4)
            [
                'kode_barang'  => 'ITM-005', 'nama_barang' => 'Kursi Ergonomis Executive',
                'kategori_id'  => 2, 'supplier_id' => 4,
                'stok' => 25, 'stok_minimum' => 5,
                'harga_beli' => 850000, 'harga_jual' => 1200000,
                'lokasi' => 'Gudang C - Area 1', 'kondisi' => 'Baik',
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'kode_barang'  => 'ITM-006', 'nama_barang' => 'Meja Kerja Kantor 120cm',
                'kategori_id'  => 2, 'supplier_id' => 4,
                'stok' => 2, 'stok_minimum' => 5, // LOW STOCK
                'harga_beli' => 1200000, 'harga_jual' => 1800000,
                'lokasi' => 'Gudang C - Area 2', 'kondisi' => 'Baik',
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'kode_barang'  => 'ITM-007', 'nama_barang' => 'Lemari Arsip Besi 4 Laci',
                'kategori_id'  => 2, 'supplier_id' => 4,
                'stok' => 10, 'stok_minimum' => 3,
                'harga_beli' => 2500000, 'harga_jual' => 3500000,
                'lokasi' => 'Gudang C - Area 3', 'kondisi' => 'Rusak Ringan',
                'created_at' => $now, 'updated_at' => $now,
            ],
            // Alat Tulis (kategori_id=3, supplier_id=5)
            [
                'kode_barang'  => 'ITM-008', 'nama_barang' => 'Kertas HVS A4 70gr (Rim)',
                'kategori_id'  => 3, 'supplier_id' => 5,
                'stok' => 50, 'stok_minimum' => 20,
                'harga_beli' => 45000, 'harga_jual' => 55000,
                'lokasi' => 'Gudang D - Rak 1', 'kondisi' => 'Baik',
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'kode_barang'  => 'ITM-009', 'nama_barang' => 'Pulpen Ballpoint Blue (Box)',
                'kategori_id'  => 3, 'supplier_id' => 5,
                'stok' => 30, 'stok_minimum' => 10,
                'harga_beli' => 25000, 'harga_jual' => 35000,
                'lokasi' => 'Gudang D - Rak 2', 'kondisi' => 'Baik',
                'created_at' => $now, 'updated_at' => $now,
            ],
            // Jaringan (kategori_id=4, supplier_id=1)
            [
                'kode_barang'  => 'ITM-010', 'nama_barang' => 'Router WiFi TP-Link AC1200',
                'kategori_id'  => 4, 'supplier_id' => 1,
                'stok' => 0, 'stok_minimum' => 3, // HABIS
                'harga_beli' => 380000, 'harga_jual' => 550000,
                'lokasi' => 'Gudang A - Rak 4', 'kondisi' => 'Baik',
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'kode_barang'  => 'ITM-011', 'nama_barang' => 'Switch Unmanaged 8 Port',
                'kategori_id'  => 4, 'supplier_id' => 1,
                'stok' => 7, 'stok_minimum' => 5,
                'harga_beli' => 280000, 'harga_jual' => 420000,
                'lokasi' => 'Gudang A - Rak 5', 'kondisi' => 'Baik',
                'created_at' => $now, 'updated_at' => $now,
            ],
            // Keamanan (kategori_id=7, supplier_id=2)
            [
                'kode_barang'  => 'ITM-012', 'nama_barang' => 'Kamera CCTV Hikvision 4MP',
                'kategori_id'  => 7, 'supplier_id' => 2,
                'stok' => 12, 'stok_minimum' => 4,
                'harga_beli' => 750000, 'harga_jual' => 1100000,
                'lokasi' => 'Gudang B - Rak 3', 'kondisi' => 'Baik',
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'kode_barang'  => 'ITM-013', 'nama_barang' => 'UPS APC 650VA',
                'kategori_id'  => 1, 'supplier_id' => 3,
                'stok' => 5, 'stok_minimum' => 3,
                'harga_beli' => 900000, 'harga_jual' => 1300000,
                'lokasi' => 'Gudang A - Rak 6', 'kondisi' => 'Rusak Berat',
                'created_at' => $now, 'updated_at' => $now,
            ],
        ];

        $this->db->table('items')->insertBatch($data);
        echo "✅ ItemSeeder: " . count($data) . " barang berhasil dibuat.\n";
    }
}

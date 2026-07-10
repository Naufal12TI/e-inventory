<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

/**
 * ============================================================
 * StockHistorySeeder
 * ============================================================
 * Data awal riwayat pergerakan stok untuk testing dashboard.
 * ============================================================
 */
class StockHistorySeeder extends Seeder
{
    public function run(): void
    {
        $now  = date('Y-m-d H:i:s');
        $data = [
            // Riwayat bulan ini
            ['barang_id' => 1,  'jenis' => 'Masuk',  'jumlah' => 20, 'keterangan' => 'Pembelian awal laptop', 'tanggal' => date('Y-m-01'), 'created_at' => $now, 'updated_at' => $now],
            ['barang_id' => 1,  'jenis' => 'Keluar', 'jumlah' => 5,  'keterangan' => 'Distribusi ke Dept. IT',  'tanggal' => date('Y-m-05'), 'created_at' => $now, 'updated_at' => $now],
            ['barang_id' => 2,  'jenis' => 'Masuk',  'jumlah' => 10, 'keterangan' => 'Restock monitor',         'tanggal' => date('Y-m-03'), 'created_at' => $now, 'updated_at' => $now],
            ['barang_id' => 2,  'jenis' => 'Keluar', 'jumlah' => 7,  'keterangan' => 'Distribusi ke ruang rapat', 'tanggal' => date('Y-m-10'), 'created_at' => $now, 'updated_at' => $now],
            ['barang_id' => 3,  'jenis' => 'Masuk',  'jumlah' => 30, 'keterangan' => 'Pembelian keyboard bulk', 'tanggal' => date('Y-m-02'), 'created_at' => $now, 'updated_at' => $now],
            ['barang_id' => 5,  'jenis' => 'Masuk',  'jumlah' => 30, 'keterangan' => 'Pembelian kursi baru',    'tanggal' => date('Y-m-04'), 'created_at' => $now, 'updated_at' => $now],
            ['barang_id' => 5,  'jenis' => 'Keluar', 'jumlah' => 5,  'keterangan' => 'Penggunaan ruang meeting', 'tanggal' => date('Y-m-15'), 'created_at' => $now, 'updated_at' => $now],
            ['barang_id' => 8,  'jenis' => 'Masuk',  'jumlah' => 100,'keterangan' => 'Pembelian kertas bulanan', 'tanggal' => date('Y-m-01'), 'created_at' => $now, 'updated_at' => $now],
            ['barang_id' => 8,  'jenis' => 'Keluar', 'jumlah' => 50, 'keterangan' => 'Distribusi semua divisi',  'tanggal' => date('Y-m-20'), 'created_at' => $now, 'updated_at' => $now],
            ['barang_id' => 12, 'jenis' => 'Masuk',  'jumlah' => 15, 'keterangan' => 'Pemasangan CCTV gedung',   'tanggal' => date('Y-m-08'), 'created_at' => $now, 'updated_at' => $now],
            ['barang_id' => 12, 'jenis' => 'Keluar', 'jumlah' => 3,  'keterangan' => 'Penggantian CCTV rusak',   'tanggal' => date('Y-m-12'), 'created_at' => $now, 'updated_at' => $now],
        ];

        $this->db->table('stock_histories')->insertBatch($data);
        echo "✅ StockHistorySeeder: " . count($data) . " riwayat stok berhasil dibuat.\n";
    }
}

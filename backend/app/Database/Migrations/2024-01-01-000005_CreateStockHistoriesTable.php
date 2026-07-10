<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * ============================================================
 * Migration: CreateStockHistoriesTable
 * ============================================================
 * Membuat tabel 'stock_histories' untuk menyimpan riwayat
 * pergerakan stok barang (masuk dan keluar).
 *
 * Berelasi ke:
 * - items (FK: barang_id)
 * ============================================================
 */
class CreateStockHistoriesTable extends Migration
{
    public function up(): void
    {
        $this->forge->addField([
            'id' => [
                'type'           => 'INT',
                'constraint'     => 11,
                'unsigned'       => true,
                'auto_increment' => true,
            ],
            'barang_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
                'null'       => false,
                'comment'    => 'FK ke tabel items',
            ],
            'jenis' => [
                'type'       => 'ENUM',
                'constraint' => ['Masuk', 'Keluar'],
                'null'       => false,
                'comment'    => 'Jenis pergerakan stok',
            ],
            'jumlah' => [
                'type'       => 'INT',
                'constraint' => 11,
                'null'       => false,
                'comment'    => 'Jumlah barang yang masuk/keluar',
            ],
            'keterangan' => [
                'type'    => 'TEXT',
                'null'    => true,
                'default' => null,
                'comment' => 'Catatan atau keterangan tambahan',
            ],
            'tanggal' => [
                'type'    => 'DATE',
                'null'    => false,
                'comment' => 'Tanggal transaksi stok',
            ],
            'created_at' => [
                'type' => 'TIMESTAMP',
                'null' => true,
            ],
            'updated_at' => [
                'type' => 'TIMESTAMP',
                'null' => true,
            ],
        ]);

        // Primary Key
        $this->forge->addKey('id', true);

        // Index untuk foreign key dan filter
        $this->forge->addKey('barang_id');
        $this->forge->addKey('jenis');
        $this->forge->addKey('tanggal');

        // Buat tabel
        $this->forge->createTable('stock_histories', true, ['ENGINE' => 'InnoDB']);

        // ----------------------------------------------------------
        // Tambahkan Foreign Key Constraints
        // ----------------------------------------------------------
        // FK: barang_id → items.id (CASCADE DELETE — histori ikut terhapus)
        $this->db->query('
            ALTER TABLE stock_histories
            ADD CONSTRAINT fk_stock_histories_barang
            FOREIGN KEY (barang_id) REFERENCES items(id)
            ON DELETE CASCADE ON UPDATE CASCADE
        ');
    }

    public function down(): void
    {
        $this->db->query('ALTER TABLE stock_histories DROP FOREIGN KEY fk_stock_histories_barang');
        $this->forge->dropTable('stock_histories', true);
    }
}

<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * ============================================================
 * Migration: CreateItemsTable
 * ============================================================
 * Membuat tabel 'items' untuk menyimpan data barang inventaris.
 *
 * Berelasi ke:
 * - categories (FK: kategori_id)
 * - suppliers  (FK: supplier_id)
 * ============================================================
 */
class CreateItemsTable extends Migration
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
            'kode_barang' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => false,
                'comment'    => 'Kode unik barang, misal: ITM-001',
            ],
            'nama_barang' => [
                'type'       => 'VARCHAR',
                'constraint' => 150,
                'null'       => false,
                'comment'    => 'Nama lengkap barang',
            ],
            'kategori_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
                'null'       => false,
                'comment'    => 'FK ke tabel categories',
            ],
            'supplier_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
                'null'       => false,
                'comment'    => 'FK ke tabel suppliers',
            ],
            'stok' => [
                'type'       => 'INT',
                'constraint' => 11,
                'null'       => false,
                'default'    => 0,
                'comment'    => 'Jumlah stok saat ini',
            ],
            'stok_minimum' => [
                'type'       => 'INT',
                'constraint' => 11,
                'null'       => false,
                'default'    => 0,
                'comment'    => 'Batas minimum stok untuk alert',
            ],
            'harga_beli' => [
                'type'       => 'DECIMAL',
                'constraint' => '15,2',
                'null'       => false,
                'default'    => 0.00,
                'comment'    => 'Harga pembelian barang',
            ],
            'harga_jual' => [
                'type'       => 'DECIMAL',
                'constraint' => '15,2',
                'null'       => false,
                'default'    => 0.00,
                'comment'    => 'Harga penjualan barang',
            ],
            'lokasi' => [
                'type'       => 'VARCHAR',
                'constraint' => 100,
                'null'       => true,
                'default'    => null,
                'comment'    => 'Lokasi penyimpanan barang',
            ],
            'kondisi' => [
                'type'       => 'ENUM',
                'constraint' => ['Baik', 'Rusak Ringan', 'Rusak Berat'],
                'null'       => false,
                'default'    => 'Baik',
                'comment'    => 'Kondisi fisik barang',
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

        // Unique: kode_barang tidak boleh duplikat
        $this->forge->addUniqueKey('kode_barang');

        // Index untuk foreign keys (performa query)
        $this->forge->addKey('kategori_id');
        $this->forge->addKey('supplier_id');

        // Buat tabel
        $this->forge->createTable('items', true, ['ENGINE' => 'InnoDB']);

        // ----------------------------------------------------------
        // Tambahkan Foreign Key Constraints
        // ----------------------------------------------------------
        // FK: kategori_id → categories.id
        $this->db->query('
            ALTER TABLE items
            ADD CONSTRAINT fk_items_kategori
            FOREIGN KEY (kategori_id) REFERENCES categories(id)
            ON DELETE RESTRICT ON UPDATE CASCADE
        ');

        // FK: supplier_id → suppliers.id
        $this->db->query('
            ALTER TABLE items
            ADD CONSTRAINT fk_items_supplier
            FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
            ON DELETE RESTRICT ON UPDATE CASCADE
        ');
    }

    public function down(): void
    {
        // Hapus foreign key sebelum drop tabel
        $this->db->query('ALTER TABLE items DROP FOREIGN KEY fk_items_kategori');
        $this->db->query('ALTER TABLE items DROP FOREIGN KEY fk_items_supplier');

        $this->forge->dropTable('items', true);
    }
}

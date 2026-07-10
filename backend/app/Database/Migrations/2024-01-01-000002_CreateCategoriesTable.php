<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * ============================================================
 * Migration: CreateCategoriesTable
 * ============================================================
 * Membuat tabel 'categories' untuk menyimpan kategori barang.
 * ============================================================
 */
class CreateCategoriesTable extends Migration
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
            'nama_kategori' => [
                'type'       => 'VARCHAR',
                'constraint' => 100,
                'null'       => false,
                'comment'    => 'Nama kategori barang',
            ],
            'deskripsi' => [
                'type'    => 'TEXT',
                'null'    => true,
                'default' => null,
                'comment' => 'Deskripsi kategori',
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

        $this->forge->addKey('id', true);
        $this->forge->addKey('nama_kategori');

        $this->forge->createTable('categories', true, ['ENGINE' => 'InnoDB']);
    }

    public function down(): void
    {
        $this->forge->dropTable('categories', true);
    }
}

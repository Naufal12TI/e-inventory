<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * ============================================================
 * Migration: CreateSuppliersTable
 * ============================================================
 * Membuat tabel 'suppliers' untuk menyimpan data pemasok.
 * ============================================================
 */
class CreateSuppliersTable extends Migration
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
            'nama_supplier' => [
                'type'       => 'VARCHAR',
                'constraint' => 100,
                'null'       => false,
                'comment'    => 'Nama perusahaan supplier',
            ],
            'alamat' => [
                'type'    => 'TEXT',
                'null'    => true,
                'default' => null,
                'comment' => 'Alamat lengkap supplier',
            ],
            'telepon' => [
                'type'       => 'VARCHAR',
                'constraint' => 20,
                'null'       => true,
                'default'    => null,
                'comment'    => 'Nomor telepon supplier',
            ],
            'email' => [
                'type'       => 'VARCHAR',
                'constraint' => 100,
                'null'       => true,
                'default'    => null,
                'comment'    => 'Alamat email supplier',
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
        $this->forge->addKey('nama_supplier');

        $this->forge->createTable('suppliers', true, ['ENGINE' => 'InnoDB']);
    }

    public function down(): void
    {
        $this->forge->dropTable('suppliers', true);
    }
}

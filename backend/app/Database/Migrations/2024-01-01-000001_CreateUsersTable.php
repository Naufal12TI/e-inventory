<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * ============================================================
 * Migration: CreateUsersTable
 * ============================================================
 * Membuat tabel 'users' untuk menyimpan data Administrator.
 *
 * Kolom tambahan 'token' digunakan untuk Bearer Token Auth.
 * ============================================================
 */
class CreateUsersTable extends Migration
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
            'username' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => false,
                'comment'    => 'Username unik untuk login',
            ],
            'password' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => false,
                'comment'    => 'Password terenkripsi (bcrypt)',
            ],
            'nama' => [
                'type'       => 'VARCHAR',
                'constraint' => 100,
                'null'       => false,
                'comment'    => 'Nama lengkap pengguna',
            ],
            'role' => [
                'type'       => 'ENUM',
                'constraint' => ['Administrator', 'Staff'],
                'default'    => 'Administrator',
                'comment'    => 'Role pengguna: Administrator atau Staff',
            ],
            'token' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
                'default'    => null,
                'comment'    => 'Bearer Token untuk autentikasi API',
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

        // Unique Index untuk username (tidak boleh duplikat)
        $this->forge->addUniqueKey('username');

        // Index untuk token (pencarian cepat saat validasi)
        $this->forge->addKey('token');

        // Buat tabel
        $this->forge->createTable('users', true, ['ENGINE' => 'InnoDB']);
    }

    public function down(): void
    {
        // Hapus tabel saat rollback
        $this->forge->dropTable('users', true);
    }
}

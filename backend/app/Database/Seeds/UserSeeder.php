<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

/**
 * ============================================================
 * UserSeeder
 * ============================================================
 * Membuat akun Administrator default untuk testing.
 *
 * Credentials:
 * Username : admin
 * Password : admin123
 * ============================================================
 */
class UserSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            [
                'username'   => 'admin',
                // password_hash('admin123', PASSWORD_BCRYPT)
                'password'   => password_hash('admin123', PASSWORD_BCRYPT),
                'nama'       => 'Administrator',
                'role'       => 'Administrator',
                'token'      => null,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'username'   => 'superadmin',
                'password'   => password_hash('super123', PASSWORD_BCRYPT),
                'nama'       => 'Super Administrator',
                'role'       => 'Administrator',
                'token'      => null,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'username'   => 'staff',
                'password'   => password_hash('staff123', PASSWORD_BCRYPT),
                'nama'       => 'Staff Gudang',
                'role'       => 'Staff',
                'token'      => null,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
        ];

        // Insert data ke tabel users
        $this->db->table('users')->insertBatch($data);

        echo "✅ UserSeeder: Default users (2 admin, 1 staff) berhasil dibuat.\n";
    }
}

<?php

namespace App\Models;

use CodeIgniter\Model;

/**
 * ============================================================
 * UserModel
 * ============================================================
 * Model untuk mengelola data pengguna (tabel: users).
 *
 * Digunakan untuk:
 * - Autentikasi login
 * - Validasi Bearer Token
 * - Manajemen profil admin
 * ============================================================
 */
class UserModel extends Model
{
    /** Nama tabel di database */
    protected $table = 'users';

    /** Primary key tabel */
    protected $primaryKey = 'id';

    /** Gunakan timestamps otomatis */
    protected $useTimestamps = true;

    /** Format return data */
    protected $returnType = 'array';

    /**
     * Kolom yang diizinkan untuk mass assignment.
     * Kolom di luar daftar ini tidak akan tersimpan.
     */
    protected $allowedFields = [
        'username',
        'password',
        'nama',
        'role',
        'token',
    ];

    /**
     * Field yang disembunyikan dari hasil query.
     * Password tidak akan muncul di response API.
     */
    protected $hiddenFields = ['password'];

    /**
     * Aturan validasi untuk TAMBAH user (password wajib).
     *
     * @var array<string, array<string, string>>
     */
    protected $validationRules = [
        'username' => [
            'label' => 'Username',
            'rules' => 'required|min_length[3]|max_length[50]|is_unique[users.username,id,{id}]',
        ],
        'password' => [
            'label' => 'Password',
            'rules' => 'required|min_length[6]',
        ],
        'nama' => [
            'label' => 'Nama',
            'rules' => 'required|max_length[100]',
        ],
        'role' => [
            'label' => 'Role',
            'rules' => 'required|in_list[Administrator,Staff]',
        ],
    ];

    /**
     * Aturan validasi untuk EDIT user (password opsional).
     */
    public array $validationRulesUpdate = [
        'username' => [
            'label' => 'Username',
            'rules' => 'required|min_length[3]|max_length[50]|is_unique[users.username,id,{id}]',
        ],
        'nama' => [
            'label' => 'Nama',
            'rules' => 'required|max_length[100]',
        ],
        'role' => [
            'label' => 'Role',
            'rules' => 'required|in_list[Administrator,Staff]',
        ],
    ];

    /**
     * Ambil semua user tanpa field sensitif.
     *
     * @return array Daftar user
     */
    public function getAllUsers(): array
    {
        return $this->select('id, username, nama, role, created_at, updated_at')
            ->orderBy('id', 'ASC')
            ->findAll();
    }

    /**
     * Cari user berdasarkan username.
     *
     * @param string $username Username yang dicari
     * @return array|null Data user atau null jika tidak ditemukan
     */
    public function findByUsername(string $username): ?array
    {
        // Nonaktifkan hidden fields agar password bisa dibandingkan
        return $this->builder()
            ->where('username', $username)
            ->get()
            ->getRowArray();
    }

    /**
     * Perbarui token Bearer untuk user tertentu.
     *
     * @param int    $userId ID user
     * @param string $token  Token baru
     */
    public function updateToken(int $userId, string $token): void
    {
        $this->update($userId, ['token' => $token]);
    }

    /**
     * Hapus token (logout) untuk user tertentu.
     *
     * @param int $userId ID user
     */
    public function clearToken(int $userId): void
    {
        $this->update($userId, ['token' => null]);
    }
}

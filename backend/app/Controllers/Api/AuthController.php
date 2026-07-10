<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\UserModel;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * ============================================================
 * AuthController
 * ============================================================
 * Controller untuk autentikasi pengguna.
 *
 * Endpoint:
 * - POST /api/login    → Login, generate token
 * - GET  /api/profile  → Profil user yang sedang login
 * - POST /api/logout   → Logout, hapus token
 * ============================================================
 */
class AuthController extends BaseController
{
    /** @var UserModel Model user */
    private UserModel $userModel;

    public function __construct()
    {
        $this->userModel = new UserModel();
    }

    // ============================================================
    // POST /api/login
    // ============================================================
    /**
     * Proses login pengguna.
     *
     * Request body (JSON):
     * {
     *   "username": "admin",
     *   "password": "password123"
     * }
     *
     * Response sukses:
     * {
     *   "status": true,
     *   "message": "Login berhasil.",
     *   "data": { "token": "...", "user": {...} }
     * }
     */
    public function login(): ResponseInterface
    {
        // Ambil data dari request body JSON
        $input = $this->request->getJSON(true);

        $username = trim($input['username'] ?? '');
        $password = trim($input['password'] ?? '');

        // Validasi input tidak boleh kosong
        if (empty($username) || empty($password)) {
            return $this->respond([
                'status'  => false,
                'message' => 'Username dan password wajib diisi.',
                'data'    => null,
            ], ResponseInterface::HTTP_BAD_REQUEST);
        }

        // Cari user berdasarkan username
        $user = $this->userModel->findByUsername($username);

        // Cek apakah user ditemukan dan password cocok
        if (!$user || !password_verify($password, $user['password'])) {
            return $this->respond([
                'status'  => false,
                'message' => 'Username atau password salah.',
                'data'    => null,
            ], ResponseInterface::HTTP_UNAUTHORIZED);
        }

        // Generate Bearer Token yang unik
        $token = $this->generateToken($user['id'], $user['username']);

        // Simpan token ke database
        $this->userModel->updateToken($user['id'], $token);

        // Hapus password dari data sebelum dikirim ke client
        unset($user['password']);

        return $this->respond([
            'status'  => true,
            'message' => 'Login berhasil.',
            'data'    => [
                'token' => $token,
                'user'  => $user,
            ],
        ], ResponseInterface::HTTP_OK);
    }

    // ============================================================
    // GET /api/profile
    // ============================================================
    /**
     * Ambil profil user yang sedang login.
     * Membutuhkan Bearer Token.
     */
    public function profile(): ResponseInterface
    {
        // Ambil token dari Authorization header
        $authHeader = $this->request->getHeaderLine('Authorization');

        if (empty($authHeader) || !preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
            return $this->respond([
                'status'  => false,
                'message' => 'Token tidak ditemukan.',
                'data'    => null,
            ], ResponseInterface::HTTP_UNAUTHORIZED);
        }

        $token = trim($matches[1]);

        // Cari user berdasarkan token
        $user = $this->userModel->where('token', $token)->first();

        if (!$user) {
            return $this->respond([
                'status'  => false,
                'message' => 'Token tidak valid.',
                'data'    => null,
            ], ResponseInterface::HTTP_UNAUTHORIZED);
        }

        // Hapus field sensitif
        unset($user['password'], $user['token']);

        return $this->respond([
            'status'  => true,
            'message' => 'Profil berhasil diambil.',
            'data'    => $user,
        ], ResponseInterface::HTTP_OK);
    }

    // ============================================================
    // POST /api/logout
    // ============================================================
    /**
     * Proses logout pengguna.
     * Menghapus token dari database.
     */
    public function logout(): ResponseInterface
    {
        $authHeader = $this->request->getHeaderLine('Authorization');

        if (!empty($authHeader) && preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
            $token = trim($matches[1]);
            $user  = $this->userModel->where('token', $token)->first();

            if ($user) {
                // Hapus token dari database
                $this->userModel->clearToken($user['id']);
            }
        }

        return $this->respond([
            'status'  => true,
            'message' => 'Logout berhasil.',
            'data'    => null,
        ], ResponseInterface::HTTP_OK);
    }

    // ============================================================
    // PRIVATE HELPER
    // ============================================================
    /**
     * Generate Bearer Token yang unik menggunakan hash SHA-256.
     *
     * @param int    $userId   ID user
     * @param string $username Username
     * @return string Token 64 karakter
     */
    private function generateToken(int $userId, string $username): string
    {
        return hash('sha256', $userId . $username . time() . bin2hex(random_bytes(16)));
    }

    // ============================================================
    // PUT /api/profile
    // ============================================================
    /**
     * Update profil user yang sedang login (nama & username).
     */
    public function updateProfile(): ResponseInterface
    {
        $authHeader = $this->request->getHeaderLine('Authorization');

        if (empty($authHeader) || !preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
            return $this->respond(['status' => false, 'message' => 'Token tidak ditemukan.', 'data' => null], ResponseInterface::HTTP_UNAUTHORIZED);
        }

        $token = trim($matches[1]);
        $user  = $this->userModel->where('token', $token)->first();

        if (!$user) {
            return $this->respond(['status' => false, 'message' => 'Token tidak valid.', 'data' => null], ResponseInterface::HTTP_UNAUTHORIZED);
        }

        $input    = $this->request->getJSON(true);
        $nama     = trim($input['nama'] ?? '');
        $username = trim($input['username'] ?? '');

        if (empty($nama) || empty($username)) {
            return $this->respond(['status' => false, 'message' => 'Nama dan username wajib diisi.', 'data' => null], ResponseInterface::HTTP_BAD_REQUEST);
        }

        // Cek username tidak dipakai user lain
        $existing = $this->userModel->where('username', $username)->where('id !=', $user['id'])->first();
        if ($existing) {
            return $this->respond(['status' => false, 'message' => 'Username sudah digunakan user lain.', 'data' => null], ResponseInterface::HTTP_BAD_REQUEST);
        }

        $this->userModel->update($user['id'], ['nama' => $nama, 'username' => $username]);

        $updated = $this->userModel->select('id, username, nama, role')->find($user['id']);

        return $this->respond([
            'status'  => true,
            'message' => 'Profil berhasil diperbarui.',
            'data'    => $updated,
        ], ResponseInterface::HTTP_OK);
    }

    // ============================================================
    // PUT /api/profile/password
    // ============================================================
    /**
     * Ganti password user yang sedang login.
     * Butuh password lama untuk verifikasi.
     */
    public function changePassword(): ResponseInterface
    {
        $authHeader = $this->request->getHeaderLine('Authorization');

        if (empty($authHeader) || !preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
            return $this->respond(['status' => false, 'message' => 'Token tidak ditemukan.', 'data' => null], ResponseInterface::HTTP_UNAUTHORIZED);
        }

        $token = trim($matches[1]);
        // Ambil dengan password (bypass hiddenFields)
        $user  = $this->userModel->builder()->where('token', $token)->get()->getRowArray();

        if (!$user) {
            return $this->respond(['status' => false, 'message' => 'Token tidak valid.', 'data' => null], ResponseInterface::HTTP_UNAUTHORIZED);
        }

        $input       = $this->request->getJSON(true);
        $oldPassword = $input['old_password'] ?? '';
        $newPassword = $input['new_password'] ?? '';

        if (empty($oldPassword) || empty($newPassword)) {
            return $this->respond(['status' => false, 'message' => 'Password lama dan baru wajib diisi.', 'data' => null], ResponseInterface::HTTP_BAD_REQUEST);
        }

        if (!password_verify($oldPassword, $user['password'])) {
            return $this->respond(['status' => false, 'message' => 'Password lama tidak cocok.', 'data' => null], ResponseInterface::HTTP_BAD_REQUEST);
        }

        if (strlen($newPassword) < 6) {
            return $this->respond(['status' => false, 'message' => 'Password baru minimal 6 karakter.', 'data' => null], ResponseInterface::HTTP_BAD_REQUEST);
        }

        $this->userModel->update($user['id'], [
            'password' => password_hash($newPassword, PASSWORD_DEFAULT),
        ]);

        return $this->respond([
            'status'  => true,
            'message' => 'Password berhasil diubah.',
            'data'    => null,
        ], ResponseInterface::HTTP_OK);
    }
}

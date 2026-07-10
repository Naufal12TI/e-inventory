<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\UserModel;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * ============================================================
 * UserController — Resource Controller
 * ============================================================
 * Controller untuk mengelola data pengguna sistem.
 *
 * Endpoint:
 * GET    /api/users          → index()   — Semua user
 * GET    /api/users/:id      → show()    — Satu user
 * POST   /api/users          → create()  — Tambah user
 * PUT    /api/users/:id      → update()  — Edit user
 * DELETE /api/users/:id      → delete()  — Hapus user
 * ============================================================
 */
class UserController extends BaseController
{
    private UserModel $userModel;

    public function __construct()
    {
        $this->userModel = new UserModel();
    }

    /**
     * Helper: Memastikan pengguna adalah Administrator.
     */
    private function checkAdmin(): ?ResponseInterface
    {
        $currentUser = $this->request->user ?? null;
        if (!$currentUser || $currentUser['role'] !== 'Administrator') {
            return $this->respond([
                'status'  => false,
                'message' => 'Akses ditolak. Menu ini hanya untuk Administrator.',
                'data'    => null,
            ], ResponseInterface::HTTP_FORBIDDEN);
        }
        return null;
    }

    // ============================================================
    // GET /api/users
    // ============================================================
    /**
     * Tampilkan semua user.
     */
    public function index(): ResponseInterface
    {
        if ($forbidden = $this->checkAdmin()) {
            return $forbidden;
        }

        $users = $this->userModel->getAllUsers();

        return $this->respond([
            'status'  => true,
            'message' => 'Data user berhasil diambil.',
            'data'    => $users,
        ], ResponseInterface::HTTP_OK);
    }

    // ============================================================
    // GET /api/users/:id
    // ============================================================
    /**
     * Tampilkan satu user.
     *
     * @param int|null $id ID user
     */
    public function show($id = null): ResponseInterface
    {
        if ($forbidden = $this->checkAdmin()) {
            return $forbidden;
        }

        $user = $this->userModel->select('id, username, nama, role, created_at, updated_at')->find($id);

        if (!$user) {
            return $this->respond([
                'status'  => false,
                'message' => 'User tidak ditemukan.',
                'data'    => null,
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        return $this->respond([
            'status'  => true,
            'message' => 'Data user berhasil diambil.',
            'data'    => $user,
        ], ResponseInterface::HTTP_OK);
    }

    // ============================================================
    // POST /api/users
    // ============================================================
    /**
     * Tambah user baru.
     *
     * Request body (JSON):
     * {
     *   "username": "john",
     *   "password": "secret123",
     *   "nama": "John Doe",
     *   "role": "Staff"
     * }
     */
    public function create(): ResponseInterface
    {
        if ($forbidden = $this->checkAdmin()) {
            return $forbidden;
        }

        $input = $this->request->getJSON(true);

        // ─── Validasi via Services::validation() ─────────────────────
        // is_unique tanpa exclude (untuk tambah user baru, semua username harus unik)
        $validation = \Config\Services::validation();
        $validation->setRules([
            'username' => 'required|min_length[3]|max_length[50]|is_unique[users.username]',
            'password' => 'required|min_length[6]',
            'nama'     => 'required|max_length[100]',
            'role'     => 'required|in_list[Administrator,Staff]',
        ]);

        if (! $validation->run($input)) {
            return $this->respond([
                'status'  => false,
                'message' => 'Validasi gagal.',
                'data'    => $validation->getErrors(),
            ], ResponseInterface::HTTP_BAD_REQUEST);
        }

        // Hash password dan simpan
        $this->userModel->skipValidation(true)->insert([
            'username' => $input['username'],
            'password' => password_hash($input['password'], PASSWORD_DEFAULT),
            'nama'     => $input['nama'],
            'role'     => $input['role'] ?? 'Staff',
        ]);

        $newId = $this->userModel->getInsertID();
        $user  = $this->userModel->select('id, username, nama, role, created_at')->find($newId);

        return $this->respond([
            'status'  => true,
            'message' => 'User berhasil ditambahkan.',
            'data'    => $user,
        ], ResponseInterface::HTTP_CREATED);
    }


    // ============================================================
    // PUT /api/users/:id
    // ============================================================
    /**
     * Update data user.
     * Password opsional — jika dikosongkan, password tidak berubah.
     *
     * @param int|null $id ID user
     */
    public function update($id = null): ResponseInterface
    {
        if ($forbidden = $this->checkAdmin()) {
            return $forbidden;
        }

        $user = $this->userModel->find($id);

        if (!$user) {
            return $this->respond([
                'status'  => false,
                'message' => 'User tidak ditemukan.',
                'data'    => null,
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        $input = $this->request->getJSON(true);

        // Validasi username unik, skip baris dengan id yang sama
        $validation = \Config\Services::validation();
        $validation->setRules([
            'username' => "required|min_length[3]|max_length[50]|is_unique[users.username,id,{$id}]",
            'nama'     => 'required|max_length[100]',
            'role'     => 'required|in_list[Administrator,Staff]',
        ]);

        if (! $validation->run($input)) {
            return $this->respond([
                'status'  => false,
                'message' => 'Validasi gagal.',
                'data'    => $validation->getErrors(),
            ], ResponseInterface::HTTP_BAD_REQUEST);
        }

        $updateData = [
            'username' => $input['username'],
            'nama'     => $input['nama'],
            'role'     => $input['role'] ?? $user['role'],
        ];

        // Update password hanya jika diisi
        if (!empty($input['password'])) {
            if (strlen($input['password']) < 6) {
                return $this->respond([
                    'status'  => false,
                    'message' => 'Password minimal 6 karakter.',
                    'data'    => null,
                ], ResponseInterface::HTTP_BAD_REQUEST);
            }
            $updateData['password'] = password_hash($input['password'], PASSWORD_DEFAULT);
        }

        $this->userModel->skipValidation(true)->update($id, $updateData);

        $updated = $this->userModel->select('id, username, nama, role, created_at, updated_at')->find($id);

        return $this->respond([
            'status'  => true,
            'message' => 'User berhasil diperbarui.',
            'data'    => $updated,
        ], ResponseInterface::HTTP_OK);
    }


    // ============================================================
    // DELETE /api/users/:id
    // ============================================================
    /**
     * Hapus user.
     * Tidak bisa menghapus user yang sedang login.
     *
     * @param int|null $id ID user
     */
    public function delete($id = null): ResponseInterface
    {
        if ($forbidden = $this->checkAdmin()) {
            return $forbidden;
        }

        $user = $this->userModel->find($id);

        if (!$user) {
            return $this->respond([
                'status'  => false,
                'message' => 'User tidak ditemukan.',
                'data'    => null,
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        // Cek apakah ini user yang sedang login (dari token)
        $authHeader = $this->request->getHeaderLine('Authorization');
        if (!empty($authHeader) && preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
            $token   = trim($matches[1]);
            $current = $this->userModel->where('token', $token)->first();
            if ($current && (int) $current['id'] === (int) $id) {
                return $this->respond([
                    'status'  => false,
                    'message' => 'Tidak bisa menghapus akun yang sedang digunakan.',
                    'data'    => null,
                ], ResponseInterface::HTTP_BAD_REQUEST);
            }
        }

        $this->userModel->delete($id);

        return $this->respond([
            'status'  => true,
            'message' => 'User berhasil dihapus.',
            'data'    => null,
        ], ResponseInterface::HTTP_OK);
    }
}

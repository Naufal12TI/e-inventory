<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use App\Models\UserModel;

/**
 * ============================================================
 * AuthFilter
 * ============================================================
 * Filter untuk memvalidasi Bearer Token pada setiap request
 * yang memerlukan autentikasi (POST, PUT, DELETE).
 *
 * Cara kerja:
 * 1. Ambil header Authorization dari request
 * 2. Ekstrak token dari "Bearer <token>"
 * 3. Cari token di database (tabel users)
 * 4. Jika tidak valid → return 401 Unauthorized
 * ============================================================
 */
class AuthFilter implements FilterInterface
{
    /**
     * Validasi token sebelum request masuk ke controller.
     */
    public function before(RequestInterface $request, $arguments = null)
    {
        // Ambil header Authorization
        $authHeader = $request->getHeaderLine('Authorization');

        // Cek apakah header ada
        if (empty($authHeader)) {
            return $this->unauthorizedResponse('Token tidak ditemukan. Silakan login terlebih dahulu.');
        }

        // Format header harus: "Bearer <token>"
        if (!preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
            return $this->unauthorizedResponse('Format token tidak valid. Gunakan format: Bearer <token>');
        }

        // Ekstrak token dari header
        $token = trim($matches[1]);

        // Cari user berdasarkan token di database
        $userModel = new UserModel();
        $user      = $userModel->where('token', $token)->first();

        // Jika token tidak ditemukan di database
        if (!$user) {
            return $this->unauthorizedResponse('Token tidak valid atau sudah kedaluwarsa.');
        }

        // Simpan data user ke dalam request agar bisa diakses di controller
        // Gunakan: $this->request->user
        $request->user = $user;
    }

    /**
     * Tidak ada tindakan setelah request.
     */
    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // Tidak diperlukan tindakan setelah request
    }

    /**
     * Helper: Buat response 401 Unauthorized.
     *
     * @param string $message Pesan error
     * @return ResponseInterface
     */
    private function unauthorizedResponse(string $message): ResponseInterface
    {
        $response = service('response');

        // WAJIB: Tambahkan CORS header pada response 401 agar browser
        // tidak memblokir response ini sebagai CORS error.
        // Tanpa ini, frontend hanya menerima CORS error, bukan 401.
        $response->setHeader('Access-Control-Allow-Origin', '*');
        $response->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        $response->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

        return $response
            ->setStatusCode(401)
            ->setContentType('application/json')
            ->setJSON([
                'status'  => false,
                'message' => $message,
                'data'    => null,
            ]);
    }
}

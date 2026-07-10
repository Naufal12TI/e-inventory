<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\CategoryModel;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * ============================================================
 * CategoryController — Resource Controller
 * ============================================================
 * Controller untuk mengelola data kategori barang.
 *
 * Endpoint (via resource routing):
 * GET    /api/categories          → index()  — Semua kategori
 * GET    /api/categories/:id      → show()   — Satu kategori
 * POST   /api/categories          → create() — Tambah kategori
 * PUT    /api/categories/:id      → update() — Edit kategori
 * DELETE /api/categories/:id      → delete() — Hapus kategori
 * ============================================================
 */
class CategoryController extends BaseController
{
    /** @var CategoryModel Model kategori */
    private CategoryModel $categoryModel;

    public function __construct()
    {
        $this->categoryModel = new CategoryModel();
    }

    // ============================================================
    // GET /api/categories
    // ============================================================
    /**
     * Tampilkan semua kategori.
     * Mendukung parameter ?search=keyword untuk pencarian.
     */
    public function index(): ResponseInterface
    {
        $keyword = $this->request->getGet('search');

        // Jika ada kata kunci pencarian, gunakan metode search
        if (!empty($keyword)) {
            $categories = $this->categoryModel->search($keyword);
        } else {
            $categories = $this->categoryModel->orderBy('nama_kategori', 'ASC')->findAll();
        }

        return $this->respond([
            'status'  => true,
            'message' => 'Data kategori berhasil diambil.',
            'data'    => $categories,
        ], ResponseInterface::HTTP_OK);
    }

    // ============================================================
    // GET /api/categories/:id
    // ============================================================
    /**
     * Tampilkan satu kategori berdasarkan ID.
     *
     * @param int $id ID kategori
     */
    public function show($id = null): ResponseInterface
    {
        $category = $this->categoryModel->find($id);

        if (!$category) {
            return $this->respond([
                'status'  => false,
                'message' => 'Kategori tidak ditemukan.',
                'data'    => null,
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        return $this->respond([
            'status'  => true,
            'message' => 'Data kategori berhasil diambil.',
            'data'    => $category,
        ], ResponseInterface::HTTP_OK);
    }

    // ============================================================
    // POST /api/categories
    // ============================================================
    /**
     * Tambah kategori baru.
     *
     * Request body (JSON):
     * {
     *   "nama_kategori": "Elektronik",
     *   "deskripsi": "..."
     * }
     */
    public function create(): ResponseInterface
    {
        $input = $this->request->getJSON(true);

        // Validasi data input
        if (!$this->categoryModel->validate($input)) {
            return $this->respond([
                'status'  => false,
                'message' => 'Validasi gagal.',
                'data'    => $this->categoryModel->errors(),
            ], ResponseInterface::HTTP_BAD_REQUEST);
        }

        // Simpan data ke database
        $this->categoryModel->insert([
            'nama_kategori' => $input['nama_kategori'],
            'deskripsi'     => $input['deskripsi'] ?? null,
        ]);

        $newId    = $this->categoryModel->getInsertID();
        $category = $this->categoryModel->find($newId);

        return $this->respond([
            'status'  => true,
            'message' => 'Kategori berhasil ditambahkan.',
            'data'    => $category,
        ], ResponseInterface::HTTP_CREATED);
    }

    // ============================================================
    // PUT /api/categories/:id
    // ============================================================
    /**
     * Update data kategori.
     *
     * @param int $id ID kategori
     */
    public function update($id = null): ResponseInterface
    {
        // Cek apakah kategori ada
        $category = $this->categoryModel->find($id);

        if (!$category) {
            return $this->respond([
                'status'  => false,
                'message' => 'Kategori tidak ditemukan.',
                'data'    => null,
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        $input = $this->request->getJSON(true);

        // Validasi (gunakan ID untuk skip unique check pada diri sendiri)
        if (!$this->categoryModel->validate($input)) {
            return $this->respond([
                'status'  => false,
                'message' => 'Validasi gagal.',
                'data'    => $this->categoryModel->errors(),
            ], ResponseInterface::HTTP_BAD_REQUEST);
        }

        $this->categoryModel->update($id, [
            'nama_kategori' => $input['nama_kategori'],
            'deskripsi'     => $input['deskripsi'] ?? null,
        ]);

        $updatedCategory = $this->categoryModel->find($id);

        return $this->respond([
            'status'  => true,
            'message' => 'Kategori berhasil diperbarui.',
            'data'    => $updatedCategory,
        ], ResponseInterface::HTTP_OK);
    }

    // ============================================================
    // DELETE /api/categories/:id
    // ============================================================
    /**
     * Hapus kategori.
     * Tidak bisa hapus jika masih digunakan oleh barang.
     *
     * @param int $id ID kategori
     */
    public function delete($id = null): ResponseInterface
    {
        $category = $this->categoryModel->find($id);

        if (!$category) {
            return $this->respond([
                'status'  => false,
                'message' => 'Kategori tidak ditemukan.',
                'data'    => null,
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        // Cek apakah kategori masih digunakan oleh barang
        if ($this->categoryModel->isUsedByItems((int) $id)) {
            return $this->respond([
                'status'  => false,
                'message' => 'Kategori tidak dapat dihapus karena masih digunakan oleh barang.',
                'data'    => null,
            ], ResponseInterface::HTTP_CONFLICT);
        }

        $this->categoryModel->delete($id);

        return $this->respond([
            'status'  => true,
            'message' => 'Kategori berhasil dihapus.',
            'data'    => null,
        ], ResponseInterface::HTTP_OK);
    }
}

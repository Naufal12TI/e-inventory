<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\SupplierModel;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * ============================================================
 * SupplierController — Resource Controller
 * ============================================================
 * Controller untuk mengelola data supplier.
 *
 * Endpoint:
 * GET    /api/suppliers          → index()
 * GET    /api/suppliers/:id      → show()
 * POST   /api/suppliers          → create()
 * PUT    /api/suppliers/:id      → update()
 * DELETE /api/suppliers/:id      → delete()
 * ============================================================
 */
class SupplierController extends BaseController
{
    private SupplierModel $supplierModel;

    public function __construct()
    {
        $this->supplierModel = new SupplierModel();
    }

    // GET /api/suppliers
    public function index(): ResponseInterface
    {
        $keyword = $this->request->getGet('search');

        $suppliers = !empty($keyword)
            ? $this->supplierModel->search($keyword)
            : $this->supplierModel->orderBy('nama_supplier', 'ASC')->findAll();

        return $this->respond([
            'status'  => true,
            'message' => 'Data supplier berhasil diambil.',
            'data'    => $suppliers,
        ], ResponseInterface::HTTP_OK);
    }

    // GET /api/suppliers/:id
    public function show($id = null): ResponseInterface
    {
        $supplier = $this->supplierModel->find($id);

        if (!$supplier) {
            return $this->respond([
                'status'  => false,
                'message' => 'Supplier tidak ditemukan.',
                'data'    => null,
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        return $this->respond([
            'status'  => true,
            'message' => 'Data supplier berhasil diambil.',
            'data'    => $supplier,
        ], ResponseInterface::HTTP_OK);
    }

    // POST /api/suppliers
    public function create(): ResponseInterface
    {
        $input = $this->request->getJSON(true);

        if (!$this->supplierModel->validate($input)) {
            return $this->respond([
                'status'  => false,
                'message' => 'Validasi gagal.',
                'data'    => $this->supplierModel->errors(),
            ], ResponseInterface::HTTP_BAD_REQUEST);
        }

        $this->supplierModel->insert([
            'nama_supplier' => $input['nama_supplier'],
            'alamat'        => $input['alamat'] ?? null,
            'telepon'       => $input['telepon'] ?? null,
            'email'         => $input['email'] ?? null,
        ]);

        $newId    = $this->supplierModel->getInsertID();
        $supplier = $this->supplierModel->find($newId);

        return $this->respond([
            'status'  => true,
            'message' => 'Supplier berhasil ditambahkan.',
            'data'    => $supplier,
        ], ResponseInterface::HTTP_CREATED);
    }

    // PUT /api/suppliers/:id
    public function update($id = null): ResponseInterface
    {
        $supplier = $this->supplierModel->find($id);

        if (!$supplier) {
            return $this->respond([
                'status'  => false,
                'message' => 'Supplier tidak ditemukan.',
                'data'    => null,
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        $input = $this->request->getJSON(true);

        if (!$this->supplierModel->validate($input)) {
            return $this->respond([
                'status'  => false,
                'message' => 'Validasi gagal.',
                'data'    => $this->supplierModel->errors(),
            ], ResponseInterface::HTTP_BAD_REQUEST);
        }

        $this->supplierModel->update($id, [
            'nama_supplier' => $input['nama_supplier'],
            'alamat'        => $input['alamat'] ?? null,
            'telepon'       => $input['telepon'] ?? null,
            'email'         => $input['email'] ?? null,
        ]);

        return $this->respond([
            'status'  => true,
            'message' => 'Supplier berhasil diperbarui.',
            'data'    => $this->supplierModel->find($id),
        ], ResponseInterface::HTTP_OK);
    }

    // DELETE /api/suppliers/:id
    public function delete($id = null): ResponseInterface
    {
        $supplier = $this->supplierModel->find($id);

        if (!$supplier) {
            return $this->respond([
                'status'  => false,
                'message' => 'Supplier tidak ditemukan.',
                'data'    => null,
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        // Cek apakah supplier masih digunakan
        if ($this->supplierModel->isUsedByItems((int) $id)) {
            return $this->respond([
                'status'  => false,
                'message' => 'Supplier tidak dapat dihapus karena masih digunakan oleh barang.',
                'data'    => null,
            ], ResponseInterface::HTTP_CONFLICT);
        }

        $this->supplierModel->delete($id);

        return $this->respond([
            'status'  => true,
            'message' => 'Supplier berhasil dihapus.',
            'data'    => null,
        ], ResponseInterface::HTTP_OK);
    }
}

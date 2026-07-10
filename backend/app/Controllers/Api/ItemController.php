<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\ItemModel;
use App\Models\StockHistoryModel;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * ============================================================
 * ItemController — Resource Controller
 * ============================================================
 * Controller untuk mengelola data barang inventaris.
 *
 * Endpoint:
 * GET    /api/items              → index()  — Semua barang (filter/search/sort)
 * GET    /api/items/:id          → show()   — Satu barang
 * POST   /api/items              → create() — Tambah barang
 * PUT    /api/items/:id          → update() — Edit barang
 * DELETE /api/items/:id          → delete() — Hapus barang
 * ============================================================
 */
class ItemController extends BaseController
{
    private ItemModel $itemModel;

    public function __construct()
    {
        $this->itemModel = new ItemModel();
    }

    // ============================================================
    // GET /api/items
    // ============================================================
    /**
     * Tampilkan semua barang dengan dukungan:
     * - ?search=       Pencarian nama/kode barang
     * - ?kategori_id=  Filter per kategori
     * - ?supplier_id=  Filter per supplier
     * - ?kondisi=      Filter per kondisi
     * - ?sort=         Field pengurutan (default: created_at)
     * - ?order=        Arah pengurutan ASC/DESC (default: DESC)
     */
    public function index(): ResponseInterface
    {
        // Ambil semua parameter query string
        $params = [
            'search'      => $this->request->getGet('search'),
            'kategori_id' => $this->request->getGet('kategori_id'),
            'supplier_id' => $this->request->getGet('supplier_id'),
            'kondisi'     => $this->request->getGet('kondisi'),
            'sort'        => $this->request->getGet('sort'),
            'order'       => $this->request->getGet('order'),
        ];

        $items = $this->itemModel->getItemsWithRelations($params);

        return $this->respond([
            'status'  => true,
            'message' => 'Data barang berhasil diambil.',
            'data'    => $items,
        ], ResponseInterface::HTTP_OK);
    }

    // ============================================================
    // GET /api/items/:id
    // ============================================================
    /**
     * Tampilkan satu barang beserta nama kategori dan supplier.
     *
     * @param int|null $id ID barang
     */
    public function show($id = null): ResponseInterface
    {
        $item = $this->itemModel->getItemWithRelations((int) $id);

        if (!$item) {
            return $this->respond([
                'status'  => false,
                'message' => 'Barang tidak ditemukan.',
                'data'    => null,
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        return $this->respond([
            'status'  => true,
            'message' => 'Data barang berhasil diambil.',
            'data'    => $item,
        ], ResponseInterface::HTTP_OK);
    }

    // ============================================================
    // POST /api/items
    // ============================================================
    /**
     * Tambah barang baru.
     * Jika kode_barang tidak dikirim, akan di-generate otomatis.
     */
    public function create(): ResponseInterface
    {
        $input = $this->request->getJSON(true);

        // Auto-generate kode barang jika tidak ada
        if (empty($input['kode_barang'])) {
            $input['kode_barang'] = $this->itemModel->generateKodeBarang();
        }

        // Validasi data input
        if (!$this->itemModel->validate($input)) {
            return $this->respond([
                'status'  => false,
                'message' => 'Validasi gagal.',
                'data'    => $this->itemModel->errors(),
            ], ResponseInterface::HTTP_BAD_REQUEST);
        }

        // Simpan barang baru
        $this->itemModel->insert([
            'kode_barang'  => $input['kode_barang'],
            'nama_barang'  => $input['nama_barang'],
            'kategori_id'  => $input['kategori_id'],
            'supplier_id'  => $input['supplier_id'],
            'stok'         => $input['stok'] ?? 0,
            'stok_minimum' => $input['stok_minimum'] ?? 0,
            'harga_beli'   => $input['harga_beli'] ?? 0,
            'harga_jual'   => $input['harga_jual'] ?? 0,
            'lokasi'       => $input['lokasi'] ?? null,
            'kondisi'      => $input['kondisi'] ?? 'Baik',
        ]);

        $newId = $this->itemModel->getInsertID();
        $item  = $this->itemModel->getItemWithRelations($newId);

        return $this->respond([
            'status'  => true,
            'message' => 'Barang berhasil ditambahkan.',
            'data'    => $item,
        ], ResponseInterface::HTTP_CREATED);
    }

    // ============================================================
    // PUT /api/items/:id
    // ============================================================
    /**
     * Update data barang.
     *
     * @param int|null $id ID barang
     */
    public function update($id = null): ResponseInterface
    {
        $item = $this->itemModel->find($id);

        if (!$item) {
            return $this->respond([
                'status'  => false,
                'message' => 'Barang tidak ditemukan.',
                'data'    => null,
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        $input = $this->request->getJSON(true);

        // ─── Validasi Manual via Services::validation() ──────────────
        // Menggunakan CI4 Validation service secara langsung untuk memastikan
        // is_unique melewati ID barang yang sedang diedit (bukan dari model).
        $validation = \Config\Services::validation();
        $validation->setRules([
            'kode_barang'  => "required|max_length[50]|is_unique[items.kode_barang,id,{$id}]",
            'nama_barang'  => 'required|max_length[150]',
            'kategori_id'  => 'required|integer|is_not_unique[categories.id]',
            'supplier_id'  => 'required|integer|is_not_unique[suppliers.id]',
            'stok'         => 'required|integer|greater_than_equal_to[0]',
            'stok_minimum' => 'required|integer|greater_than_equal_to[0]',
            'harga_beli'   => 'required|decimal|greater_than_equal_to[0]',
            'harga_jual'   => 'required|decimal|greater_than_equal_to[0]',
            'kondisi'      => 'required|in_list[Baik,Rusak Ringan,Rusak Berat]',
        ]);

        if (! $validation->run($input)) {
            return $this->respond([
                'status'  => false,
                'message' => 'Validasi gagal.',
                'data'    => $validation->getErrors(),
            ], ResponseInterface::HTTP_BAD_REQUEST);
        }

        // ─── Simpan perubahan ─────────────────────────────────────────
        $this->itemModel->skipValidation(true)->update($id, [
            'kode_barang'  => $input['kode_barang'],
            'nama_barang'  => $input['nama_barang'],
            'kategori_id'  => $input['kategori_id'],
            'supplier_id'  => $input['supplier_id'],
            'stok'         => $input['stok'],
            'stok_minimum' => $input['stok_minimum'],
            'harga_beli'   => $input['harga_beli'],
            'harga_jual'   => $input['harga_jual'],
            'lokasi'       => $input['lokasi'] ?? null,
            'kondisi'      => $input['kondisi'],
        ]);

        return $this->respond([
            'status'  => true,
            'message' => 'Barang berhasil diperbarui.',
            'data'    => $this->itemModel->getItemWithRelations((int) $id),
        ], ResponseInterface::HTTP_OK);
    }


    // ============================================================
    // DELETE /api/items/:id
    // ============================================================
    /**
     * Hapus barang.
     * Riwayat stok akan terhapus otomatis (CASCADE).
     *
     * @param int|null $id ID barang
     */
    public function delete($id = null): ResponseInterface
    {
        $item = $this->itemModel->find($id);

        if (!$item) {
            return $this->respond([
                'status'  => false,
                'message' => 'Barang tidak ditemukan.',
                'data'    => null,
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        $this->itemModel->delete($id);

        return $this->respond([
            'status'  => true,
            'message' => 'Barang berhasil dihapus.',
            'data'    => null,
        ], ResponseInterface::HTTP_OK);
    }

    // ============================================================
    // GET /api/items/export
    // ============================================================
    /**
     * Export data barang ke Excel XML.
     */
    public function export(): ResponseInterface
    {
        $params = [
            'search'      => $this->request->getGet('search'),
            'kategori_id' => $this->request->getGet('kategori_id'),
            'supplier_id' => $this->request->getGet('supplier_id'),
            'kondisi'     => $this->request->getGet('kondisi'),
            'sort'        => $this->request->getGet('sort'),
            'order'       => $this->request->getGet('order'),
        ];

        $items = $this->itemModel->getItemsWithRelations($params);

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<?mso-application progid="Excel.Sheet"?>' . "\n";
        $xml .= '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ' . "\n";
        $xml .= ' xmlns:o="urn:schemas-microsoft-com:office:office" ' . "\n";
        $xml .= ' xmlns:x="urn:schemas-microsoft-com:office:excel" ' . "\n";
        $xml .= ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ' . "\n";
        $xml .= ' xmlns:html="http://www.w3.org/TR/REC-html40">' . "\n";
        $xml .= ' <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">' . "\n";
        $xml .= '  <Author>E-Inventory</Author>' . "\n";
        $xml .= '  <Created>' . date('Y-m-d\TH:i:s\Z') . '</Created>' . "\n";
        $xml .= ' </DocumentProperties>' . "\n";
        $xml .= ' <Styles>' . "\n";
        $xml .= '  <Style ss:ID="Default" ss:Name="Normal">' . "\n";
        $xml .= '   <Alignment ss:Vertical="Bottom"/>' . "\n";
        $xml .= '   <Borders/>' . "\n";
        $xml .= '   <Font ss:FontName="Calibri" x:CharSet="1" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>' . "\n";
        $xml .= '   <Interior/>' . "\n";
        $xml .= '   <NumberFormat/>' . "\n";
        $xml .= '   <Protection/>' . "\n";
        $xml .= '  </Style>' . "\n";
        $xml .= '  <Style ss:ID="Header">' . "\n";
        $xml .= '   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>' . "\n";
        $xml .= '   <Interior ss:Color="#1E3A8A" ss:Pattern="Solid"/>' . "\n";
        $xml .= '  </Style>' . "\n";
        $xml .= ' </Styles>' . "\n";
        $xml .= ' <Worksheet ss:Name="Data Barang">' . "\n";
        $xml .= '  <Table>' . "\n";
        
        // Header
        $xml .= '   <Row ss:Height="22">' . "\n";
        $headers = ['Kode Barang', 'Nama Barang', 'Kategori', 'Supplier', 'Stok', 'Stok Minimum', 'Harga Beli', 'Harga Jual', 'Lokasi', 'Kondisi'];
        foreach ($headers as $h) {
            $xml .= '    <Cell ss:StyleID="Header"><Data ss:Type="String">' . htmlspecialchars($h) . '</Data></Cell>' . "\n";
        }
        $xml .= '   </Row>' . "\n";

        // Data Rows
        foreach ($items as $item) {
            $xml .= '   <Row>' . "\n";
            $xml .= '    <Cell><Data ss:Type="String">' . htmlspecialchars($item['kode_barang'] ?? '') . '</Data></Cell>' . "\n";
            $xml .= '    <Cell><Data ss:Type="String">' . htmlspecialchars($item['nama_barang'] ?? '') . '</Data></Cell>' . "\n";
            $xml .= '    <Cell><Data ss:Type="String">' . htmlspecialchars($item['nama_kategori'] ?? '-') . '</Data></Cell>' . "\n";
            $xml .= '    <Cell><Data ss:Type="String">' . htmlspecialchars($item['nama_supplier'] ?? '-') . '</Data></Cell>' . "\n";
            $xml .= '    <Cell><Data ss:Type="Number">' . (int)($item['stok'] ?? 0) . '</Data></Cell>' . "\n";
            $xml .= '    <Cell><Data ss:Type="Number">' . (int)($item['stok_minimum'] ?? 0) . '</Data></Cell>' . "\n";
            $xml .= '    <Cell><Data ss:Type="Number">' . (double)($item['harga_beli'] ?? 0) . '</Data></Cell>' . "\n";
            $xml .= '    <Cell><Data ss:Type="Number">' . (double)($item['harga_jual'] ?? 0) . '</Data></Cell>' . "\n";
            $xml .= '    <Cell><Data ss:Type="String">' . htmlspecialchars($item['lokasi'] ?? '-') . '</Data></Cell>' . "\n";
            $xml .= '    <Cell><Data ss:Type="String">' . htmlspecialchars($item['kondisi'] ?? 'Baik') . '</Data></Cell>' . "\n";
            $xml .= '   </Row>' . "\n";
        }

        $xml .= '  </Table>' . "\n";
        $xml .= ' </Worksheet>' . "\n";
        $xml .= '</Workbook>' . "\n";

        return $this->response
            ->setHeader('Content-Type', 'application/vnd.ms-excel')
            ->setHeader('Content-Disposition', 'attachment; filename="data_barang_' . date('Ymd_His') . '.xls"')
            ->setBody($xml);
    }
}


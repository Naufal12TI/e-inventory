<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\StockHistoryModel;
use App\Models\ItemModel;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * ============================================================
 * StockHistoryController — Resource Controller
 * ============================================================
 * Controller untuk mengelola riwayat pergerakan stok barang.
 *
 * Endpoint:
 * GET    /api/stock-histories          → index()
 * GET    /api/stock-histories/:id      → show()
 * POST   /api/stock-histories          → create()  ← Update stok otomatis
 * PUT    /api/stock-histories/:id      → update()
 * DELETE /api/stock-histories/:id      → delete()  ← Rollback stok
 * ============================================================
 */
class StockHistoryController extends BaseController
{
    private StockHistoryModel $stockModel;
    private ItemModel $itemModel;

    public function __construct()
    {
        $this->stockModel = new StockHistoryModel();
        $this->itemModel  = new ItemModel();
    }

    // GET /api/stock-histories
    /**
     * Tampilkan semua riwayat stok.
     * Parameter:
     * ?search=     Pencarian nama barang
     * ?jenis=      Filter: Masuk / Keluar
     * ?barang_id=  Filter per barang
     * ?dari=       Filter tanggal mulai (Y-m-d)
     * ?sampai=     Filter tanggal akhir (Y-m-d)
     */
    public function index(): ResponseInterface
    {
        $params = [
            'search'    => $this->request->getGet('search'),
            'jenis'     => $this->request->getGet('jenis'),
            'barang_id' => $this->request->getGet('barang_id'),
            'dari'      => $this->request->getGet('dari'),
            'sampai'    => $this->request->getGet('sampai'),
        ];

        $histories = $this->stockModel->getHistoriesWithItem($params);

        return $this->respond([
            'status'  => true,
            'message' => 'Data riwayat stok berhasil diambil.',
            'data'    => $histories,
        ], ResponseInterface::HTTP_OK);
    }

    // GET /api/stock-histories/:id
    public function show($id = null): ResponseInterface
    {
        $history = $this->stockModel->getHistoriesWithItem(['barang_id' => null]);
        $found   = $this->stockModel->find($id);

        if (!$found) {
            return $this->respond([
                'status'  => false,
                'message' => 'Riwayat stok tidak ditemukan.',
                'data'    => null,
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        // Ambil dengan relasi
        $result = $this->stockModel->db->table('stock_histories sh')
            ->select('sh.*, i.nama_barang, i.kode_barang')
            ->join('items i', 'i.id = sh.barang_id', 'left')
            ->where('sh.id', $id)
            ->get()
            ->getRowArray();

        return $this->respond([
            'status'  => true,
            'message' => 'Data riwayat stok berhasil diambil.',
            'data'    => $result,
        ], ResponseInterface::HTTP_OK);
    }

    // POST /api/stock-histories
    /**
     * Tambah riwayat stok baru.
     * Otomatis memperbarui stok barang.
     *
     * Request body (JSON):
     * {
     *   "barang_id": 1,
     *   "jenis": "Masuk",    // atau "Keluar"
     *   "jumlah": 10,
     *   "keterangan": "...",
     *   "tanggal": "2024-01-15"
     * }
     */
    public function create(): ResponseInterface
    {
        $input = $this->request->getJSON(true);

        // Validasi input
        if (!$this->stockModel->validate($input)) {
            return $this->respond([
                'status'  => false,
                'message' => 'Validasi gagal.',
                'data'    => $this->stockModel->errors(),
            ], ResponseInterface::HTTP_BAD_REQUEST);
        }

        $barangId = (int) $input['barang_id'];
        $jenis    = $input['jenis'];
        $jumlah   = (int) $input['jumlah'];

        // Ambil data barang untuk cek stok
        $item = $this->itemModel->find($barangId);

        if (!$item) {
            return $this->respond([
                'status'  => false,
                'message' => 'Barang tidak ditemukan.',
                'data'    => null,
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        // Cek stok mencukupi jika jenis "Keluar"
        if ($jenis === 'Keluar' && $item['stok'] < $jumlah) {
            return $this->respond([
                'status'  => false,
                'message' => "Stok tidak mencukupi. Stok saat ini: {$item['stok']} unit.",
                'data'    => null,
            ], ResponseInterface::HTTP_BAD_REQUEST);
        }

        // Simpan riwayat stok
        $this->stockModel->insert([
            'barang_id'  => $barangId,
            'jenis'      => $jenis,
            'jumlah'     => $jumlah,
            'keterangan' => $input['keterangan'] ?? null,
            'tanggal'    => $input['tanggal'],
        ]);

        // Perbarui stok barang secara otomatis
        $this->itemModel->updateStock($barangId, $jumlah, $jenis);

        $newId  = $this->stockModel->getInsertID();
        $result = $this->stockModel->db->table('stock_histories sh')
            ->select('sh.*, i.nama_barang, i.kode_barang')
            ->join('items i', 'i.id = sh.barang_id', 'left')
            ->where('sh.id', $newId)
            ->get()
            ->getRowArray();

        return $this->respond([
            'status'  => true,
            'message' => "Barang berhasil {$jenis}. Stok diperbarui.",
            'data'    => $result,
        ], ResponseInterface::HTTP_CREATED);
    }

    // PUT /api/stock-histories/:id
    /**
     * Update data riwayat stok.
     * Catatan: Tidak mengubah stok barang (untuk audit trail).
     * Hanya mengubah keterangan dan tanggal.
     */
    public function update($id = null): ResponseInterface
    {
        $history = $this->stockModel->find($id);

        if (!$history) {
            return $this->respond([
                'status'  => false,
                'message' => 'Riwayat stok tidak ditemukan.',
                'data'    => null,
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        $input = $this->request->getJSON(true);

        // Update hanya keterangan dan tanggal (tidak ubah jumlah/jenis untuk audit)
        $this->stockModel->update($id, [
            'keterangan' => $input['keterangan'] ?? $history['keterangan'],
            'tanggal'    => $input['tanggal'] ?? $history['tanggal'],
        ]);

        return $this->respond([
            'status'  => true,
            'message' => 'Riwayat stok berhasil diperbarui.',
            'data'    => $this->stockModel->find($id),
        ], ResponseInterface::HTTP_OK);
    }

    // DELETE /api/stock-histories/:id
    /**
     * Hapus riwayat stok.
     * Otomatis me-rollback stok barang.
     */
    public function delete($id = null): ResponseInterface
    {
        $history = $this->stockModel->find($id);

        if (!$history) {
            return $this->respond([
                'status'  => false,
                'message' => 'Riwayat stok tidak ditemukan.',
                'data'    => null,
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        // Rollback stok barang
        // Jika histori "Masuk" dihapus → kurangi stok
        // Jika histori "Keluar" dihapus → tambah stok kembali
        $rollbackJenis = $history['jenis'] === 'Masuk' ? 'Keluar' : 'Masuk';
        $this->itemModel->updateStock((int) $history['barang_id'], (int) $history['jumlah'], $rollbackJenis);

        $this->stockModel->delete($id);

        return $this->respond([
            'status'  => true,
            'message' => 'Riwayat stok berhasil dihapus dan stok telah di-rollback.',
            'data'    => null,
        ], ResponseInterface::HTTP_OK);
    }

    // ============================================================
    // GET /api/stock-histories/export
    // ============================================================
    /**
     * Export data riwayat stok ke Excel XML.
     */
    public function export(): ResponseInterface
    {
        $params = [
            'search'    => $this->request->getGet('search'),
            'jenis'     => $this->request->getGet('jenis'),
            'barang_id' => $this->request->getGet('barang_id'),
            'dari'      => $this->request->getGet('dari'),
            'sampai'    => $this->request->getGet('sampai'),
        ];

        $histories = $this->stockModel->getHistoriesWithItem($params);

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
        $xml .= ' <Worksheet ss:Name="Riwayat Stok">' . "\n";
        $xml .= '  <Table>' . "\n";
        
        // Header
        $xml .= '   <Row ss:Height="22">' . "\n";
        $headers = ['Tanggal', 'Kode Barang', 'Nama Barang', 'Jenis', 'Jumlah', 'Keterangan'];
        foreach ($headers as $h) {
            $xml .= '    <Cell ss:StyleID="Header"><Data ss:Type="String">' . htmlspecialchars($h) . '</Data></Cell>' . "\n";
        }
        $xml .= '   </Row>' . "\n";

        // Data Rows
        foreach ($histories as $h) {
            $xml .= '   <Row>' . "\n";
            $xml .= '    <Cell><Data ss:Type="String">' . htmlspecialchars($h['tanggal'] ?? '') . '</Data></Cell>' . "\n";
            $xml .= '    <Cell><Data ss:Type="String">' . htmlspecialchars($h['kode_barang'] ?? '') . '</Data></Cell>' . "\n";
            $xml .= '    <Cell><Data ss:Type="String">' . htmlspecialchars($h['nama_barang'] ?? '') . '</Data></Cell>' . "\n";
            $xml .= '    <Cell><Data ss:Type="String">' . htmlspecialchars($h['jenis'] ?? '') . '</Data></Cell>' . "\n";
            $xml .= '    <Cell><Data ss:Type="Number">' . (int)($h['jumlah'] ?? 0) . '</Data></Cell>' . "\n";
            $xml .= '    <Cell><Data ss:Type="String">' . htmlspecialchars($h['keterangan'] ?? '-') . '</Data></Cell>' . "\n";
            $xml .= '   </Row>' . "\n";
        }

        $xml .= '  </Table>' . "\n";
        $xml .= ' </Worksheet>' . "\n";
        $xml .= '</Workbook>' . "\n";

        return $this->response
            ->setHeader('Content-Type', 'application/vnd.ms-excel')
            ->setHeader('Content-Disposition', 'attachment; filename="riwayat_stok_' . date('Ymd_His') . '.xls"')
            ->setBody($xml);
    }
}


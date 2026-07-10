<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * ============================================================
 * CORSFilter
 * ============================================================
 * Filter untuk mengizinkan Cross-Origin Resource Sharing (CORS)
 * agar Frontend VueJS dapat mengakses API tanpa hambatan.
 *
 * Filter ini berjalan secara GLOBAL pada setiap request.
 * ============================================================
 */
class CORSFilter implements FilterInterface
{
    /**
     * Dijalankan SEBELUM controller dieksekusi.
     * Menambahkan header CORS ke setiap response.
     */
    public function before(RequestInterface $request, $arguments = null)
    {
        // Tangani preflight request (OPTIONS) dari browser
        // Browser mengirim OPTIONS sebelum request asli (POST, PUT, DELETE)
        if (strtolower($request->getMethod()) === 'options') {
            $response = service('response');

            $response->setHeader('Access-Control-Allow-Origin', '*');
            $response->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
            $response->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
            $response->setHeader('Access-Control-Max-Age', '3600');
            $response->setStatusCode(200);

            // Kirim response dan hentikan eksekusi lebih lanjut
            return $response;
        }
    }

    /**
     * Dijalankan SETELAH controller dieksekusi.
     * Menambahkan header CORS ke response akhir.
     */
    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // Tambahkan header CORS ke semua response
        $response->setHeader('Access-Control-Allow-Origin', '*');
        $response->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        $response->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

        return $response;
    }
}

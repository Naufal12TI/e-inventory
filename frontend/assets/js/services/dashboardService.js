/**
 * ============================================================
 * dashboardService.js
 * ============================================================
 * Service untuk data statistik dashboard.
 * ============================================================
 */
import api from '../config/axios.js';

const dashboardService = {
  /** Ambil semua statistik dashboard */
  async getStats()            { return (await api.get('/dashboard')).data; },

  /** Ambil data chart per bulan */
  async getChartData()        { return (await api.get('/dashboard/chart')).data; },

  /** Ambil barang dengan stok rendah */
  async getLowStock()         { return (await api.get('/dashboard/low-stock')).data; },

  /** Ambil aktivitas stok terbaru */
  async getRecentActivities(limit = 10) {
    return (await api.get(`/dashboard/recent-activities?limit=${limit}`)).data;
  },
};

export default dashboardService;

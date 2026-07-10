/**
 * ============================================================
 * stockHistoryService.js — CRUD Riwayat Stok
 * ============================================================
 */
import api from '../config/axios.js';

const stockHistoryService = {
  /**
   * Ambil semua riwayat stok.
   * @param {Object} params - { search, jenis, barang_id, dari, sampai }
   */
  async getAll(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== '' && val !== null && val !== undefined) query.append(key, val);
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return (await api.get(`/stock-histories${qs}`)).data;
  },

  async getById(id)       { return (await api.get(`/stock-histories/${id}`)).data; },
  async create(data)      { return (await api.post('/stock-histories', data)).data; },
  async update(id, data)  { return (await api.put(`/stock-histories/${id}`, data)).data; },
  async delete(id)        { return (await api.delete(`/stock-histories/${id}`)).data; },

  async exportExcel(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== '' && val !== null && val !== undefined) query.append(key, val);
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return await api.get(`/stock-histories/export${qs}`, { responseType: 'blob' });
  },
};

export default stockHistoryService;


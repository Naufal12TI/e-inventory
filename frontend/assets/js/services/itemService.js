/**
 * ============================================================
 * itemService.js — CRUD Barang + Filter/Sort
 * ============================================================
 */
import api from '../config/axios.js';

const itemService = {
  /**
   * Ambil semua barang dengan filter opsional.
   * @param {Object} params - { search, kategori_id, supplier_id, kondisi, sort, order }
   */
  async getAll(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== '' && val !== null && val !== undefined) query.append(key, val);
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return (await api.get(`/items${qs}`)).data;
  },

  async getById(id)       { return (await api.get(`/items/${id}`)).data; },
  async create(data)      { return (await api.post('/items', data)).data; },
  async update(id, data)  { return (await api.put(`/items/${id}`, data)).data; },
  async delete(id)        { return (await api.delete(`/items/${id}`)).data; },

  async exportExcel(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== '' && val !== null && val !== undefined) query.append(key, val);
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return await api.get(`/items/export${qs}`, { responseType: 'blob' });
  },
};

export default itemService;


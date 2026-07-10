/**
 * ============================================================
 * categoryService.js — CRUD Kategori
 * ============================================================
 */
import api from '../config/axios.js';

const categoryService = {
  /** Ambil semua kategori, opsional dengan pencarian */
  async getAll(search = '') {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return (await api.get(`/categories${params}`)).data;
  },

  /** Ambil satu kategori berdasarkan ID */
  async getById(id) {
    return (await api.get(`/categories/${id}`)).data;
  },

  /** Tambah kategori baru */
  async create(data) {
    return (await api.post('/categories', data)).data;
  },

  /** Update kategori */
  async update(id, data) {
    return (await api.put(`/categories/${id}`, data)).data;
  },

  /** Hapus kategori */
  async delete(id) {
    return (await api.delete(`/categories/${id}`)).data;
  },
};

export default categoryService;

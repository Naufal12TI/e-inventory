/**
 * ============================================================
 * supplierService.js — CRUD Supplier
 * ============================================================
 */
import api from '../config/axios.js';

const supplierService = {
  async getAll(search = '') {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return (await api.get(`/suppliers${params}`)).data;
  },
  async getById(id)       { return (await api.get(`/suppliers/${id}`)).data; },
  async create(data)      { return (await api.post('/suppliers', data)).data; },
  async update(id, data)  { return (await api.put(`/suppliers/${id}`, data)).data; },
  async delete(id)        { return (await api.delete(`/suppliers/${id}`)).data; },
};

export default supplierService;

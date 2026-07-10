/**
 * ============================================================
 * userService.js — CRUD User & Profil
 * ============================================================
 */
import api from '../config/axios.js';

const userService = {
  // CRUD User
  async getAll()          { return (await api.get('/users')).data; },
  async getById(id)       { return (await api.get(`/users/${id}`)).data; },
  async create(data)      { return (await api.post('/users', data)).data; },
  async update(id, data)  { return (await api.put(`/users/${id}`, data)).data; },
  async delete(id)        { return (await api.delete(`/users/${id}`)).data; },

  // Edit Profil Sendiri
  async updateProfile(data) {
    return (await api.put('/profile', data)).data;
  },

  // Ganti Password Sendiri
  async changePassword(data) {
    return (await api.put('/profile/password', data)).data;
  },
};

export default userService;

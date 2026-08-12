import api from './api';

export const citiesService = {
  /**
   * Lista todas as cidades (ativas e inativas) — visão de gerente
   */
  async getCities() {
    const response = await api.get('/api/auth/cities/?all=true');
    return response.data;
  },

  async createCity(name, state) {
    const response = await api.post('/api/auth/cities/', { name, state });
    return response.data;
  },

  async setCityActive(id, isActive) {
    const response = await api.patch(`/api/auth/cities/${id}/`, { is_active: isActive });
    return response.data;
  },

  async deleteCity(id) {
    const response = await api.delete(`/api/auth/cities/${id}/`);
    return response.data;
  },
};

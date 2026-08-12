import api from './api';

/**
 * CRUD de supervisores de cidade — exclusivo do gerente.
 */
export const supervisorsService = {
  async getSupervisors() {
    const response = await api.get('/api/auth/supervisors/');
    return response.data;
  },

  async createSupervisor(data) {
    const response = await api.post('/api/auth/supervisors/', data);
    return response.data;
  },

  async updateSupervisor(id, data) {
    const response = await api.patch(`/api/auth/supervisors/${id}/`, data);
    return response.data;
  },

  async deleteSupervisor(id) {
    const response = await api.delete(`/api/auth/supervisors/${id}/`);
    return response.data;
  },
};

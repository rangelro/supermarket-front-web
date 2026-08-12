import api from './api';

/**
 * Papéis com acesso ao painel: gerente (acesso total) e supervisor de
 * cidade (mesmo acesso, exceto Cidades Atendidas e Supervisores).
 */
export function isStaffRole(role) {
  return role === 'MANAGER' || role === 'CITY_SUPERVISOR';
}

export const authService = {
  /**
   * Autenticar usuário no backend DRF usando JWT SimpleJWT
   * Endpoint: /api/auth/token/
   */
  async login(username, password) {
    const response = await api.post('/api/auth/token/', { username, password });
    if (!response.data.access) {
      throw new Error('Credenciais inválidas');
    }

    localStorage.setItem('sgm_access_token', response.data.access);
    if (response.data.refresh) {
      localStorage.setItem('sgm_refresh_token', response.data.refresh);
    }

    // Painel é exclusivo de gerente/supervisor de cidade: valida antes de liberar a sessão
    const profile = await this.getProfile();
    if (!isStaffRole(profile.role)) {
      this.logout();
      const err = new Error('Esta área é exclusiva para gerentes e supervisores de cidade.');
      err.code = 'NOT_MANAGER';
      throw err;
    }
    return { ...response.data, profile };
  },

  /**
   * Buscar dados do perfil do usuário autenticado
   * Endpoint: /api/auth/profile/
   */
  async getProfile() {
    const response = await api.get('/api/auth/profile/');
    return response.data;
  },

  /**
   * Registra um novo usuário
   * Endpoint: /api/auth/register/
   */
  async register(userData) {
    const response = await api.post('/api/auth/register/', {
      username: userData.username,
      password: userData.password,
      email: userData.email,
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
    });
    return response.data;
  },

  /**
   * Logout do sistema
   */
  logout() {
    localStorage.removeItem('sgm_access_token');
    localStorage.removeItem('sgm_refresh_token');
  },

  /**
   * Verifica se existe um token salvo
   */
  isAuthenticated() {
    return !!localStorage.getItem('sgm_access_token');
  }
};

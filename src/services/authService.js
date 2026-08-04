import api from './api';

export const authService = {
  /**
   * Autenticar usuário no backend DRF usando JWT SimpleJWT
   * Endpoint: /api/auth/token/
   */
  async login(username, password) {
    const response = await api.post('/api/auth/token/', { username, password });
    if (response.data.access) {
      localStorage.setItem('sgm_access_token', response.data.access);
      if (response.data.refresh) {
        localStorage.setItem('sgm_refresh_token', response.data.refresh);
      }
    }
    return response.data;
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

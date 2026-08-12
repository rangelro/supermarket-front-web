import api from './api';

/**
 * Estoque por cidade (ProductCityStock) — tela "Estoque de Produtos".
 * Endpoint não pagina: o front carrega tudo e filtra client-side.
 */
export const productStockService = {
  async getStock(params = {}) {
    const query = params.city ? `?city=${params.city}` : '';
    const response = await api.get(`/api/catalog/stock/${query}`);
    return response.data;
  },

  async createStock(data) {
    const response = await api.post('/api/catalog/stock/', data);
    return response.data;
  },

  async updateStock(id, data) {
    const response = await api.patch(`/api/catalog/stock/${id}/`, data);
    return response.data;
  },

  async deleteStock(id) {
    const response = await api.delete(`/api/catalog/stock/${id}/`);
    return response.data;
  },
};

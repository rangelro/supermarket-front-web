import api from './api';

export const ordersService = {
  /**
   * Buscar relatório/indicadores do Dashboard de Vendas e Estoque
   * Endpoint desejado: /api/orders/reports/
   * Caso o backend retorne 404 (endpoint ainda não implementado),
   * a função simula o retorno com dados estruturados reais de um SGM.
   */
  async getReports() {
    try {
      // Tenta realizar a chamada GET ao endpoint DRF de relatórios
      const response = await api.get('/api/orders/reports/');
      return response.data;
    } catch (err) {
      // Se o endpoint não estiver implementado no backend (404/500/NetworkError), simula o GET
      console.warn(
        'Endpoint /api/orders/reports/ não encontrado no backend DRF. Utilizando dados simulados para o Dashboard.'
      );
      
      // Simulação da resposta do GET /api/orders/reports/
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            total_sales_count: 142,
            total_revenue: 28490.50,
            average_ticket: 200.63,
            critical_stock_count: 8,
            pending_orders: 14,
            sales_by_period: [
              { date: 'Segunda', total: 3200.00, count: 22 },
              { date: 'Terça', total: 4100.50, count: 28 },
              { date: 'Quarta', total: 3800.00, count: 25 },
              { date: 'Quinta', total: 5400.20, count: 34 },
              { date: 'Sexta', total: 6890.80, count: 41 },
              { date: 'Sábado', total: 5099.00, count: 32 },
            ],
            critical_products: [
              { id: 101, name: 'Leite Integral 1L', category: 'Laticínios', current_stock: 3, min_stock: 15, unit: 'un' },
              { id: 102, name: 'Arroz Tipo 1 5kg', category: 'Grãos', current_stock: 2, min_stock: 10, unit: 'un' },
              { id: 103, name: 'Café Torrado 500g', category: 'Mercearia', current_stock: 4, min_stock: 12, unit: 'un' },
              { id: 104, name: 'Detergente Neutro 500ml', category: 'Limpeza', current_stock: 1, min_stock: 20, unit: 'un' },
            ],
            top_selling_categories: [
              { name: 'Mercearia', percentage: 42, revenue: 11966.01 },
              { name: 'Hortifrúti', percentage: 25, revenue: 7122.62 },
              { name: 'Laticínios', percentage: 18, revenue: 5128.29 },
              { name: 'Limpeza', percentage: 15, revenue: 4273.58 },
            ]
          });
        }, 400); // 400ms latency simulation
      });
    }
  },

  /**
   * Buscar pedidos cadastrados no DRF
   * Endpoint: /api/orders/
   */
  async getOrders(params = {}) {
    const response = await api.get('/api/orders/', { params });
    const data = response.data;
    if (data && Array.isArray(data.results)) {
      return data.results;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  },

  /**
   * Criar novo pedido (POST payload em snake_case)
   * Endpoint: /api/orders/
   */
  async createOrder(orderData) {
    const response = await api.post('/api/orders/', orderData);
    return response.data;
  },

  /**
   * Atualizar status do pedido (PATCH /api/orders/{id}/)
   * Status válidos: PENDING, PREPARING, IN_DELIVERY, COMPLETED, CANCELED
   */
  async updateOrderStatus(orderId, status) {
    const response = await api.patch(`/api/orders/${orderId}/`, { status });
    return response.data;
  }
};

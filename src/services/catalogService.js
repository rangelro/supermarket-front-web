import api from './api';

export const catalogService = {
  /**
   * Buscar lista paginada de produtos com filtros
   */
  async getProducts(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.search) queryParams.append('search', params.search);
    if (params.category) queryParams.append('category', params.category);
    if (params.city) queryParams.append('city', params.city);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    try {
      const response = await api.get(`/api/catalog/products/${queryString}`);
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const fallbackResponse = await api.get(`/api/products/${queryString}`);
        return fallbackResponse.data;
      }
      throw err;
    }
  },

  /**
   * Buscar produto por ID
   */
  async getProductById(id) {
    try {
      const response = await api.get(`/api/catalog/products/${id}/`);
      return response.data;
    } catch (_err) {
      const fallback = await api.get(`/api/products/${id}/`);
      return fallback.data;
    }
  },

  /**
   * Criar novo produto (suporta FormData para upload de imagem ou JSON)
   */
  async createProduct(productData, imageFile = null) {
    let payload;
    let headers = {};

    if (imageFile instanceof FormData || (typeof File !== 'undefined' && imageFile instanceof File)) {
      payload = new FormData();
      payload.append('name', productData.name);
      payload.append('description', productData.description || '');
      payload.append('price', productData.price);
      payload.append('unit', productData.unit || 'un');
      payload.append('category_id', productData.category_id);
      if (productData.city_id) payload.append('city_id', productData.city_id);
      payload.append('stock_quantity', productData.stock_quantity || 0);
      payload.append('min_stock', productData.min_stock || 5);
      payload.append('is_active', productData.is_active ?? true);
      payload.append('image', imageFile);
      headers['Content-Type'] = 'multipart/form-data';
    } else {
      payload = {
        name: productData.name,
        description: productData.description || '',
        price: parseFloat(productData.price),
        unit: productData.unit || 'un',
        category_id: parseInt(productData.category_id, 10),
        city_id: productData.city_id ? parseInt(productData.city_id, 10) : undefined,
        stock_quantity: parseInt(productData.stock_quantity || 0, 10),
        min_stock: parseInt(productData.min_stock || 5, 10),
        is_active: productData.is_active ?? true,
      };
    }

    try {
      const response = await api.post('/api/catalog/products/', payload, { headers });
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const fallback = await api.post('/api/products/', payload, { headers });
        return fallback.data;
      }
      throw err;
    }
  },

  /**
   * Atualizar produto existente (suporta FormData ou JSON).
   * Estoque não faz mais parte de Product (é por cidade, via productStockService) —
   * dados gerais só.
   */
  async updateProduct(id, productData, imageFile = null) {
    let payload;
    let headers = {};

    if (imageFile instanceof FormData || (typeof File !== 'undefined' && imageFile instanceof File)) {
      payload = new FormData();
      payload.append('name', productData.name);
      payload.append('description', productData.description || '');
      payload.append('price', productData.price);
      payload.append('unit', productData.unit || 'un');
      payload.append('category_id', productData.category_id);
      payload.append('is_active', productData.is_active ?? true);
      payload.append('image', imageFile);
      headers['Content-Type'] = 'multipart/form-data';
    } else {
      payload = {
        name: productData.name,
        description: productData.description || '',
        price: parseFloat(productData.price),
        unit: productData.unit || 'un',
        category_id: parseInt(productData.category_id, 10),
        is_active: productData.is_active ?? true,
      };
    }

    try {
      const response = await api.put(`/api/catalog/products/${id}/`, payload, { headers });
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const fallback = await api.put(`/api/products/${id}/`, payload, { headers });
        return fallback.data;
      }
      throw err;
    }
  },

  /**
   * Excluir produto
   */
  async deleteProduct(id) {
    try {
      const response = await api.delete(`/api/catalog/products/${id}/`);
      return response.data;
    } catch (_err) {
      const fallback = await api.delete(`/api/products/${id}/`);
      return fallback.data;
    }
  },

  /**
   * Buscar categorias, opcionalmente filtradas por cidade (só mostra
   * categorias com produto ativo e em estoque naquela cidade)
   */
  async getCategories(params = {}) {
    const queryString = params.city ? `?city=${params.city}` : '';
    try {
      const response = await api.get(`/api/catalog/categories/${queryString}`);
      return response.data;
    } catch (_err) {
      const fallback = await api.get(`/api/categories/${queryString}`);
      return fallback.data;
    }
  },

  /**
   * Criar nova categoria
   */
  async createCategory(categoryName) {
    const slug = categoryName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const payload = { name: categoryName, slug };

    try {
      const response = await api.post('/api/catalog/categories/', payload);
      return response.data;
    } catch (_err) {
      const fallback = await api.post('/api/categories/', payload);
      return fallback.data;
    }
  },

  /**
   * Atualizar categoria
   */
  async updateCategory(id, categoryName) {
    const slug = categoryName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const payload = { name: categoryName, slug };

    try {
      const response = await api.put(`/api/catalog/categories/${id}/`, payload);
      return response.data;
    } catch (_err) {
      const fallback = await api.put(`/api/categories/${id}/`, payload);
      return fallback.data;
    }
  },

  /**
   * Deletar categoria
   */
  async deleteCategory(id) {
    try {
      const response = await api.delete(`/api/catalog/categories/${id}/`);
      return response.data;
    } catch (_err) {
      const fallback = await api.delete(`/api/categories/${id}/`);
      return fallback.data;
    }
  }
};

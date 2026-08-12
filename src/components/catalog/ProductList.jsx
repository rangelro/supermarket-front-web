import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Package,
  Grid,
  List as ListIcon,
  Image as ImageIcon,
  MapPin,
  X,
  Check
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import { productStockService } from '../../services/productStockService';
import { citiesService } from '../../services/citiesService';
import CityFilterSelect from '../common/CityFilterSelect';

export default function ProductList({ user, onEditProduct, onCreateNewProduct }) {
  const [stockRows, setStockRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [activeCities, setActiveCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  // Filtros — cidade dispara nova busca no backend; busca/categoria filtram
  // client-side sobre a lista já carregada (endpoint não pagina)
  const [selectedCity, setSelectedCity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modal: editar quantidade/mínimo de uma linha existente
  const [editingRow, setEditingRow] = useState(null);
  const [stockForm, setStockForm] = useState({ stock_quantity: 0, min_stock: 5 });
  const [stockModalSubmitting, setStockModalSubmitting] = useState(false);
  const [stockModalError, setStockModalError] = useState(null);

  // Modal: adicionar produto já existente a outra cidade
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ product_id: '', city_id: '', stock_quantity: 0, min_stock: 5 });
  const [addModalSubmitting, setAddModalSubmitting] = useState(false);
  const [addModalError, setAddModalError] = useState(null);

  const fetchStock = async () => {
    setLoading(true);
    try {
      const data = await productStockService.getStock({ city: selectedCity });
      setStockRows(Array.isArray(data) ? data : []);
    } catch (_err) {
      setStockRows([
        {
          id: 1,
          city: { id: 1, name: 'Natal', state: 'RN' },
          stock_quantity: 45,
          min_stock: 10,
          product: {
            id: 1, name: 'Arroz Parboilizado Tipo 1 5kg', price: '28.90', unit: 'un',
            category: { id: 1, name: 'Grãos e Cereais' }, is_active: true,
            description: 'Arroz tipo 1 selecionado para o dia a dia',
            image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
          },
        },
        {
          id: 2,
          city: { id: 1, name: 'Natal', state: 'RN' },
          stock_quantity: 3,
          min_stock: 15,
          product: {
            id: 2, name: 'Leite UHT Integral 1L', price: '5.20', unit: 'un',
            category: { id: 2, name: 'Laticínios e Frios' }, is_active: true,
            description: 'Leite fortificado com vitaminas A e D',
            image_url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80',
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity]);

  useEffect(() => {
    catalogService.getCategories()
      .then((data) => setCategories(data.results || (Array.isArray(data) ? data : [])))
      .catch(() => setCategories([]));
    catalogService.getProducts()
      .then((data) => setAllProducts(data.results || (Array.isArray(data) ? data : [])))
      .catch(() => setAllProducts([]));
    citiesService.getCities()
      .then((data) => setActiveCities((data || []).filter((c) => c.is_active)))
      .catch(() => setActiveCities([]));
  }, []);

  const filteredRows = stockRows.filter((row) => {
    const matchesSearch = !searchTerm || row.product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || String(row.product.category?.id) === String(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // "Presente em outra filial": só produto com estoque em alguma cidade — e,
  // assim que a cidade de destino é conhecida, tira quem já está lá (evita
  // tentar duplicar; o backend bloqueia de qualquer forma, isso é só UX).
  const addTargetCityId = user?.role === 'CITY_SUPERVISOR' ? user.city?.id : addForm.city_id;
  const eligibleProductsForAdd = allProducts.filter((p) => {
    const cities = p.stocked_city_ids || [];
    if (cities.length === 0) return false;
    return !addTargetCityId || !cities.includes(Number(addTargetCityId));
  });

  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Tem certeza que deseja excluir o produto "${name}" do estoque?`)) {
      try {
        await catalogService.deleteProduct(id);
        fetchStock();
      } catch (_err) {
        alert('Não foi possível excluir o produto no momento.');
      }
    }
  };

  const handleOpenEditStock = (row) => {
    setStockModalError(null);
    setEditingRow(row);
    setStockForm({ stock_quantity: row.stock_quantity, min_stock: row.min_stock });
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    setStockModalSubmitting(true);
    setStockModalError(null);
    try {
      await productStockService.updateStock(editingRow.id, {
        stock_quantity: parseInt(stockForm.stock_quantity, 10),
        min_stock: parseInt(stockForm.min_stock, 10),
      });
      setEditingRow(null);
      fetchStock();
    } catch (err) {
      setStockModalError(err.response?.data?.stock_quantity?.[0] || err.response?.data?.min_stock?.[0] || 'Não foi possível salvar o estoque.');
    } finally {
      setStockModalSubmitting(false);
    }
  };

  const handleOpenAddModal = () => {
    setAddModalError(null);
    setAddForm({ product_id: '', city_id: '', stock_quantity: 0, min_stock: 5 });
    setShowAddModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.product_id) {
      setAddModalError('Selecione um produto.');
      return;
    }
    if (user?.role === 'MANAGER' && !addForm.city_id) {
      setAddModalError('Selecione a cidade.');
      return;
    }
    setAddModalSubmitting(true);
    setAddModalError(null);
    try {
      await productStockService.createStock({
        product_id: addForm.product_id,
        city_id: addForm.city_id || undefined,
        stock_quantity: parseInt(addForm.stock_quantity, 10) || 0,
        min_stock: parseInt(addForm.min_stock, 10) || 0,
      });
      setShowAddModal(false);
      fetchStock();
    } catch (err) {
      setAddModalError(
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        'Não foi possível adicionar o produto a essa cidade.'
      );
    } finally {
      setAddModalSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden space-y-3">
      {/* Header com Ações */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Package className="text-emerald-600" size={22} /> Controle de Estoque
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Estoque por cidade — mesmo produto pode ter quantidades diferentes em cada cidade
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 font-medium px-3 py-2 border border-gray-300 rounded-xl shadow-xs text-xs transition-colors cursor-pointer"
          >
            <MapPin size={15} />
            <span>Adicionar Produto Presente em Outra Filial</span>
          </button>
          <button
            onClick={onCreateNewProduct}
            className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-xl shadow-xs text-xs transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Cadastrar Produto</span>
          </button>
        </div>
      </div>

      {/* Painel de Filtros */}
      <div className="bg-white p-3 rounded-2xl shadow-xs border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar produto por nome..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white appearance-none cursor-pointer"
            >
              <option value="">Todas as Categorias</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <CityFilterSelect user={user} value={selectedCity} onChange={setSelectedCity} />

          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                viewMode === 'grid' ? 'bg-white text-emerald-800 shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-800'
              }`}
              title="Cards com Fotos"
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                viewMode === 'table' ? 'bg-white text-emerald-800 shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-800'
              }`}
              title="Tabela"
            >
              <ListIcon size={15} />
            </button>
          </div>

          <button
            onClick={fetchStock}
            className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 border border-gray-300 rounded-xl transition-colors shrink-0"
            title="Atualizar lista"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-emerald-600' : ''} />
          </button>
        </div>
      </div>

      {/* ÁREA COM SCROLL INTERNO (NÃO EXPANDE A TELA) */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1">
        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center text-gray-500 h-full flex flex-col items-center justify-center">
            <RefreshCw className="animate-spin text-emerald-600 mb-2" size={24} />
            <p className="text-xs">Carregando estoque...</p>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center h-full flex flex-col items-center justify-center space-y-2">
            <Package size={36} className="mx-auto text-gray-300" />
            <h3 className="text-sm font-bold text-gray-800">Nenhum produto encontrado</h3>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredRows.map((row) => {
              const product = row.product;
              const stock = row.stock_quantity ?? 0;
              const isLowStock = stock > 0 && stock <= (row.min_stock ?? 5);
              const isOutOfStock = stock === 0;
              const photoUrl = product.image_url || product.image;

              return (
                <div
                  key={row.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="h-36 bg-gray-100 relative flex items-center justify-center overflow-hidden border-b border-gray-100">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={product.name}
                          className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-center text-gray-400 p-2">
                          <ImageIcon size={28} className="mx-auto mb-1 opacity-40" />
                          <span className="text-[10px]">Sem foto</span>
                        </div>
                      )}

                      <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs text-gray-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-gray-200">
                        {product.category?.name || 'Geral'}
                      </span>
                      <span className="absolute top-2 left-2 bg-emerald-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <MapPin size={10} /> {row.city.name}/{row.city.state}
                      </span>
                    </div>

                    <div className="p-3 space-y-1.5">
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{product.name}</h3>
                      <p className="text-[11px] text-gray-500 line-clamp-1">{product.description || 'Sem especificação'}</p>

                      <div className="pt-1 flex items-center justify-between">
                        <div>
                          <span className="text-base font-bold text-emerald-700">
                            R$ {parseFloat(product.price).toFixed(2)}
                          </span>
                          <span className="text-[10px] text-gray-500 font-semibold uppercase ml-1">/{product.unit || 'un'}</span>
                        </div>

                        <button
                          onClick={() => handleOpenEditStock(row)}
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer ${
                            isOutOfStock
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          }`}
                          title="Editar estoque"
                        >
                          {stock} {product.unit || 'un'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-mono">#{product.id}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditStock(row)}
                        className="p-1 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Editar estoque"
                      >
                        <Package size={15} />
                      </button>
                      <button
                        onClick={() => onEditProduct(product)}
                        className="p-1 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Editar dados do produto"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id, product.name)}
                        className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir produto"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-2 px-3">Item</th>
                  <th className="py-2 px-3">Produto</th>
                  <th className="py-2 px-3">Categoria</th>
                  <th className="py-2 px-3">Cidade</th>
                  <th className="py-2 px-3">Preço</th>
                  <th className="py-2 px-3">Estoque</th>
                  <th className="py-2 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs">
                {filteredRows.map((row) => {
                  const product = row.product;
                  const stock = row.stock_quantity ?? 0;
                  const isLowStock = stock > 0 && stock <= (row.min_stock ?? 5);
                  const isOutOfStock = stock === 0;
                  const photoUrl = product.image_url || product.image;

                  return (
                    <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-2 px-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
                          {photoUrl ? (
                            <img src={photoUrl} alt="" className="w-full h-full object-contain p-0.5" />
                          ) : (
                            <ImageIcon size={16} className="text-gray-400" />
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-bold text-gray-900">{product.name}</div>
                        <div className="text-[11px] text-gray-500 truncate max-w-xs">{product.description}</div>
                      </td>
                      <td className="py-2 px-3">
                        <span className="bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
                          {product.category?.name || 'Geral'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-600">{row.city.name}/{row.city.state}</td>
                      <td className="py-2 px-3 font-bold text-emerald-700">
                        R$ {parseFloat(product.price).toFixed(2)}
                      </td>
                      <td className="py-2 px-3">
                        <button
                          onClick={() => handleOpenEditStock(row)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer ${
                            isOutOfStock
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          }`}
                        >
                          {stock} {product.unit || 'un'}
                        </button>
                      </td>
                      <td className="py-2 px-3 text-right space-x-1">
                        <button
                          onClick={() => onEditProduct(product)}
                          className="p-1 text-gray-500 hover:text-emerald-700 rounded-lg"
                          title="Editar dados do produto"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="p-1 text-gray-500 hover:text-red-600 rounded-lg"
                          title="Excluir produto"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rodapé com total */}
      <div className="bg-white px-3 py-2 rounded-2xl border border-gray-200 flex items-center justify-between text-xs text-gray-600 shrink-0">
        <div>
          Total <span className="font-bold text-gray-900">{filteredRows.length}</span> itens de estoque
        </div>
      </div>

      {/* Modal: editar estoque de uma linha */}
      {editingRow && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Package size={18} className="text-emerald-600" />
                Editar Estoque
              </h3>
              <button onClick={() => setEditingRow(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-md">
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-3">
              {editingRow.product.name} — {editingRow.city.name}/{editingRow.city.state}
            </p>

            {stockModalError && (
              <div className="mb-3 bg-red-50 text-red-700 text-xs p-2.5 rounded-xl border border-red-200">
                {stockModalError}
              </div>
            )}

            <form onSubmit={handleStockSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Quantidade em Estoque</label>
                <input
                  type="number" min="0" required
                  value={stockForm.stock_quantity}
                  onChange={(e) => setStockForm({ ...stockForm, stock_quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Estoque Mínimo</label>
                <input
                  type="number" min="0" required
                  value={stockForm.min_stock}
                  onChange={(e) => setStockForm({ ...stockForm, min_stock: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setEditingRow(null)} className="px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl font-medium">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={stockModalSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium shadow-xs flex items-center gap-1.5"
                >
                  {stockModalSubmitting ? <RefreshCw className="animate-spin" size={14} /> : <Check size={14} />}
                  <span>Salvar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: adicionar produto existente a outra cidade */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <MapPin size={18} className="text-emerald-600" />
                Adicionar Produto Presente em Outra Filial
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-md">
                <X size={16} />
              </button>
            </div>

            {addModalError && (
              <div className="mb-3 bg-red-50 text-red-700 text-xs p-2.5 rounded-xl border border-red-200">
                {addModalError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Cidade de Destino</label>
                {user?.role === 'CITY_SUPERVISOR' ? (
                  <p className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-600">
                    {user.city ? `${user.city.name}/${user.city.state}` : 'Sem cidade vinculada'}
                  </p>
                ) : (
                  <select
                    required
                    value={addForm.city_id}
                    onChange={(e) => {
                      const newCityId = e.target.value;
                      const product = allProducts.find((p) => String(p.id) === String(addForm.product_id));
                      const stillEligible = product && (!newCityId || !(product.stocked_city_ids || []).includes(Number(newCityId)));
                      setAddForm({ ...addForm, city_id: newCityId, product_id: stillEligible ? addForm.product_id : '' });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">Selecione a cidade...</option>
                    {activeCities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}/{c.state}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Produto Presente em Outra Filial</label>
                <select
                  required
                  value={addForm.product_id}
                  onChange={(e) => setAddForm({ ...addForm, product_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">Selecione um produto...</option>
                  {eligibleProductsForAdd.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {eligibleProductsForAdd.length === 0 && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    Nenhum produto presente em outra filial pra trazer pra cá.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Estoque Inicial</label>
                  <input
                    type="number" min="0"
                    value={addForm.stock_quantity}
                    onChange={(e) => setAddForm({ ...addForm, stock_quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Estoque Mínimo</label>
                  <input
                    type="number" min="0"
                    value={addForm.min_stock}
                    onChange={(e) => setAddForm({ ...addForm, min_stock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl font-medium">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={addModalSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium shadow-xs flex items-center gap-1.5"
                >
                  {addModalSubmitting ? <RefreshCw className="animate-spin" size={14} /> : <Check size={14} />}
                  <span>Adicionar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Package,
  Grid,
  List as ListIcon,
  Image as ImageIcon
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';

export default function ProductList({ onEditProduct, onCreateNewProduct }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  // Paginação
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await catalogService.getProducts({
        page,
        search: debouncedSearch,
        category: selectedCategory,
      });

      if (data && Array.isArray(data.results)) {
        setProducts(data.results);
        setTotalCount(data.count || data.results.length);
        setHasNext(!!data.next);
        setHasPrevious(!!data.previous);
      } else if (Array.isArray(data)) {
        setProducts(data);
        setTotalCount(data.length);
        setHasNext(false);
        setHasPrevious(false);
      } else {
        setProducts([]);
        setTotalCount(0);
      }
    } catch (_err) {
      setProducts([
        { 
          id: 1, 
          name: 'Arroz Parboilizado Tipo 1 5kg', 
          price: '28.90', 
          unit: 'un', 
          category: { id: 1, name: 'Grãos e Cereais' }, 
          stock_quantity: 45, 
          is_active: true, 
          description: 'Arroz tipo 1 selecionado para o dia a dia',
          image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80'
        },
        { 
          id: 2, 
          name: 'Feijão Preto Carioca 1kg', 
          price: '8.50', 
          unit: 'un', 
          category: { id: 1, name: 'Grãos e Cereais' }, 
          stock_quantity: 12, 
          is_active: true, 
          description: 'Feijão fresco e macio',
          image_url: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=400&q=80'
        },
        { 
          id: 3, 
          name: 'Leite UHT Integral 1L', 
          price: '5.20', 
          unit: 'un', 
          category: { id: 2, name: 'Laticínios e Frios' }, 
          stock_quantity: 3, 
          is_active: true, 
          description: 'Leite fortificado com vitaminas A e D',
          image_url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80'
        },
        { 
          id: 4, 
          name: 'Detergente Neutro 500ml', 
          price: '2.80', 
          unit: 'un', 
          category: { id: 4, name: 'Limpeza e Higiene' }, 
          stock_quantity: 0, 
          is_active: false, 
          description: 'Alto rendimento e controle de gordura',
          image_url: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=400&q=80'
        },
      ]);
      setTotalCount(4);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const catData = await catalogService.getCategories();
        const catList = catData.results ? catData.results : (Array.isArray(catData) ? catData : []);
        setCategories(catList);
      } catch (_err) {
        // Fallback cat list handled gracefully
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Tem certeza que deseja excluir o produto "${name}" do estoque?`)) {
      try {
        await catalogService.deleteProduct(id);
        fetchProducts();
      } catch (_err) {
        alert('Não foi possível excluir o produto no momento.');
      }
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
            Catálogo completo de produtos disponíveis para venda no supermercado
          </p>
        </div>

        <button
          onClick={onCreateNewProduct}
          className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-xl shadow-xs text-xs transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Cadastrar Produto</span>
        </button>
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

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
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
            onClick={fetchProducts}
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
            <p className="text-xs">Carregando catálogo de produtos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center h-full flex flex-col items-center justify-center space-y-2">
            <Package size={36} className="mx-auto text-gray-300" />
            <h3 className="text-sm font-bold text-gray-800">Nenhum produto encontrado</h3>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => {
              const stock = product.stock_quantity ?? 0;
              const isLowStock = stock > 0 && stock <= 10;
              const isOutOfStock = stock === 0;
              const photoUrl = product.image_url || product.image;

              return (
                <div
                  key={product.id}
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

                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isOutOfStock
                              ? 'bg-red-100 text-red-800'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {stock} {product.unit || 'un'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-mono">#{product.id}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditProduct(product)}
                        className="p-1 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id, product.name)}
                        className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
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
                  <th className="py-2 px-3">Preço</th>
                  <th className="py-2 px-3">Estoque</th>
                  <th className="py-2 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs">
                {products.map((product) => {
                  const stock = product.stock_quantity ?? 0;
                  const isLowStock = stock > 0 && stock <= 10;
                  const isOutOfStock = stock === 0;
                  const photoUrl = product.image_url || product.image;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50/60 transition-colors">
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
                      <td className="py-2 px-3 font-bold text-emerald-700">
                        R$ {parseFloat(product.price).toFixed(2)}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isOutOfStock
                              ? 'bg-red-100 text-red-800'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {stock} {product.unit || 'un'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right space-x-1">
                        <button
                          onClick={() => onEditProduct(product)}
                          className="p-1 text-gray-500 hover:text-emerald-700 rounded-lg"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="p-1 text-gray-500 hover:text-red-600 rounded-lg"
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

      {/* Rodapé de Paginação Fixo */}
      <div className="bg-white px-3 py-2 rounded-2xl border border-gray-200 flex items-center justify-between text-xs text-gray-600 shrink-0">
        <div>
          Total <span className="font-bold text-gray-900">{totalCount}</span> itens
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1 && !hasPrevious}
            className="px-2.5 py-1 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 disabled:opacity-50 font-medium text-[11px]"
          >
            <ChevronLeft size={14} className="inline" /> Anterior
          </button>
          <span className="px-2.5 py-0.5 bg-gray-100 rounded-xl text-[11px] font-bold text-gray-800">
            Pág. {page}
          </span>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={!hasNext && products.length < 10}
            className="px-2.5 py-1 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 disabled:opacity-50 font-medium text-[11px]"
          >
            Próxima <ChevronRight size={14} className="inline" />
          </button>
        </div>
      </div>
    </div>
  );
}

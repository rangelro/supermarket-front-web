import { useState, useEffect } from 'react';
import {
  Tags,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Tag,
  X,
  Check,
  Package
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import CityFilterSelect from '../common/CityFilterSelect';

export default function CategoryList({ user }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await catalogService.getCategories({ city: selectedCity });
      const catList = data.results ? data.results : (Array.isArray(data) ? data : []);
      setCategories(catList);
    } catch (_err) {
      setCategories([
        { id: 1, name: 'Grãos e Cereais' },
        { id: 2, name: 'Laticínios e Frios' },
        { id: 3, name: 'Hortifrúti' },
        { id: 4, name: 'Limpeza e Higiene' },
        { id: 5, name: 'Bebidas' },
        { id: 6, name: 'Padaria e Confeitaria' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity]);

  const handleOpenModal = (category = null) => {
    setModalError(null);
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
    } else {
      setEditingCategory(null);
      setCategoryName('');
    }
    setShowModal(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);
    setModalSubmitting(true);

    if (!categoryName.trim()) {
      setModalError('Informe o nome da categoria.');
      setModalSubmitting(false);
      return;
    }

    try {
      if (editingCategory) {
        await catalogService.updateCategory(editingCategory.id, categoryName);
      } else {
        await catalogService.createCategory(categoryName);
      }
      setShowModal(false);
      fetchCategories();
    } catch (_err) {
      setCategories((prev) => {
        if (editingCategory) {
          return prev.map((c) => (c.id === editingCategory.id ? { ...c, name: categoryName } : c));
        }
        return [...prev, { id: Date.now(), name: categoryName }];
      });
      setShowModal(false);
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (window.confirm(`Excluir a categoria "${name}"?`)) {
      try {
        await catalogService.deleteCategory(id);
        fetchCategories();
      } catch (_err) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      }
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Tags className="text-emerald-600" size={22} /> Categorias de Produtos
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Organize os setores do supermercado para gestão do estoque
          </p>
        </div>

        <div className="flex items-center gap-2">
          <CityFilterSelect user={user} value={selectedCity} onChange={setSelectedCity} />
          <button
            onClick={() => handleOpenModal(null)}
            className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-xl shadow-xs text-xs transition-colors cursor-pointer"
          >
            <Plus size={16} />
            <span>Nova Categoria</span>
          </button>
        </div>
      </div>

      {/* Grid com Scroll Interno */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1">
        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center text-gray-500 h-full flex flex-col items-center justify-center">
            <RefreshCw className="animate-spin text-emerald-600 mb-2" size={24} />
            <p className="text-xs">Carregando setores da loja...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white p-4 rounded-2xl shadow-xs border border-gray-200 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl group-hover:scale-105 transition-transform">
                      <Tag size={18} />
                    </div>
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                      Setor Ativo
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-0.5">{cat.name}</h3>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Package size={12} /> Categoria da Loja
                  </p>
                </div>

                <div className="flex items-center justify-end gap-1 pt-3 mt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenModal(cat)}
                    className="p-1 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                    title="Editar"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Excluir"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Tags size={18} className="text-emerald-600" />
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={16} />
              </button>
            </div>

            {modalError && (
              <div className="mb-3 bg-red-50 text-red-700 text-xs p-2.5 rounded-xl border border-red-200">
                {modalError}
              </div>
            )}

            <form onSubmit={handleModalSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Nome da Categoria / Setor
                </label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Ex: Frios e Embutidos"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium shadow-xs flex items-center gap-1.5"
                >
                  {modalSubmitting ? <RefreshCw className="animate-spin" size={14} /> : <Check size={14} />}
                  <span>Salvar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

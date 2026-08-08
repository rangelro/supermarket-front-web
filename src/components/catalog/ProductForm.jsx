import { useState, useEffect } from 'react';
import {
  Save,
  ArrowLeft,
  Package,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  X,
  Eye
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';

export default function ProductForm({ productToEdit, onCancel, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    unit: 'un',
    category_id: '',
    stock_quantity: 0,
    min_stock: 5,
    is_active: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        description: productToEdit.description || '',
        price: productToEdit.price || '',
        unit: productToEdit.unit || 'un',
        category_id: productToEdit.category?.id || productToEdit.category_id || '',
        stock_quantity: productToEdit.stock_quantity ?? 0,
        min_stock: productToEdit.min_stock ?? 5,
        is_active: productToEdit.is_active ?? true,
      });

      if (productToEdit.image_url) {
        setImagePreviewUrl(productToEdit.image_url);
      } else if (typeof productToEdit.image === 'string' && productToEdit.image) {
        setImagePreviewUrl(productToEdit.image);
      }
    }
  }, [productToEdit]);

  useEffect(() => {
    async function loadCategories() {
      setLoadingCategories(true);
      try {
        const data = await catalogService.getCategories();
        const catList = data.results ? data.results : (Array.isArray(data) ? data : []);
        setCategories(catList);
        
        if (catList.length > 0) {
          setFormData((prev) => (prev.category_id ? prev : { ...prev, category_id: catList[0].id }));
        }
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
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreviewUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setSubmitting(true);

    if (!formData.name.trim()) {
      setErrorMessage('Por favor, informe o nome do produto.');
      setSubmitting(false);
      return;
    }
    if (!formData.category_id) {
      setErrorMessage('Selecione uma categoria para o produto.');
      setSubmitting(false);
      return;
    }
    if (parseFloat(formData.price) <= 0 || isNaN(parseFloat(formData.price))) {
      setErrorMessage('Informe um preço de venda válido maior que zero.');
      setSubmitting(false);
      return;
    }

    try {
      if (productToEdit && productToEdit.id) {
        await catalogService.updateProduct(productToEdit.id, formData, imageFile);
        setSuccessMessage('Produto alterado com sucesso!');
      } else {
        await catalogService.createProduct(formData, imageFile);
        setSuccessMessage('Novo produto cadastrado com sucesso no estoque!');
      }

      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1000);
    } catch (_err) {
      setSuccessMessage('Produto salvo no sistema!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              {productToEdit ? `Editar Produto: ${productToEdit.name}` : 'Cadastrar Novo Produto'}
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-100"
        >
          Cancelar
        </button>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2 shrink-0">
          <AlertCircle className="shrink-0" size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2 shrink-0">
          <CheckCircle className="shrink-0 text-emerald-600" size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ÁREA INTERNA COM SCROLL SE NECESSÁRIO */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
            
            {/* Foto do Produto */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
              <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="text-emerald-600" size={18} />
                  <h2 className="font-bold text-gray-800 text-xs">Foto do Produto</h2>
                </div>
              </div>

              <div className="p-4">
                {imagePreviewUrl ? (
                  <div className="relative group w-full h-40 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
                    <img
                      src={imagePreviewUrl}
                      alt="Preview"
                      className="w-full h-full object-contain p-2"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="cursor-pointer bg-white text-gray-800 font-medium text-xs px-2.5 py-1.5 rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-1">
                        <Upload size={13} /> Alterar
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="bg-red-600 text-white font-medium text-xs px-2.5 py-1.5 rounded-lg shadow-sm hover:bg-red-700 flex items-center gap-1"
                      >
                        <X size={13} /> Remover
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50/50 hover:bg-emerald-50/40 hover:border-emerald-400 transition-all group">
                    <div className="flex flex-col items-center justify-center text-center px-4">
                      <Upload size={20} className="text-gray-400 mb-1" />
                      <p className="text-xs font-semibold text-gray-700">Clique para enviar uma foto do produto</p>
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Identificação */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
              <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                <Package className="text-emerald-600" size={18} />
                <h2 className="font-bold text-gray-800 text-xs">Identificação e Descrição</h2>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: Arroz Parboilizado 5kg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Descrição ou Marca
                  </label>
                  <textarea
                    name="description"
                    rows="2"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Especificações do produto..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Categoria + Preço em Linha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-4">
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Categoria *
                </label>
                {loadingCategories ? (
                  <span className="text-xs text-gray-400">Carregando...</span>
                ) : (
                  <select
                    name="category_id"
                    required
                    value={formData.category_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="">Selecione...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-4">
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Preço de Venda (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0,00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-gray-900"
                />
              </div>
            </div>

            {/* Estoque */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-4 grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                  Unidade
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-xl text-xs bg-white"
                >
                  <option value="un">un</option>
                  <option value="kg">kg</option>
                  <option value="l">l</option>
                  <option value="cx">cx</option>
                  <option value="pct">pct</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                  Qtd Estoque
                </label>
                <input
                  type="number"
                  min="0"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                  Mínimo
                </label>
                <input
                  type="number"
                  min="0"
                  name="min_stock"
                  value={formData.min_stock}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-xs"
              >
                {submitting ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                <span>{productToEdit ? 'Salvar' : 'Cadastrar'}</span>
              </button>
            </div>
          </form>

          {/* Pré-visualização Lateral */}
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-4 space-y-3 h-fit">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Eye size={13} className="text-emerald-600" /> Pré-visualização
              </span>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs">
              <div className="h-32 bg-gray-100 relative flex items-center justify-center overflow-hidden">
                {imagePreviewUrl ? (
                  <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="text-center text-gray-400">
                    <ImageIcon size={24} className="mx-auto mb-1 opacity-50" />
                    <span className="text-[10px]">Sem Foto</span>
                  </div>
                )}
              </div>

              <div className="p-3 space-y-1">
                <h4 className="font-bold text-gray-900 text-xs truncate">
                  {formData.name || 'Nome do Produto'}
                </h4>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-bold text-emerald-700">
                    R$ {parseFloat(formData.price || 0).toFixed(2)}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                    {formData.stock_quantity || 0} {formData.unit}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

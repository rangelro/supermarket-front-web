import { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  RefreshCw,
  Trash2,
  X,
  Check,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { citiesService } from '../../services/citiesService';

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export default function CityList() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [state, setState] = useState('RN');
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const fetchCities = async () => {
    setLoading(true);
    try {
      const data = await citiesService.getCities();
      setCities(Array.isArray(data) ? data : []);
    } catch (_err) {
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handleOpenModal = () => {
    setModalError(null);
    setName('');
    setState('RN');
    setShowModal(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);

    if (!name.trim()) {
      setModalError('Informe o nome da cidade.');
      return;
    }

    setModalSubmitting(true);
    try {
      await citiesService.createCity(name.trim(), state);
      setShowModal(false);
      fetchCities();
    } catch (err) {
      const detail = err.response?.data?.name?.[0] || err.response?.data?.non_field_errors?.[0];
      setModalError(detail || 'Não foi possível cadastrar a cidade.');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleToggleActive = async (city) => {
    const previous = cities;
    setCities((prev) => prev.map((c) => (c.id === city.id ? { ...c, is_active: !c.is_active } : c)));
    try {
      await citiesService.setCityActive(city.id, !city.is_active);
    } catch (_err) {
      setCities(previous);
    }
  };

  const handleDelete = async (city) => {
    if (!window.confirm(`Excluir ${city.name}/${city.state}? Isso só é possível se não houver endereços vinculados.`)) {
      return;
    }
    try {
      await citiesService.deleteCity(city.id);
      fetchCities();
    } catch (err) {
      alert(err.response?.data?.detail || 'Não foi possível excluir esta cidade.');
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <MapPin className="text-emerald-600" size={22} /> Cidades Atendidas
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Controle onde a loja realiza entregas. Só cidades ativas aparecem para o cliente no app.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-xl shadow-xs text-xs transition-colors cursor-pointer"
        >
          <Plus size={16} />
          <span>Nova Cidade</span>
        </button>
      </div>

      {/* Lista com Scroll Interno */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1">
        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center text-gray-500 h-full flex flex-col items-center justify-center">
            <RefreshCw className="animate-spin text-emerald-600 mb-2" size={24} />
            <p className="text-xs">Carregando cidades atendidas...</p>
          </div>
        ) : cities.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center text-gray-500 h-full flex flex-col items-center justify-center">
            <MapPin className="text-gray-300 mb-2" size={28} />
            <p className="text-xs">Nenhuma cidade cadastrada ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {cities.map((city) => (
              <div
                key={city.id}
                className="bg-white p-4 rounded-2xl shadow-xs border border-gray-200 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl group-hover:scale-105 transition-transform">
                      <MapPin size={18} />
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        city.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {city.is_active ? 'Atende' : 'Inativa'}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-0.5">{city.name}</h3>
                  <p className="text-[11px] text-gray-400">UF: {city.state}</p>
                </div>

                <div className="flex items-center justify-between gap-1 pt-3 mt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleToggleActive(city)}
                    className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg ${
                      city.is_active
                        ? 'text-emerald-700 hover:bg-emerald-50'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                    title={city.is_active ? 'Desativar atendimento' : 'Ativar atendimento'}
                  >
                    {city.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    {city.is_active ? 'Ativa' : 'Ativar'}
                  </button>
                  <button
                    onClick={() => handleDelete(city)}
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
                <MapPin size={18} className="text-emerald-600" />
                Nova Cidade Atendida
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
                  Nome da Cidade
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Natal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  UF
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  {UFS.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
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

import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  RefreshCw,
  Trash2,
  Edit2,
  X,
  Check,
  MapPin,
  Phone,
} from 'lucide-react';
import { supervisorsService } from '../../services/supervisorsService';
import { citiesService } from '../../services/citiesService';

const emptyForm = {
  username: '', email: '', password: '', first_name: '', last_name: '', phone: '', city_id: '',
};

export default function SupervisorList() {
  const [supervisors, setSupervisors] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const fetchSupervisors = async () => {
    setLoading(true);
    try {
      const data = await supervisorsService.getSupervisors();
      const list = data.results ? data.results : (Array.isArray(data) ? data : []);
      setSupervisors(list);
    } catch (_err) {
      setSupervisors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupervisors();
    citiesService.getCities()
      .then((data) => setCities((data || []).filter((c) => c.is_active)))
      .catch(() => setCities([]));
  }, []);

  const handleOpenModal = (supervisor = null) => {
    setModalError(null);
    if (supervisor) {
      setEditingSupervisor(supervisor);
      setForm({
        username: supervisor.username,
        email: supervisor.email || '',
        password: '',
        first_name: supervisor.first_name || '',
        last_name: supervisor.last_name || '',
        phone: supervisor.phone || '',
        city_id: supervisor.city?.id || '',
      });
    } else {
      setEditingSupervisor(null);
      setForm(emptyForm);
    }
    setShowModal(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);

    if (!editingSupervisor && !form.username.trim()) {
      setModalError('Informe o usuário de acesso.');
      return;
    }
    if (!editingSupervisor && !form.password.trim()) {
      setModalError('Informe uma senha para o novo supervisor.');
      return;
    }
    if (!form.city_id) {
      setModalError('Selecione a cidade do supervisor.');
      return;
    }

    setModalSubmitting(true);
    try {
      const payload = {
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        city_id: form.city_id,
      };
      if (!editingSupervisor) {
        payload.username = form.username.trim();
        payload.password = form.password;
      } else if (form.password.trim()) {
        payload.password = form.password;
      }

      if (editingSupervisor) {
        await supervisorsService.updateSupervisor(editingSupervisor.id, payload);
      } else {
        await supervisorsService.createSupervisor(payload);
      }
      setShowModal(false);
      fetchSupervisors();
    } catch (err) {
      const data = err.response?.data || {};
      const detail = data.username?.[0] || data.email?.[0] || data.city_id?.[0] || data.password?.[0] || data.detail;
      setModalError(detail || 'Não foi possível salvar o supervisor.');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDelete = async (supervisor) => {
    if (!window.confirm(`Excluir o supervisor "${supervisor.username}"?`)) return;
    try {
      await supervisorsService.deleteSupervisor(supervisor.id);
      fetchSupervisors();
    } catch (err) {
      alert(err.response?.data?.detail || 'Não foi possível excluir este supervisor.');
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="text-emerald-600" size={22} /> Supervisores de Cidade
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Cada supervisor gerencia apenas a cidade a que está vinculado
          </p>
        </div>

        <button
          onClick={() => handleOpenModal(null)}
          className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-xl shadow-xs text-xs transition-colors cursor-pointer"
        >
          <Plus size={16} />
          <span>Novo Supervisor</span>
        </button>
      </div>

      {/* Lista com Scroll Interno */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1">
        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center text-gray-500 h-full flex flex-col items-center justify-center">
            <RefreshCw className="animate-spin text-emerald-600 mb-2" size={24} />
            <p className="text-xs">Carregando supervisores...</p>
          </div>
        ) : supervisors.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center text-gray-500 h-full flex flex-col items-center justify-center">
            <Users className="text-gray-300 mb-2" size={28} />
            <p className="text-xs">Nenhum supervisor cadastrado ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {supervisors.map((sup) => (
              <div
                key={sup.id}
                className="bg-white p-4 rounded-2xl shadow-xs border border-gray-200 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl group-hover:scale-105 transition-transform">
                      <Users size={18} />
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800">
                      Supervisor
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-0.5">
                    {sup.first_name ? `${sup.first_name} ${sup.last_name || ''}` : sup.username}
                  </h3>
                  <p className="text-[11px] text-gray-400">@{sup.username}</p>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin size={11} /> {sup.city ? `${sup.city.name}/${sup.city.state}` : 'Sem cidade'}
                  </p>
                  {sup.phone && (
                    <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <Phone size={11} /> {sup.phone}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-1 pt-3 mt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenModal(sup)}
                    className="p-1 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                    title="Editar"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(sup)}
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
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Users size={18} className="text-emerald-600" />
                {editingSupervisor ? 'Editar Supervisor' : 'Novo Supervisor'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-md">
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
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Usuário de Acesso</label>
                <input
                  type="text"
                  required
                  disabled={!!editingSupervisor}
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Ex: supervisor.natal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  {editingSupervisor ? 'Nova Senha (deixe em branco pra manter)' : 'Senha'}
                </label>
                <input
                  type="password"
                  required={!editingSupervisor}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Nome</label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Sobrenome</label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Telefone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Cidade</label>
                <select
                  required
                  value={form.city_id}
                  onChange={(e) => setForm({ ...form, city_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="">Selecione...</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}/{c.state}</option>
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

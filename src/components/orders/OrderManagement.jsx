import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Eye,
  ChefHat,
  ChevronRight,
  AlertCircle,
  User,
  Calendar,
  DollarSign
} from 'lucide-react';
import { ordersService } from '../../services/ordersService';

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ordersService.getOrders();
      const orderList = Array.isArray(data) ? data : data.results || [];
      setOrders(orderList);
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
      setError('Não foi possível carregar a lista de pedidos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Polling a cada 15 segundos para atualizar novos pedidos recebidos do app
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await ordersService.updateOrderStatus(orderId, newStatus);
      // Atualiza lista localmente após sucesso
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert('Falha ao atualizar o status do pedido. Tente novamente.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const statusBadges = {
    PENDING: { label: 'Pendente', bg: 'bg-amber-100 text-amber-800 border-amber-300', icon: Clock },
    PREPARING: { label: 'Em Preparação', bg: 'bg-blue-100 text-blue-800 border-blue-300', icon: ChefHat },
    IN_DELIVERY: { label: 'A Caminho', bg: 'bg-purple-100 text-purple-800 border-purple-300', icon: Truck },
    COMPLETED: { label: 'Entregue', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle2 },
    CANCELED: { label: 'Cancelado', bg: 'bg-red-100 text-red-800 border-red-300', icon: XCircle },
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      order.id.toString().includes(searchQuery) ||
      (order.user && order.user.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const countByStatus = (status) => orders.filter((o) => o.status === status).length;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMoney = (val) => {
    const num = parseFloat(val) || 0;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden space-y-4">
      {/* Top Header & Métricas Rápidas */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-200 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="text-emerald-600" size={22} /> Gestão de Pedidos da Loja
            </h1>
            <p className="text-xs text-gray-500">
              Acompanhe pedidos enviados pelo app mobile e atualize o status para notificar os clientes.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors shrink-0 self-start md:self-auto"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-emerald-600' : ''} />
            <span>Atualizar Pedidos</span>
          </button>
        </div>

        {/* Counters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              statusFilter === 'ALL'
                ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider block opacity-70">Todos</span>
            <span className="text-base font-extrabold">{orders.length}</span>
          </button>

          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              statusFilter === 'PENDING'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider block opacity-70">Pendentes</span>
            <span className="text-base font-extrabold">{countByStatus('PENDING')}</span>
          </button>

          <button
            onClick={() => setStatusFilter('PREPARING')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              statusFilter === 'PREPARING'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider block opacity-70">Em Preparação</span>
            <span className="text-base font-extrabold">{countByStatus('PREPARING')}</span>
          </button>

          <button
            onClick={() => setStatusFilter('IN_DELIVERY')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              statusFilter === 'IN_DELIVERY'
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                : 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider block opacity-70">A Caminho</span>
            <span className="text-base font-extrabold">{countByStatus('IN_DELIVERY')}</span>
          </button>

          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`p-2.5 rounded-xl border text-left transition-all col-span-2 sm:col-span-1 ${
              statusFilter === 'COMPLETED'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider block opacity-70">Entregues</span>
            <span className="text-base font-extrabold">{countByStatus('COMPLETED')}</span>
          </button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white p-3 rounded-2xl shadow-xs border border-gray-200 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente ou Nº do pedido..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={15} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Todos os Status</option>
            <option value="PENDING">Somente Pendentes</option>
            <option value="PREPARING">Em Preparação</option>
            <option value="IN_DELIVERY">A Caminho</option>
            <option value="COMPLETED">Entregues</option>
            <option value="CANCELED">Cancelados</option>
          </select>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 flex-1 overflow-hidden flex flex-col">
        {loading && orders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-400">
            <RefreshCw size={28} className="animate-spin text-emerald-600 mb-2" />
            <p className="text-xs">Carregando lista de pedidos...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-400">
            <ShoppingBag size={36} className="text-gray-300 mb-2 stroke-1" />
            <p className="text-sm font-semibold text-gray-700">Nenhum pedido encontrado</p>
            <p className="text-xs text-gray-400">Tente ajustar o filtro ou fazer novos pedidos no app.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filteredOrders.map((order) => {
              const badge = statusBadges[order.status] || statusBadges.PENDING;
              const StatusIcon = badge.icon;
              const isUpdating = updatingOrderId === order.id;

              return (
                <div
                  key={order.id}
                  className="p-4 hover:bg-gray-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Dados do Pedido */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-gray-900">Pedido #{order.id}</span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}
                      >
                        <StatusIcon size={12} />
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User size={13} className="text-gray-400" /> {order.user || 'Cliente'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-gray-400" /> {formatDate(order.created_at)}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-gray-800">
                        <DollarSign size={13} className="text-emerald-600" /> {formatMoney(order.total_amount)}
                      </span>
                    </div>
                  </div>

                  {/* Ações Rápidas de Mudança de Status */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                        disabled={isUpdating}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1"
                      >
                        <ChefHat size={14} />
                        <span>Iniciar Preparação</span>
                      </button>
                    )}

                    {order.status === 'PREPARING' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'IN_DELIVERY')}
                        disabled={isUpdating}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1 animate-pulse"
                      >
                        <Truck size={14} />
                        <span>Enviar a Caminho (Notificar)</span>
                      </button>
                    )}

                    {order.status === 'IN_DELIVERY' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                        disabled={isUpdating}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 size={14} />
                        <span>Marcar Entregue</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-xl transition-colors flex items-center gap-1"
                    >
                      <Eye size={14} />
                      <span>Ver Detalhes</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Pedido */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-lg w-full p-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Detalhes do Pedido #{selectedOrder.id}</h3>
                <p className="text-xs text-gray-500">Cliente: {selectedOrder.user} • {formatDate(selectedOrder.created_at)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Itens do Pedido */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Itens Solicitados</span>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                selectedOrder.items.map((item) => (
                  <div key={item.id} className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-gray-800 block">{item.product?.name || `Produto #${item.product_id}`}</span>
                      <span className="text-gray-500">{item.quantity}x {formatMoney(item.unit_price)}</span>
                    </div>
                    <span className="font-extrabold text-emerald-600">{formatMoney(item.subtotal)}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">Sem itens detalhados.</p>
              )}
            </div>

            <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">Total do Pedido:</span>
              <span className="text-lg font-extrabold text-emerald-600">{formatMoney(selectedOrder.total_amount)}</span>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  ShoppingBag,
  Clock,
  RefreshCw,
  BarChart3,
  Layers,
  ArrowUpRight,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { ordersService } from '../../services/ordersService';

export default function ReportsDashboard() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await ordersService.getReports();
      setReportData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Erro ao carregar relatórios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden space-y-4">
      {/* Header do Dashboard */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="text-emerald-600" size={22} /> Visão Geral da Loja & Vendas
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Acompanhe o faturamento, movimentação de caixa e produtos em estoque crítico
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden sm:inline-block">
            {lastUpdated.toLocaleTimeString('pt-BR')}
          </span>
          <button
            onClick={fetchReports}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 font-medium px-3 py-1.5 border border-gray-300 rounded-xl shadow-xs text-xs transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-emerald-600' : ''} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Grid Principal Compacto */}
      {loading && !reportData ? (
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center text-gray-500">
          <RefreshCw className="animate-spin text-emerald-600 mb-2" size={24} />
          <p className="text-xs">Carregando métricas da loja...</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {/* Top Cards KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
            {/* Card 1: Vendas */}
            <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Vendas Realizadas</p>
                <h3 className="text-xl font-bold text-gray-900 mt-0.5">
                  {reportData?.total_sales_count || 0} <span className="text-xs font-normal text-gray-500">pedidos</span>
                </h3>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
                  <ArrowUpRight size={13} />
                  <span>+12.5% no período</span>
                </div>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <ShoppingBag size={20} />
              </div>
            </div>

            {/* Card 2: Faturamento */}
            <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Faturamento Total</p>
                <h3 className="text-xl font-bold text-gray-900 mt-0.5">
                  R$ {(reportData?.total_revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
                  <CheckCircle size={13} />
                  <span>Médio R$ {(reportData?.average_ticket || 0).toFixed(2)}</span>
                </div>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <DollarSign size={20} />
              </div>
            </div>

            {/* Card 3: Estoque Crítico */}
            <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Estoque Crítico</p>
                <h3 className="text-xl font-bold text-red-600 mt-0.5">
                  {reportData?.critical_stock_count || 0} <span className="text-xs font-normal text-gray-500">itens</span>
                </h3>
                <div className="flex items-center gap-1 text-[11px] text-red-600 font-semibold mt-1">
                  <AlertTriangle size={13} />
                  <span>Abaixo do mínimo</span>
                </div>
              </div>
              <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
                <AlertTriangle size={20} />
              </div>
            </div>

            {/* Card 4: Pedidos em Caixa */}
            <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pedidos em Caixa</p>
                <h3 className="text-xl font-bold text-amber-600 mt-0.5">
                  {reportData?.pending_orders || 0} <span className="text-xs font-normal text-gray-500">fila</span>
                </h3>
                <div className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold mt-1">
                  <Clock size={13} />
                  <span>Aguardando baixa</span>
                </div>
              </div>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <Clock size={20} />
              </div>
            </div>
          </div>

          {/* Gráfico + Setores */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-44 shrink-0">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xs border border-gray-200 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                  <TrendingUp className="text-emerald-600" size={15} /> Histórico de Vendas Semanal
                </h3>
                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Calendar size={10} /> 7 dias
                </span>
              </div>

              <div className="space-y-2 pt-1 flex-1 flex flex-col justify-around">
                {reportData?.sales_by_period?.slice(0, 4).map((item, idx) => {
                  const maxVal = Math.max(...reportData.sales_by_period.map((s) => s.total));
                  const percentage = Math.round((item.total / maxVal) * 100);

                  return (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between text-[11px] font-semibold text-gray-700">
                        <span>{item.date}</span>
                        <span className="text-gray-900">R$ {item.total.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                  <Layers className="text-emerald-600" size={15} /> Setores em Destaque
                </h3>
              </div>

              <div className="space-y-2 flex-1 flex flex-col justify-around">
                {reportData?.top_selling_categories?.slice(0, 3).map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50/80 rounded-xl border border-gray-100 text-xs">
                    <div>
                      <p className="font-bold text-gray-800 text-[11px]">{cat.name}</p>
                      <p className="text-[10px] text-gray-500">R$ {cat.revenue.toFixed(2)}</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {cat.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabela de Produtos em Estoque Crítico (Com maior espaçamento em relação aos cards superiores) */}
          <div className="flex-1 mt-6 bg-white rounded-2xl shadow-xs border border-gray-200 flex flex-col overflow-hidden">
            <div className="bg-red-50/70 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-red-800 font-bold text-xs">
                <AlertTriangle size={16} className="text-red-600" />
                <h2>Itens em Estoque Crítico</h2>
              </div>
              <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">
                Atenção
              </span>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 z-10">
                  <tr>
                    <th className="py-2 px-3">Cód.</th>
                    <th className="py-2 px-3">Produto</th>
                    <th className="py-2 px-3">Setor</th>
                    <th className="py-2 px-3">Estoque Atual</th>
                    <th className="py-2 px-3">Mínimo Recomendado</th>
                    <th className="py-2 px-3 text-right">Situação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {reportData?.critical_products?.map((prod) => (
                    <tr key={prod.id} className="hover:bg-red-50/20 transition-colors">
                      <td className="py-2 px-3 font-mono text-[11px] text-gray-400">#{prod.id}</td>
                      <td className="py-2 px-3 font-bold text-gray-900">{prod.name}</td>
                      <td className="py-2 px-3 text-gray-600">{prod.category}</td>
                      <td className="py-2 px-3">
                        <span className="font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full text-[11px]">
                          {prod.current_stock} {prod.unit}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-600 font-semibold">
                        {prod.min_stock} {prod.unit}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-bold inline-block">
                          Abaixo do Mínimo
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

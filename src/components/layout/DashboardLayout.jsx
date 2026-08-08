import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Tags,
  LogOut,
  User as UserIcon,
  Bell,
  Search,
  Store,
  Menu,
  X,
  Lock,
  CheckCircle,
  AlertCircle,
  ShoppingBag
} from 'lucide-react';
import { authService } from '../../services/authService';
import { ordersService } from '../../services/ordersService';

export default function DashboardLayout({ children, activeTab, setActiveTab, activeProductEdit, onSelectNotificationItem }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = async () => {
    try {
      const reports = await ordersService.getReports();
      if (reports && Array.isArray(reports.critical_products)) {
        setNotifications(reports.critical_products);
      }
    } catch (_err) {
      console.error('Erro ao carregar notificações:', _err);
    }
  };

  const loadUserProfile = async () => {
    if (authService.isAuthenticated()) {
      try {
        const profileData = await authService.getProfile();
        setUser(profileData);
      } catch (_err) {
        setUser({ username: 'gerente_loja', first_name: 'Carlos', last_name: 'Eduardo', email: 'carlos@supermercado.com' });
      }
    } else {
      setUser({ username: 'gerente_loja', first_name: 'Carlos', last_name: 'Eduardo', email: 'carlos@supermercado.com' });
    }
  };

  useEffect(() => {
    loadUserProfile();
    loadNotifications();

    const interval = setInterval(loadNotifications, 8000);

    const handleLogoutEvent = () => setUser(null);
    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth:logout', handleLogoutEvent);
      clearInterval(interval);
    };
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      await authService.login(loginForm.username, loginForm.password);
      await loadUserProfile();
      setShowLoginModal(false);
      setLoginForm({ username: '', password: '' });
    } catch (_err) {
      setLoginError('Usuário ou senha incorretos. Tente novamente.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  const navItems = [
    { id: 'reports', label: 'Visão Geral & Vendas', icon: LayoutDashboard },
    { id: 'orders', label: 'Gestão de Pedidos', icon: ShoppingBag },
    { id: 'products', label: 'Estoque de Produtos', icon: Package },
    { id: 'product-form', label: activeProductEdit ? 'Editar Produto' : 'Novo Produto', icon: PlusCircle, badge: activeProductEdit ? 'Editando' : null },
    { id: 'categories', label: 'Categorias de Produtos', icon: Tags },
  ];

  const zeroStockCount = notifications.filter(n => (n.current_stock ?? n.stock_quantity ?? 0) === 0).length;

  return (
    <div className="h-screen w-screen max-h-screen max-w-vw bg-gray-50 flex flex-col font-sans overflow-hidden">
      {/* Topbar compacta */}
      <header className="bg-white border-b border-gray-200 shrink-0 z-30 shadow-xs">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
              title="Menu Principal"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('reports')}>
              <div className="bg-emerald-600 text-white p-1.5 rounded-lg shadow-sm">
                <Store size={20} className="stroke-[2.5]" />
              </div>
              <div>
                <span className="font-bold text-gray-900 text-base leading-none tracking-tight block">SGM Supermercados</span>
                <span className="text-[11px] text-gray-500 font-medium">Gestão de Loja e Estoque</span>
              </div>
            </div>
          </div>

          {/* Busca Rápida no Sistema */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                placeholder="Buscar produto por nome, código ou categoria..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-100/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all placeholder-gray-400"
              />
            </div>
          </div>

          {/* Notificações e Perfil do Usuário */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative"
                title="Alertas de Estoque"
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full ${zeroStockCount > 0 ? 'bg-red-600 animate-pulse' : 'bg-amber-500'}`}></span>
                )}
              </button>

              {/* Popover de Notificações */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-84 bg-white rounded-2xl shadow-2xl border border-gray-200 p-3.5 z-50 animate-in fade-in zoom-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2.5">
                    <span className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                      <Bell size={14} className="text-emerald-600" /> Alertas da Loja
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${zeroStockCount > 0 ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-800'}`}>
                      {notifications.length} {notifications.length === 1 ? 'alerta' : 'alertas'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs max-h-80 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-xs">
                        Nenhum alerta de estoque no momento.
                      </div>
                    ) : (
                      notifications.map((item) => {
                        const stock = item.current_stock ?? item.stock_quantity ?? 0;
                        const isZero = stock === 0;

                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              setNotificationsOpen(false);
                              if (onSelectNotificationItem) {
                                onSelectNotificationItem(item);
                              }
                            }}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                              isZero
                                ? 'bg-red-50/90 border-red-200 text-red-900 hover:bg-red-100/90 shadow-2xs'
                                : 'bg-amber-50/80 border-amber-200 text-amber-900 hover:bg-amber-100/80'
                            }`}
                          >
                            <AlertCircle size={16} className={`shrink-0 mt-0.5 ${isZero ? 'text-red-600' : 'text-amber-600'}`} />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold block text-xs truncate max-w-[170px]">{item.name}</span>
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${isZero ? 'bg-red-600 text-white uppercase' : 'bg-amber-200 text-amber-900'}`}>
                                  {isZero ? 'ESGOTADO' : `${stock} un`}
                                </span>
                              </div>
                              <p className="text-[11px] mt-0.5 opacity-90">
                                {isZero
                                  ? 'Produto zerou no estoque! Clique para ver detalhes.'
                                  : `Nível crítico (mín: ${item.min_stock ?? 5} un). Clique para reposição.`}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-5 w-px bg-gray-200"></div>

            {user ? (
              <div className="flex items-center gap-2 pl-1">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-semibold text-gray-800 leading-tight">
                    {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium">Gerente de Loja</p>
                </div>
                <div className="h-8 w-8 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-xs border border-emerald-300 shadow-xs">
                  {user.first_name ? user.first_name[0].toUpperCase() : user.username[0].toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sair do Sistema"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm transition-colors"
              >
                <UserIcon size={14} />
                <span>Acessar Conta</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar compacta sem scroll externo */}
        <aside
          className={`${
            sidebarOpen ? 'w-56' : 'w-0 sm:w-16'
          } bg-white border-r border-gray-200 transition-all duration-200 flex flex-col justify-between overflow-hidden shrink-0 z-20`}
        >
          <div className="p-3 space-y-4">
            <div className="space-y-1">
              <p className={`text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2 ${!sidebarOpen && 'sm:hidden'}`}>
                Menu de Gestão
              </p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-xs'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={17} className={isActive ? 'text-emerald-600' : 'text-gray-400'} />
                    <span className={`truncate ${!sidebarOpen && 'sm:hidden'}`}>{item.label}</span>
                    {item.badge && sidebarOpen && (
                      <span className="ml-auto text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 border-t border-gray-100">
            <div className={`bg-emerald-50/70 border border-emerald-200 rounded-xl p-2.5 ${!sidebarOpen && 'sm:hidden'}`}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                  <CheckCircle size={13} className="text-emerald-600" /> Loja Principal
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-[10px] text-emerald-700">
                Estoque Sincronizado
              </p>
            </div>
          </div>
        </aside>

        {/* Área Principal sem Scrollbar externa (tamanho exato da tela) */}
        <main className="flex-1 overflow-hidden p-4 bg-gray-50 flex flex-col">
          <div className="w-full h-full max-w-7xl mx-auto flex flex-col overflow-hidden">
            {children}
          </div>
        </main>
      </div>

      {/* Modal de Login */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Lock className="text-emerald-600" size={18} /> Entrar no Sistema SGM
              </h3>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-gray-600 mb-3">
              Informe seu usuário e senha cadastrados para acessar o gerenciamento do supermercado.
            </p>

            {loginError && (
              <div className="mb-3 bg-red-50 border border-red-200 text-red-700 text-xs p-2.5 rounded-xl flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Usuário
                </label>
                <input
                  type="text"
                  required
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  placeholder="Seu usuário de acesso"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium shadow-sm"
                >
                  {loginLoading ? 'Entrando...' : 'Entrar no Sistema'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

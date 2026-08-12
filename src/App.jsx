import { useState } from 'react';
import DashboardLayout from './components/layout/DashboardLayout';
import ProductList from './components/catalog/ProductList';
import ProductForm from './components/catalog/ProductForm';
import CategoryList from './components/catalog/CategoryList';
import ReportsDashboard from './components/orders/ReportsDashboard';
import OrderManagement from './components/orders/OrderManagement';
import CityList from './components/cities/CityList';
import SupervisorList from './components/supervisors/SupervisorList';

export default function App() {
  const [activeTab, setActiveTab] = useState('reports');
  const [activeProductEdit, setActiveProductEdit] = useState(null);
  const [user, setUser] = useState(null);

  const MANAGER_ONLY_TABS = ['cities', 'supervisors'];

  const handleUserChange = (newUser) => {
    setUser(newUser);
    // Evita ficar preso numa aba exclusiva do gerente após logout/troca de usuário
    if (newUser?.role !== 'MANAGER' && MANAGER_ONLY_TABS.includes(activeTab)) {
      setActiveTab('reports');
    }
  };

  const handleCreateNewProduct = () => {
    setActiveProductEdit(null);
    setActiveTab('product-form');
  };

  const handleEditProduct = (product) => {
    setActiveProductEdit(product);
    setActiveTab('product-form');
  };

  const handleCancelForm = () => {
    setActiveProductEdit(null);
    setActiveTab('products');
  };

  const handleFormSuccess = () => {
    setActiveProductEdit(null);
    setActiveTab('products');
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      setActiveTab={(tab) => {
        if (tab !== 'product-form') {
          setActiveProductEdit(null);
        }
        setActiveTab(tab);
      }}
      activeProductEdit={activeProductEdit}
      onUserChange={handleUserChange}
    >
      {activeTab === 'reports' && <ReportsDashboard user={user} />}

      {activeTab === 'orders' && <OrderManagement user={user} />}

      {activeTab === 'products' && (
        <ProductList
          user={user}
          onEditProduct={handleEditProduct}
          onCreateNewProduct={handleCreateNewProduct}
        />
      )}

      {activeTab === 'product-form' && (
        <ProductForm
          user={user}
          productToEdit={activeProductEdit}
          onCancel={handleCancelForm}
          onSuccess={handleFormSuccess}
        />
      )}

      {activeTab === 'categories' && <CategoryList user={user} />}

      {activeTab === 'cities' && <CityList />}

      {activeTab === 'supervisors' && <SupervisorList />}
    </DashboardLayout>
  );
}

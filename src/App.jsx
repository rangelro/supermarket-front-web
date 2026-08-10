import { useState } from 'react';
import DashboardLayout from './components/layout/DashboardLayout';
import ProductList from './components/catalog/ProductList';
import ProductForm from './components/catalog/ProductForm';
import CategoryList from './components/catalog/CategoryList';
import ReportsDashboard from './components/orders/ReportsDashboard';
import OrderManagement from './components/orders/OrderManagement';

export default function App() {
  const [activeTab, setActiveTab] = useState('reports');
  const [activeProductEdit, setActiveProductEdit] = useState(null);

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
    >
      {activeTab === 'reports' && <ReportsDashboard />}

      {activeTab === 'orders' && <OrderManagement />}

      {activeTab === 'products' && (
        <ProductList
          onEditProduct={handleEditProduct}
          onCreateNewProduct={handleCreateNewProduct}
        />
      )}

      {activeTab === 'product-form' && (
        <ProductForm
          productToEdit={activeProductEdit}
          onCancel={handleCancelForm}
          onSuccess={handleFormSuccess}
        />
      )}

      {activeTab === 'categories' && <CategoryList />}
    </DashboardLayout>
  );
}

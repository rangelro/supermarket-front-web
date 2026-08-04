import React, { useState } from 'react';
import DashboardLayout from './components/layout/DashboardLayout';
import ProductList from './components/catalog/ProductList';
import ProductForm from './components/catalog/ProductForm';
import CategoryList from './components/catalog/CategoryList';
import ReportsDashboard from './components/orders/ReportsDashboard';
import OrderManagement from './components/orders/OrderManagement';

export default function App() {
  // Controle de navegação das abas/módulos
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' | 'orders' | 'products' | 'product-form' | 'categories'
  const [activeProductEdit, setActiveProductEdit] = useState(null);

  // Ação ao clicar em "Cadastrar Produto"
  const handleCreateNewProduct = () => {
    setActiveProductEdit(null);
    setActiveTab('product-form');
  };

  // Ação ao clicar em "Editar Produto"
  const handleEditProduct = (product) => {
    setActiveProductEdit(product);
    setActiveTab('product-form');
  };

  // Ação ao cancelar a edição/criação no formulário
  const handleCancelForm = () => {
    setActiveProductEdit(null);
    setActiveTab('products');
  };

  // Ação ao concluir com sucesso o salvamento no formulário
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

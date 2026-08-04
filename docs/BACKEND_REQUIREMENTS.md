# Especificação de Endpoints e Recursos Pendentes no Backend (Django DRF)

Este documento registra todas as funcionalidades, rotas e campos de modelo que a interface do usuário do **SGM (Sistema de Gestão de Supermercado e Controle de Estoque)** necessita, mas que ainda não estão totalmente implementadas no backend Django REST Framework (`supermarket-backend`).

---

## 1. Módulo de Catálogo (`catalog`)

### 1.1 Mutação de Produtos (POST, PUT, DELETE)
* **Arquivo Backend:** `catalog/views.py`
* **Situação Atual:** `ProductViewSet` herda de `viewsets.ReadOnlyModelViewSet` (permite apenas `GET`).
* **Requisito do Frontend:** Alterar para `viewsets.ModelViewSet` para permitir o cadastro, atualização e exclusão de produtos.
* **Endpoint Desejado:**
  * `POST /api/catalog/products/` (Criar produto)
  * `PUT /api/catalog/products/{id}/` (Atualizar produto)
  * `DELETE /api/catalog/products/{id}/` (Excluir produto)

### 1.2 Campos Adicionais no Modelo de Produto (`Product`)
* **Arquivo Backend:** `catalog/models.py` e `catalog/serializers.py`
* **Situação Atual:** O modelo `Product` possui apenas `category`, `name`, `description`, `price`, `unit`, `image`.
* **Novos Campos Necessários:**
  ```python
  class Product(models.Model):
      # ... campos existentes ...
      stock_quantity = models.IntegerField(default=0, verbose_name="Quantidade em Estoque")
      min_stock = models.IntegerField(default=5, verbose_name="Estoque Mínimo")
      is_active = models.BooleanField(default=True, verbose_name="Ativo")
  ```
* **Impacto:** Permite controlar alertas de estoque crítico e visibilidade de produtos.

### 1.3 Mutação de Categorias (POST, PUT, DELETE)
* **Arquivo Backend:** `catalog/views.py`
* **Situação Atual:** `CategoryViewSet` herda de `viewsets.ReadOnlyModelViewSet`.
* **Requisito do Frontend:** Alterar para `viewsets.ModelViewSet`.
* **Endpoints Desejados:**
  * `POST /api/catalog/categories/`
  * `PUT /api/catalog/categories/{id}/`
  * `DELETE /api/catalog/categories/{id}/`

### 1.4 Alinhamento de Prefixo de URL
* **Arquivo Backend:** `config/urls.py`
* **Situação Atual:** `path('api/', include('catalog.urls'))` expõe `/api/products/` e `/api/categories/`.
* **Requisito do Frontend:** Adicionar rota alias `path('api/catalog/', include('catalog.urls'))` para responder em `/api/catalog/products/` conforme padrão do módulo.

---

## 2. Módulo de Vendas e Relatórios (`orders`)

### 2.1 Endpoint de Indicadores do Dashboard (`/api/orders/reports/`)
* **Arquivo Backend:** `orders/views.py` ou `orders/urls.py`
* **Situação Atual:** Inexistente. O backend possui apenas o CRUD de pedidos em `OrderViewSet`.
* **Requisito do Frontend:** Criar uma action personalizada `@action(detail=False, methods=['get'])` em `OrderViewSet` ou uma `APIView` para relatórios.
* **Payload de Resposta Esperado (`JSON` em `snake_case`):**
  ```json
  {
    "total_sales_count": 142,
    "total_revenue": 28490.50,
    "average_ticket": 200.63,
    "critical_stock_count": 8,
    "pending_orders": 14,
    "sales_by_period": [
      { "date": "Segunda", "total": 3200.00, "count": 22 },
      { "date": "Terça", "total": 4100.50, "count": 28 },
      { "date": "Quarta", "total": 3800.00, "count": 25 },
      { "date": "Quinta", "total": 5400.20, "count": 34 },
      { "date": "Sexta", "total": 6890.80, "count": 41 },
      { "date": "Sábado", "total": 5099.00, "count": 32 }
    ],
    "critical_products": [
      { "id": 101, "name": "Leite Integral 1L", "category": "Laticínios", "current_stock": 3, "min_stock": 15, "unit": "un" }
    ],
    "top_selling_categories": [
      { "name": "Mercearia", "percentage": 42, "revenue": 11966.01 }
    ]
  }
  ```

---

## 3. Resumo de Teste de Integração

| Endpoint | Método HTTP | Status Backend Atual | Ação no Frontend |
|---|---|---|---|
| `/api/auth/token/` | POST | 🟢 Implementado | Autenticação JWT funcionando |
| `/api/auth/profile/` | GET | 🟢 Implementado | Carregamento de Perfil |
| `/api/catalog/products/` | GET | 🟢 ReadOnly (com paginação DRF) | Suportado no `ProductList.jsx` |
| `/api/catalog/products/` | POST/PUT/DELETE | 🟡 Requer ModelViewSet | Interface pronta no `ProductForm.jsx` |
| `/api/catalog/categories/` | GET | 🟢 ReadOnly | Suportado no `CategoryList.jsx` e Form |
| `/api/orders/reports/` | GET | 🔴 Não Implementado | Simulação automática no `ReportsDashboard.jsx` com fallback gracioso |

---
*Documento gerado automaticamente pelo Desenvolvedor Front-end Sênior SGM.*

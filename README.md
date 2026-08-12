# SGM — Portal Web (Frontend)

Interface web do **SGM (Sistema de Gestão de Supermercado e Controle de Estoque)**. É o painel administrativo usado por **gerentes** e **supervisores de cidade** para gerenciar catálogo de produtos, categorias, pedidos/vendas, cidades atendidas e supervisores. O frontend consome uma API REST em Django REST Framework (`supermarket-backend`) via autenticação JWT.

## Funcionalidades

- **Relatórios**: dashboard com indicadores de vendas, faturamento, ticket médio e estoque crítico.
- **Pedidos**: gestão de vendas/pedidos.
- **Catálogo**: cadastro, edição e listagem de produtos e categorias.
- **Cidades atendidas**: gestão de cidades onde o supermercado opera (exclusivo de gerentes).
- **Supervisores**: gestão dos supervisores de cidade (exclusivo de gerentes).
- **Autenticação**: login via JWT (access/refresh token), com refresh automático de sessão e acesso restrito aos papéis `MANAGER` e `CITY_SUPERVISOR`.

## Pré-requisitos

- **Node.js** 20.x (versão usada em CI e Docker)
- **npm** (gerenciador de pacotes do projeto — há `package-lock.json`)
- Backend `supermarket-backend` (Django REST Framework) rodando e acessível, para consumo da API

## Instalação e execução local

1. Clone o repositório e instale as dependências:

   ```bash
   npm install
   ```

2. Configure a URL da API backend criando um arquivo `.env` na raiz do projeto:

   ```bash
   VITE_API_URL=http://localhost:8000
   ```

3. Suba o servidor de desenvolvimento (Vite):

   ```bash
   npm run dev
   ```

   A aplicação fica disponível em `http://localhost:3000`.

### Outros scripts disponíveis

```bash
npm run build     # build de produção
npm run preview   # preview local do build de produção
npm run lint      # roda o ESLint
```

### Rodando com Docker

O projeto inclui `Dockerfile` e `docker-compose.yml` para desenvolvimento com hot-reload:

```bash
docker compose up
```

Isso sobe o serviço `supermarket-front-web` na porta `3000`, esperando uma rede externa `supermarket-backend_default` (do backend) já criada.

## Stack e principais bibliotecas

- **[React 18](https://react.dev/)** — biblioteca de UI
- **[Vite](https://vitejs.dev/)** — build tool e dev server
- **[Tailwind CSS 4](https://tailwindcss.com/)** (via `@tailwindcss/vite`) — estilização utilitária
- **[Axios](https://axios-http.com/)** — cliente HTTP, com interceptors para injeção de token JWT e refresh automático em respostas `401`
- **[lucide-react](https://lucide.dev/)** — ícones
- **ESLint** (`eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`) — lint de código

Não há biblioteca de roteamento (React Router, etc.): a navegação entre telas é feita por estado local (`activeTab`) em `App.jsx`, dentro de um layout único (`DashboardLayout`).

## Estrutura de pastas

```
src/
├── main.jsx                  # ponto de entrada da aplicação
├── App.jsx                   # componente raiz: controla a aba ativa e o usuário logado
├── index.css                 # estilos globais / Tailwind
├── components/
│   ├── layout/
│   │   └── DashboardLayout.jsx     # shell do painel (menu, header, autenticação)
│   ├── catalog/
│   │   ├── ProductList.jsx         # listagem de produtos
│   │   ├── ProductForm.jsx         # criação/edição de produtos
│   │   └── CategoryList.jsx        # listagem/gestão de categorias
│   ├── orders/
│   │   ├── OrderManagement.jsx     # gestão de pedidos
│   │   └── ReportsDashboard.jsx    # dashboard de indicadores
│   ├── cities/
│   │   └── CityList.jsx            # gestão de cidades atendidas
│   ├── supervisors/
│   │   └── SupervisorList.jsx      # gestão de supervisores de cidade
│   └── common/
│       └── CityFilterSelect.jsx    # componente compartilhado de filtro por cidade
└── services/
    ├── api.js                  # instância Axios (baseURL, injeção/refresh de token JWT)
    ├── authService.js          # login, perfil, registro, logout
    ├── catalogService.js       # produtos e categorias
    ├── productStockService.js  # estoque de produtos
    ├── ordersService.js        # pedidos/vendas
    ├── citiesService.js        # cidades atendidas
    └── supervisorsService.js   # supervisores de cidade

docs/
└── futura documentação
```

## Controle de acesso

O acesso ao painel é restrito aos papéis `MANAGER` (acesso total) e `CITY_SUPERVISOR` (acesso igual, exceto às abas **Cidades Atendidas** e **Supervisores**, exclusivas de `MANAGER`).

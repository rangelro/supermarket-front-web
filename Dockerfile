# Build Stage / Development Stage for React Vite
FROM node:20-alpine AS dev

WORKDIR /app

# Copiar manifesto de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar arquivos do projeto
COPY . .

# Expor a porta padrão do Vite dev server
EXPOSE 3000

# Rodar em modo de desenvolvimento com hot-reload ativo
CMD ["npm", "run", "dev"]

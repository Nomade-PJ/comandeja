# ComandeJá - Sistema de Gerenciamento de Restaurantes SaaS

ComandeJá é uma aplicação web desenvolvida com React, TypeScript e Express, projetada para ajudar restaurantes a gerenciar pedidos, cardápios e clientes.

## Requisitos

- Node.js 18+ 
- PostgreSQL 12+
- NPM ou Yarn

## Configuração do Banco de Dados

1. Crie um banco de dados PostgreSQL chamado `ComandeJa_SaaS`
2. Execute o script SQL fornecido no arquivo `database_setup.sql` para criar as tabelas necessárias

```bash
psql -U postgres -d ComandeJa_SaaS -f database_setup.sql
```

## Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Crie um arquivo .env com as seguintes variáveis:
VITE_DB_USER=postgres
VITE_DB_HOST=localhost
VITE_DB_NAME=ComandeJa_SaaS
VITE_DB_PASSWORD=sua_senha
VITE_DB_PORT=5432
```

## Execução Local

### Desenvolvimento (Front-end e Back-end separados)

```bash
# Iniciar o servidor de desenvolvimento front-end
npm run dev

# Em outro terminal, iniciar o servidor back-end
npm run start:cjs
```

### Produção (Build completo)

```bash
# Gerar build de produção
npm run build

# Iniciar servidor de produção
npm run start:cjs
```

## Testando a conexão com o banco de dados

```bash
npm run test:db
```

## Deploy na Vercel

Este projeto está configurado para ser implantado na Vercel. Siga estes passos:

1. Crie uma conta na Vercel e instale o CLI
2. Configure o PostgreSQL na Vercel ou use uma instância externa
3. Use o seguinte comando para deploy:

```bash
vercel --prod
```

## Problemas comuns e soluções

### Erro de conexão com o PostgreSQL

Se você encontrar erros de conexão com o banco de dados:

1. Verifique se o PostgreSQL está rodando na porta correta
2. Confirme que as credenciais estão corretas
3. Para ambiente Windows, verifique se o firewall não está bloqueando a conexão

### Problemas com ESM e CommonJS

Este projeto usa ESM (ECMAScript Modules) para o front-end e CommonJS para o back-end. 
Para executar o servidor, use o arquivo server.cjs com o comando:

```bash
npm run start:cjs
```

## Estrutura do Projeto

- `/src`: Código-fonte do front-end React/TypeScript
- `/server.cjs`: API de back-end Express com sintaxe CommonJS
- `/server.js`: Versão ESM do servidor (para compatibilidade)
- `/database_setup.sql`: Script de configuração do banco de dados

## Licença

ISC

# ComandeJá - Sistema de Gerenciamento de Restaurantes SaaS

ComandeJá é uma aplicação web desenvolvida com React, TypeScript e Express, projetada para ajudar restaurantes a gerenciar pedidos, cardápios e clientes.

## Status do Projeto

✅ **Migração Concluída**: O projeto foi completamente migrado para o Supabase. Todas as conexões anteriores com bancos de dados PostgreSQL foram removidas e substituídas pela integração com Supabase.

## Integração com Supabase

A integração com o Supabase foi concluída:

1. ✅ Cliente Supabase configurado em `src/lib/supabase.ts`
2. ✅ Tipos TypeScript para o banco de dados em `src/lib/database.types.ts`
3. ✅ API Express simplificada para trabalhar com Supabase
4. ✅ Dependências atualizadas no package.json

## Tecnologias Utilizadas

- React
- TypeScript
- Express
- Supabase
- TailwindCSS
- Vite

## Requisitos

- Node.js 18+ 
- NPM ou Yarn

## Configuração do Supabase

1. As credenciais do Supabase devem ser configuradas nas variáveis de ambiente:

```bash
# Configurar variáveis de ambiente
# Crie um arquivo .env com as seguintes variáveis:
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
NODE_ENV=development
PORT=3000
```

## Instalação

```bash
# Instalar dependências
npm install
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

## Testando a conexão com o Supabase

A aplicação tem uma função de teste de conexão com o Supabase em `src/lib/supabase.ts` que pode ser usada para verificar se as credenciais estão configuradas corretamente.

## Deploy na Vercel

Este projeto está configurado para ser implantado na Vercel. Siga estes passos:

1. Crie uma conta na Vercel e instale o CLI
2. Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no dashboard da Vercel
3. Use o seguinte comando para deploy:

```bash
vercel --prod
```

## Estrutura do Banco de Dados Supabase

O esquema atual do banco de dados inclui as seguintes tabelas:

- `users`: Usuários do sistema
- `restaurants`: Restaurantes cadastrados na plataforma
- `products`: Produtos oferecidos pelos restaurantes
- `categories`: Categorias de produtos
- `orders`: Pedidos realizados
- `order_items`: Itens individuais de cada pedido

As definições completas dos tipos para o banco de dados podem ser encontradas em `src/lib/database.types.ts`.

## Estrutura do Projeto

- `/src`: Código-fonte do front-end React/TypeScript
- `/src/lib/supabase.ts`: Cliente Supabase configurado
- `/src/lib/database.types.ts`: Definições de tipos para o banco Supabase
- `/server.cjs`: API de back-end Express com sintaxe CommonJS

## Licença

ISC

## Próximos Passos

1. Integrar a autenticação com Supabase
2. Implementar as funções de banco de dados usando Supabase
3. Configurar regras de segurança (RLS) no Supabase
4. Migrar armazenamento de arquivos para o Storage do Supabase

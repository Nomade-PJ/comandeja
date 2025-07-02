# ComandeJá - Sistema de Gerenciamento para Restaurantes

<img src="public/placeholder.svg" alt="ComandeJá - Sistema de Gerenciamento para Restaurantes" width="600" />

O ComandeJá é um sistema SaaS (Software as a Service) completo para gerenciamento de restaurantes e pedidos online. Permite que restaurantes criem cardápios digitais, aceitem pedidos e gerenciem suas operações através de um dashboard intuitivo.

## 📋 Sumário

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Banco de Dados](#banco-de-dados)
- [Funcionalidades](#funcionalidades)
- [Segurança](#segurança)
- [Instalação e Configuração](#instalação-e-configuração)
- [Uso](#uso)
- [Escalabilidade](#escalabilidade)
- [Melhorias Recentes](#melhorias-recentes)

## 🌟 Visão Geral

O ComandeJá é uma solução completa para restaurantes que desejam digitalizar suas operações. O sistema permite:

- Criação de cardápios online personalizados
- Recebimento e gerenciamento de pedidos
- Gestão de clientes e fidelização
- Análise de vendas e desempenho
- Interface personalizada para cada restaurante

## 🛠️ Tecnologias

### Frontend
- **Framework**: React com TypeScript
- **Roteamento**: React Router DOM
- **UI/UX**: Componentes Shadcn/UI baseados em Radix UI
- **Estilização**: Tailwind CSS
- **Gerenciamento de Estado**: Context API (AuthContext, CartContext)
- **Requisições HTTP**: Axios e TanStack Query
- **Gráficos**: Recharts
- **Formulários**: React Hook Form com Zod para validação

### Backend (Supabase)
- **Banco de Dados**: PostgreSQL
- **Autenticação**: Supabase Auth
- **Armazenamento**: Supabase Storage
- **Tempo Real**: Supabase Realtime

## 📁 Estrutura do Projeto

```
projetocomandeja/
├── public/               # Arquivos estáticos
│   ├── components/       # Componentes React
│   │   ├── dashboard/    # Componentes do painel administrativo
│   │   ├── landing/      # Componentes da página inicial
│   │   └── ui/           # Componentes de interface reutilizáveis
│   ├── contexts/         # Contextos React (Auth, Cart)
│   ├── hooks/            # Hooks personalizados
│   ├── integrations/     # Integrações com serviços externos
│   │   └── supabase/     # Cliente e configurações do Supabase
│   ├── lib/              # Funções utilitárias
│   ├── pages/            # Componentes de página
│   ├── services/         # Serviços e lógica de negócios
│   └── types/            # Definições de tipos TypeScript
└── supabase/             # Configurações do Supabase
```

## 🗃️ Banco de Dados

O banco de dados possui um esquema relacional completo para um sistema de restaurantes:

### Usuários e Perfis
- `profiles`: Perfis de usuários com funções (admin, restaurant_owner, customer)

### Restaurantes
- `restaurants`: Informações básicas do restaurante
- `restaurant_settings`: Configurações específicas (taxas, valores mínimos)
- `restaurant_themes`: Personalização visual
- `restaurant_pages`: Páginas personalizadas

### Produtos
- `categories`: Categorias de produtos
- `products`: Produtos disponíveis
- `product_options`: Opções de personalização (ex: tamanhos, extras)
- `product_option_values`: Valores específicos para cada opção

### Clientes e Pedidos
- `customers`: Dados dos clientes
- `cart_items`: Itens no carrinho de compras
- `orders`: Pedidos realizados
- `order_items`: Itens individuais de cada pedido

### Marketing e Análise
- `coupons`: Cupons de desconto
- `reviews`: Avaliações de clientes
- `dashboard_statistics`: Estatísticas para o dashboard

## ✨ Funcionalidades

### Autenticação e Autorização
- Sistema de login/registro
- Diferentes níveis de acesso (admin, dono de restaurante, cliente)
- Políticas de segurança (RLS) para proteger dados

### Gerenciamento de Restaurante
- Cadastro e configuração de restaurantes
- Gerenciamento de categorias e produtos
- Personalização visual (temas)

### Experiência do Cliente
- Visualização de cardápio
- Carrinho de compras
- Realização de pedidos
- Acompanhamento de status

### Pedidos e Pagamentos
- Múltiplos métodos de pagamento
- Opções de entrega ou retirada
- Aplicação de cupons

### Dashboard e Análise
- Estatísticas de vendas
- Relatórios de produtos mais vendidos
- Gerenciamento de clientes

### Recursos Avançados
- Sincronização em tempo real
- Upload de imagens
- Geração automática de números de pedido
- Sistema de avaliações

## 🔒 Segurança

O sistema implementa várias camadas de segurança:
- Autenticação robusta via Supabase
- Políticas de RLS (Row Level Security) para controle de acesso granular
- Validação de dados com Zod
- Rotas protegidas no frontend

## ⚙️ Instalação e Configuração

### Pré-requisitos
- Node.js (v14+)
- Conta no Supabase

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/projetocomandeja.git
cd projetocomandeja
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. Execute o projeto em modo de desenvolvimento:
```bash
npm run dev
```

## 🚀 Uso

### Para Restaurantes
1. Registre-se como proprietário de restaurante
2. Configure seu perfil de restaurante
3. Adicione categorias e produtos
4. Personalize a aparência da sua página
5. Comece a receber pedidos

### Para Clientes
1. Navegue pelos restaurantes disponíveis
2. Veja o cardápio e adicione itens ao carrinho
3. Finalize o pedido com suas informações de entrega
4. Acompanhe o status do pedido

## 📈 Escalabilidade

O projeto foi projetado para ser escalável:
- Estrutura modular de componentes
- Uso de React Query para cache e gerenciamento de estado do servidor
- Supabase como backend serverless que escala automaticamente
- Funções PostgreSQL para lógica de negócios complexa

## 🚀 Melhorias Recentes

### Otimizações de Código

- **Remoção de Código Morto**: 
  - Removido o diretório vazio `src/components/layout`
  - Removido o componente `ImageUpload.tsx` não utilizado

- **Resolução de Duplicações**:
  - Unificado o sistema de toast, removendo a duplicação entre `src/hooks/use-toast.ts` e `src/components/ui/use-toast.ts`
  - Atualizado todas as importações para usar a implementação unificada

- **Correções de Rotas**:
  - Adicionada a rota para `DashboardCategories` no `App.tsx` que estava faltando

- **Limpeza de Dependências**:
  - Removidas referências e dependências desnecessárias de:
    - `index.html` (metadados e descrições)
    - `vite.config.ts` (plugins)
    - `package.json` (dependências)

Estas melhorias resultaram em um código mais limpo, com menos duplicações e melhor organização, facilitando a manutenção futura do projeto.

---

Desenvolvido com ❤️ pela equipe ComandeJá

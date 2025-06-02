
# Rotas e Navegação - ComandeJá

Este documento descreve as principais rotas e a navegação do sistema ComandeJá.

## Rotas Principais

### Rotas Públicas

- **`/`**: Página inicial/landing page
  - Exibe informações sobre o ComandeJá e opções de login/registro
  
- **`/login`**: Página de login
  - Formulário para proprietários de restaurantes acessarem suas contas
  
- **`/register`**: Página de registro
  - Formulário para novos proprietários cadastrarem seus restaurantes
  
- **`/r/:restaurantId`**: Página pública do cardápio do restaurante
  - Exibe o cardápio para clientes fazerem pedidos

### Rotas Protegidas (Requerem Autenticação)

- **`/dashboard`**: Painel principal do restaurante
  - Resumo de vendas, pedidos recentes, estatísticas

- **`/orders`**: Gerenciamento de pedidos
  - Lista todos os pedidos, com filtros por status
  - Permite atualizar o status dos pedidos

- **`/products`**: Gerenciamento de produtos
  - Lista, adiciona, edita e remove produtos do cardápio
  - Organiza produtos por categoria

- **`/customers`**: Gerenciamento de clientes
  - Lista e detalhes dos clientes que fizeram pedidos

- **`/reports`**: Relatórios e análises
  - Relatórios de vendas, produtos mais vendidos, etc.

- **`/coupons`**: Gerenciamento de cupons de desconto
  - Cria e gerencia cupons promocionais

- **`/reviews`**: Gerenciamento de avaliações
  - Lista avaliações de clientes e permite respostas

- **`/settings`**: Configurações do restaurante
  - Informações do restaurante, configurações de entrega, etc.

## Estrutura de Navegação

O sistema possui uma estrutura de navegação baseada em um layout de dashboard com sidebar:

- **Header**: Presente em todas as páginas autenticadas
  - Logo/Nome do ComandeJá
  - Nome do restaurante logado
  - Nome do usuário
  - Botão de logout

- **Sidebar**: Navegação principal para usuários autenticados
  - Lista todas as rotas protegidas
  - Exibe informações básicas do restaurante (horário, endereço)
  - Pode ser recolhida em dispositivos móveis

## Fluxos de Navegação Comuns

### Fluxo de Autenticação
1. Usuário acessa a página inicial (`/`)
2. Clica em "Entrar" e é direcionado para `/login`
3. Após login bem-sucedido, é redirecionado para `/dashboard`

### Fluxo de Gestão de Pedidos
1. Usuário autenticado acessa `/dashboard` 
2. Visualiza pedidos recentes ou clica em "Pedidos" na sidebar
3. É direcionado para `/orders` onde pode gerenciar todos os pedidos
4. Ao clicar em um pedido, pode ver detalhes e atualizar o status

### Fluxo de Gestão de Cardápio
1. Usuário autenticado acessa `/products` pela sidebar
2. Visualiza lista de produtos existentes
3. Pode adicionar novos produtos, editar ou remover existentes
4. Ao adicionar/editar um produto, escolhe categoria, preço, descrição, etc.

## Implementação no Código

As rotas estão definidas em `src/App.tsx` usando React Router:

```tsx
<Routes>
  <Route path="/" element={<Index />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/r/:restaurantId" element={<MenuPage />} />
  
  {/* Rotas Protegidas */}
  <Route 
    path="/dashboard" 
    element={
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    } 
  />
  {/* ... outras rotas protegidas */}
</Routes>
```

A navegação da sidebar está implementada em `src/components/DashboardLayout.tsx`:

```tsx
const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: <Calendar className="w-5 h-5" /> },
  { name: 'Pedidos', path: '/orders', icon: <ShoppingCart className="w-5 h-5" /> },
  { name: 'Produtos', path: '/products', icon: <Package className="w-5 h-5" /> },
  { name: 'Clientes', path: '/customers', icon: <Users className="w-5 h-5" /> },
  { name: 'Relatórios', path: '/reports', icon: <BarChart3 className="w-5 h-5" /> },
  { name: 'Cupons', path: '/coupons', icon: <FileText className="w-5 h-5" /> },
  { name: 'Avaliações', path: '/reviews', icon: <MessageSquare className="w-5 h-5" /> },
  { name: 'Configurações', path: '/settings', icon: <Settings className="w-5 h-5" /> },
];
```

## Considerações para Desenvolvimento

1. Todas as rotas protegidas devem ser envolvidas pelo componente `<PrivateRoute>` para verificação de autenticação
2. O layout para páginas autenticadas deve usar o componente `<DashboardLayout>` para manter consistência
3. Para links entre páginas, use sempre o componente `<Link>` ou `<NavLink>` do React Router para evitar recarregamentos completos
4. Mantenha a navegação responsiva e acessível em dispositivos móveis

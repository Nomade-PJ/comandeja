# Análise Completa do Projeto ComandeJá

## Visão Geral

O ComandeJá é um sistema SaaS (Software as a Service) para gerenciamento de restaurantes e pedidos online. A plataforma permite que donos de restaurantes criem cardápios digitais, aceitem pedidos e gerenciem suas operações através de um dashboard intuitivo.

## Tecnologias Utilizadas

### Frontend
- **Framework**: React com TypeScript
- **Roteamento**: React Router DOM
- **UI/UX**: Componentes Shadcn/UI baseados em Radix UI
- **Estilização**: Tailwind CSS
- **Gerenciamento de Estado**: Context API (AuthContext, CartContext) e React Query
- **Formulários**: React Hook Form com Zod para validação
- **Gráficos**: Recharts para visualizações de dados

### Backend
- **Plataforma**: Supabase (Backend as a Service)
- **Banco de Dados**: PostgreSQL
- **Autenticação**: Supabase Auth
- **Armazenamento**: Supabase Storage
- **Tempo Real**: Supabase Realtime para atualizações em tempo real

## Estrutura do Projeto

O projeto segue uma arquitetura moderna de aplicação React, organizada em:

1. **Componentes**: Divididos em categorias:
   - `dashboard`: Componentes para o painel administrativo
   - `landing`: Componentes para a página inicial
   - `ui`: Componentes reutilizáveis de interface
   - `restaurant`: Componentes específicos para visualização do restaurante

2. **Contextos**: 
   - `AuthContext`: Gerencia autenticação e usuário logado
   - `CartContext`: Gerencia o carrinho de compras

3. **Hooks Personalizados**: 
   - `useProducts`, `useCategories`, `useOrders`: Para gerenciar dados específicos
   - `useRestaurant`: Para acessar dados do restaurante atual
   - `useDashboardStats`: Para estatísticas do dashboard

4. **Páginas**:
   - Páginas de landing: Index, Login, Register
   - Dashboard: Visão geral, produtos, pedidos, clientes, etc.
   - Cliente: Visualização de restaurante, checkout, rastreamento de pedidos

## Funcionalidades Principais

### Para Donos de Restaurantes

1. **Gerenciamento de Cardápio**:
   - Criação e edição de categorias
   - Adição, edição e remoção de produtos
   - Upload de imagens para produtos

2. **Gestão de Pedidos**:
   - Visualização de pedidos recebidos
   - Atualização de status (confirmado, preparando, entregue)
   - Histórico de pedidos

3. **Dashboard Analítico**:
   - Gráficos de vendas
   - Produtos mais vendidos
   - Estatísticas de clientes

4. **Configurações**:
   - Personalização do perfil do restaurante
   - Definição de taxas de entrega
   - Gerenciamento de banners promocionais

### Para Clientes

1. **Navegação e Pedidos**:
   - Visualização de restaurantes disponíveis
   - Navegação por categorias de produtos
   - Adição de itens ao carrinho
   - Finalização de pedidos

2. **Conta do Cliente**:
   - Registro e login
   - Histórico de pedidos
   - Rastreamento de pedidos em andamento
   - Avaliações de restaurantes

3. **Experiência de Compra**:
   - Carrinho persistente (salvo no localStorage e Supabase)
   - Aplicação de cupons de desconto
   - Múltiplos métodos de pagamento

## Detalhes do Banco de Dados Supabase

### Informações do Projeto Supabase
- **Nome da Organização**: comandeja.com
- **ID da Organização**: cvbtqqxkxxglsnasyuhu
- **Nome do Projeto**: Comadeja_Saas
- **ID do Projeto**: rqmbibkesypgqibfmoyr
- **Região**: sa-east-1 (América do Sul)
- **Status**: ACTIVE_HEALTHY
- **Versão do PostgreSQL**: 17.4.1.45

### Estrutura do Banco de Dados

O banco de dados PostgreSQL no Supabase possui um esquema relacional completo com as seguintes tabelas principais:

#### Tabelas Principais

1. **profiles**
   - Armazena informações dos usuários
   - Campos: id, email, full_name, phone, role, avatar_url
   - Relacionada com: restaurants (owner_id)

2. **restaurants**
   - Dados básicos dos restaurantes
   - Campos: id, owner_id, name, slug, description, phone, email, address, logo_url, banner_url
   - Relacionada com: múltiplas tabelas (products, categories, orders, etc.)

3. **products**
   - Produtos/itens do cardápio
   - Campos: id, restaurant_id, category_id, name, description, price, image_url, is_active
   - Relacionada com: categories, restaurants, order_items

4. **categories**
   - Categorias de produtos
   - Campos: id, restaurant_id, name, description, image_url, display_order
   - Relacionada com: products

5. **orders**
   - Pedidos realizados
   - Campos: id, restaurant_id, customer_id, order_number, status, subtotal, total, payment_method
   - Relacionada com: customers, order_items

6. **order_items**
   - Itens individuais de cada pedido
   - Campos: id, order_id, product_id, product_name, quantity, unit_price, total_price
   - Relacionada com: orders, products

7. **customers**
   - Dados dos clientes
   - Campos: id, restaurant_id, name, email, phone, address, total_orders, total_spent
   - Relacionada com: orders, reviews

8. **cart_items**
   - Itens no carrinho de compras
   - Campos: id, user_id, restaurant_id, product_id, product_name, price, quantity
   - Relacionada com: users, restaurants, products

9. **banners**
   - Banners promocionais
   - Campos: id, restaurant_id, title, description, image_url, start_date, end_date
   - Relacionada com: restaurants

10. **dashboard_statistics**
    - Estatísticas para o dashboard
    - Campos: id, restaurant_id, date, total_orders, total_revenue, total_customers
    - Relacionada com: restaurants

#### Tabelas Adicionais

11. **coupons**
    - Cupons de desconto
    - Campos: id, restaurant_id, code, discount_type, discount_value, expires_at

12. **restaurant_settings**
    - Configurações específicas do restaurante
    - Campos: id, restaurant_id, minimum_order_value, delivery_fee, accepts_orders

13. **restaurant_themes**
    - Personalização visual do restaurante
    - Campos: id, restaurant_id, primary_color, secondary_color, font_family

14. **restaurant_pages**
    - Páginas personalizadas do restaurante
    - Campos: id, restaurant_id, title, description, meta_tags, custom_css

15. **reviews**
    - Avaliações de clientes
    - Campos: id, restaurant_id, order_id, customer_id, rating, comment

### Enumerações (Enums) no Banco de Dados

- **delivery_method**: "delivery" | "pickup"
- **order_status**: "pending" | "confirmed" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled"
- **payment_method**: "credit_card" | "debit_card" | "pix" | "cash" | "voucher"
- **payment_status**: "pending" | "paid" | "failed" | "refunded"
- **user_role**: "admin" | "restaurant_owner" | "customer"

### Extensões PostgreSQL Utilizadas

O banco de dados utiliza várias extensões PostgreSQL, incluindo:
- **uuid-ossp**: Para geração de UUIDs
- **pg_graphql**: Para suporte a GraphQL
- **pg_stat_statements**: Para rastreamento de estatísticas de consultas SQL
- **pgcrypto**: Para funções criptográficas
- **pg_net**: Para requisições HTTP assíncronas

### Alertas de Segurança

Foram identificados alguns alertas de segurança no banco de dados:
- Funções com search_path mutável, o que pode representar riscos de segurança
- Configuração de OTP com expiração longa (mais de uma hora)
- Proteção contra senhas vazadas desativada

## Fluxo de Funcionamento

1. **Autenticação**:
   - O usuário se registra ou faz login através do Supabase Auth
   - O AuthContext mantém o estado de autenticação na aplicação
   - Rotas protegidas garantem acesso apenas a usuários autorizados

2. **Dashboard do Restaurante**:
   - Após login, o proprietário acessa o dashboard
   - Visualiza estatísticas, pedidos recentes e produtos populares
   - Pode gerenciar todo o catálogo e configurações

3. **Experiência do Cliente**:
   - Cliente navega pelos restaurantes disponíveis
   - Visualiza o cardápio e adiciona produtos ao carrinho
   - O CartContext gerencia os itens do carrinho
   - Finaliza o pedido, que é salvo no banco de dados
   - Acompanha o status do pedido em tempo real

4. **Tempo Real**:
   - Atualizações de status de pedidos são sincronizadas em tempo real
   - O serviço de Realtime do Supabase mantém os dados atualizados

## Segurança

- Autenticação robusta via Supabase
- Políticas de RLS (Row Level Security) para controle de acesso
- Validação de dados com Zod
- Proteção contra ataques comuns (XSS, CSRF)

## Recursos Adicionais

1. **Service Worker**: Implementado para melhorar performance offline
2. **Tema Escuro**: Suporte a modo claro/escuro baseado em preferências do sistema
3. **Responsividade**: Interface adaptável para dispositivos móveis e desktop
4. **Carregamento Lazy**: Componentes carregados sob demanda para melhor performance

## Conclusão

O ComandeJá é um sistema completo para gerenciamento de restaurantes, construído com tecnologias modernas e seguindo boas práticas de desenvolvimento. A arquitetura é escalável e modular, permitindo fácil manutenção e adição de novas funcionalidades.

O uso do Supabase como backend simplifica o desenvolvimento, oferecendo autenticação, banco de dados e funcionalidades em tempo real sem necessidade de implementar um servidor próprio. 
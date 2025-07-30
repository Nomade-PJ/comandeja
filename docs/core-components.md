# Componentes Principais - ComandeJá

Este documento descreve os componentes principais do sistema ComandeJá e suas responsabilidades.

## Estrutura de Componentes

O projeto segue uma estrutura organizada de componentes divididos em categorias para facilitar a manutenção:

- **UI**: Componentes básicos de interface reutilizáveis
- **Dashboard**: Componentes específicos para a área administrativa
- **Restaurant**: Componentes específicos para a visualização do restaurante
- **Landing**: Componentes para as páginas de marketing

## Componentes UI

Os componentes UI são baseados no sistema de design [Shadcn UI](https://ui.shadcn.com/), com algumas adaptações para atender às necessidades específicas do projeto.

### Form

O componente `Form` fornece uma base para criação de formulários com validação usando React Hook Form e Zod.

**Localização**: `src/components/ui/form.tsx`

**Uso**:
```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Submit</Button>
  </form>
</Form>
```

### ContactForm

Um componente de formulário configurável e reutilizável para formulários simples.

**Localização**: `src/components/ui/contact-form.tsx`

**Propriedades**:
- `title`: Título do formulário
- `description`: Descrição do formulário
- `fields`: Array de configurações de campos
- `submitButtonText`: Texto do botão de envio
- `successTitle`: Título exibido após envio com sucesso
- `successDescription`: Descrição exibida após envio com sucesso
- `onSubmit`: Função de callback chamada ao enviar o formulário

**Uso**:
```tsx
<ContactForm 
  title="Envie-nos uma mensagem"
  description="Preencha o formulário abaixo"
  fields={[
    {
      name: "name",
      label: "Nome completo",
      type: "text",
      required: true
    },
    // Mais campos...
  ]}
  submitButtonText="Enviar"
/>
```

### Sidebar

Componente de barra lateral responsiva para navegação do dashboard.

**Localização**: `src/components/ui/sidebar.tsx`

**Uso**:
```tsx
<SidebarProvider>
  {/* Conteúdo que precisa acessar o contexto da sidebar */}
  <Sidebar>
    <SidebarItem icon={<Home />} href="/dashboard">Dashboard</SidebarItem>
  </Sidebar>
</SidebarProvider>
```

## Componentes do Dashboard

### DashboardLayout

Layout principal para todas as páginas do dashboard administrativo.

**Localização**: `src/components/dashboard/DashboardLayout.tsx`

**Propriedades**:
- `children`: Conteúdo da página
- `title`: Título da página (opcional)

**Uso**:
```tsx
<DashboardLayout>
  <h1>Conteúdo do Dashboard</h1>
</DashboardLayout>
```

**Dependências**:
- `SidebarProvider` - Fornece o contexto para a barra lateral
- `AppSidebar` - Componente da barra lateral
- `BottomNav` - Navegação inferior para dispositivos móveis
- `DashboardHeader` - Cabeçalho do dashboard

### DashboardHeader

Cabeçalho para todas as páginas do dashboard administrativo.

**Localização**: `src/components/dashboard/DashboardHeader.tsx`

**Uso**: Importado e utilizado automaticamente pelo `DashboardLayout`

### StatsCards

Componente para exibir cartões de estatísticas no dashboard.

**Localização**: `src/components/dashboard/StatsCards.tsx`

**Propriedades**:
- `stats`: Objeto contendo as estatísticas a serem exibidas

**Uso**:
```tsx
<StatsCards stats={dashboardStats} />
```

### SalesChart

Gráfico de vendas responsivo para visualização de dados.

**Localização**: `src/components/dashboard/SalesChart.tsx`

**Propriedades**:
- `data`: Array de dados para o gráfico
- `period`: Período de tempo para exibição

**Uso**:
```tsx
<SalesChart data={salesData} period="weekly" />
```

### ProductsList

Lista de produtos com funcionalidades de ordenação, filtragem e busca.

**Localização**: `src/components/dashboard/ProductsList.tsx`

**Propriedades**:
- `products`: Array de produtos
- `onEdit`: Função chamada ao editar um produto
- `onDelete`: Função chamada ao deletar um produto

**Uso**:
```tsx
<ProductsList 
  products={products}
  onEdit={handleEditProduct}
  onDelete={handleDeleteProduct}
/>
```

### ImageUpload

Componente unificado para upload de imagens com suporte para arrastar e soltar.

**Localização**: `src/components/dashboard/ImageUpload.tsx`

**Propriedades**:
- `value`: URL atual da imagem (se existir)
- `onChange`: Função chamada quando uma nova imagem é carregada
- `onRemove`: Função chamada quando a imagem é removida
- `bucket`: Bucket do Supabase Storage para upload
- `title`: Título do componente
- `useDropzone`: Usar dropzone ou input de arquivo padrão

**Uso**:
```tsx
<ImageUpload 
  value={imageUrl}
  onChange={handleImageChange}
  bucket="products"
  title="Imagem do Produto"
/>
```

### DeliveryTrackingControl

Componente para controle e monitoramento de entregas.

**Localização**: `src/components/dashboard/DeliveryTrackingControl.tsx`

**Propriedades**:
- `orderId`: ID do pedido
- `initialStatus`: Status inicial da entrega

**Uso**:
```tsx
<DeliveryTrackingControl orderId={order.id} initialStatus={order.status} />
```

## Componentes do Restaurante

### RestaurantBanner

Componente de banner para exibição na página do restaurante.

**Localização**: `src/components/restaurant/RestaurantBanner.tsx`

**Propriedades**:
- `restaurantId`: ID do restaurante
- `onSearch`: Função chamada ao realizar uma busca

**Uso**:
```tsx
<RestaurantBanner 
  restaurantId={restaurantId}
  onSearch={handleSearch}
/>
```

### CustomerBottomNav

Navegação inferior para clientes na visualização do restaurante.

**Localização**: `src/components/restaurant/CustomerBottomNav.tsx`

**Propriedades**:
- `restaurantId`: ID do restaurante
- `cartItemsCount`: Número de itens no carrinho

**Uso**:
```tsx
<CustomerBottomNav 
  restaurantId={restaurantId}
  cartItemsCount={cartItems.length}
/>
```

## Modais e Diálogos

### AuthModal

Modal para autenticação de usuários (login/registro).

**Localização**: `src/components/ui/auth-modal.tsx`

**Propriedades**:
- `defaultTab`: Aba padrão a ser exibida ('login' ou 'register')
- `open`: Estado de abertura do modal
- `onOpenChange`: Função chamada quando o estado de abertura muda

**Uso**:
```tsx
<AuthModal
  defaultTab="login"
  open={authModalOpen}
  onOpenChange={setAuthModalOpen}
/>
```

### CartDrawer

Gaveta lateral para exibição e gerenciamento do carrinho de compras.

**Localização**: `src/components/ui/cart-drawer.tsx`

**Propriedades**:
- `open`: Estado de abertura da gaveta
- `onOpenChange`: Função chamada quando o estado de abertura muda

**Uso**:
```tsx
<CartDrawer
  open={cartOpen}
  onOpenChange={setCartOpen}
/>
```

### OrderDetailsModal

Modal para exibição de detalhes de um pedido.

**Localização**: `src/components/dashboard/modals/OrderDetailsModal.tsx`

**Propriedades**:
- `open`: Estado de abertura do modal
- `onOpenChange`: Função chamada quando o estado de abertura muda
- `orderId`: ID do pedido a ser exibido

**Uso**:
```tsx
<OrderDetailsModal
  open={detailsModalOpen}
  onOpenChange={setDetailsModalOpen}
  orderId={selectedOrderId}
/>
```

## Hooks Principais

O sistema utiliza diversos hooks personalizados para gerenciar o estado e interagir com a API:

### useAuth

Hook para gerenciamento de autenticação e usuário.

**Localização**: `src/hooks/useAuth.tsx`

**Uso**:
```tsx
const { user, signIn, signOut, isRestaurantOwner } = useAuth();
```

### useRestaurant

Hook para gerenciar informações do restaurante do usuário logado.

**Localização**: `src/hooks/useRestaurant.tsx`

**Uso**:
```tsx
const { restaurant, loading, updateRestaurant } = useRestaurant();
```

### useProducts

Hook para gerenciar produtos do restaurante.

**Localização**: `src/hooks/useProducts.tsx`

**Uso**:
```tsx
const { 
  products, 
  loading, 
  error, 
  addProduct, 
  updateProduct, 
  deleteProduct 
} = useProducts();
```

### useBanners

Hook para gerenciar banners do restaurante.

**Localização**: `src/hooks/useBanners.tsx`

**Uso**:
```tsx
const { 
  banners, 
  loading, 
  createBanner, 
  updateBanner, 
  deleteBanner 
} = useBanners({ restaurantId });
```

### useOrders

Hook para gerenciar pedidos do restaurante.

**Localização**: `src/hooks/useOrders.tsx`

**Uso**:
```tsx
const { 
  orders, 
  loading, 
  updateOrderStatus, 
  getOrderDetails 
} = useOrders();
```

## Contextos

### AuthContext

Contexto para gerenciamento de autenticação em toda a aplicação.

**Localização**: `src/contexts/AuthContext.tsx`

**Valores Fornecidos**:
- `user`: Usuário atual
- `session`: Sessão atual
- `loading`: Estado de carregamento
- `error`: Erro, se houver
- `signIn`: Função para fazer login
- `signUp`: Função para registrar
- `signOut`: Função para fazer logout
- `isRestaurantOwner`: Função para verificar se o usuário é dono de restaurante
- `isCustomer`: Função para verificar se o usuário é cliente

### CartContext

Contexto para gerenciamento do carrinho de compras.

**Localização**: `src/contexts/CartContext.tsx`

**Valores Fornecidos**:
- `cart`: Itens no carrinho
- `restaurantId`: ID do restaurante atual
- `addToCart`: Função para adicionar item ao carrinho
- `removeFromCart`: Função para remover item do carrinho
- `clearCart`: Função para limpar o carrinho
- `updateQuantity`: Função para atualizar quantidade de um item

---

## Contribuindo com Novos Componentes

Ao criar novos componentes:

1. Siga o padrão de nomenclatura (PascalCase para componentes)
2. Adicione documentação JSDoc para o componente e suas props
3. Coloque o componente na pasta apropriada baseado em sua função
4. Atualize este documento se o componente for considerado principal
5. Siga os padrões de código definidos em [Code Standards](./code-standards.md)

## Melhores Práticas

- Mantenha componentes pequenos e focados em uma única responsabilidade
- Use TypeScript para definir tipos de props
- Evite duplicação de código entre componentes
- Utilize os hooks personalizados existentes
- Teste os componentes em diferentes tamanhos de tela

---

Este documento será atualizado conforme novos componentes principais forem adicionados ao sistema. 
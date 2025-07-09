# Documentação: Drag and Drop de Categorias

## Visão Geral
O sistema implementa uma funcionalidade de arrastar e soltar (drag and drop) para reordenar categorias na interface do cardápio. Esta funcionalidade permite que os usuários reorganizem a ordem de exibição das categorias de forma intuitiva através de interação direta com a interface.

## Tecnologias Utilizadas
- **react-beautiful-dnd**: Biblioteca principal para implementação do drag and drop
- **React**: Framework base da aplicação
- **TypeScript**: Linguagem de programação utilizada
- **Supabase**: Backend as a Service para persistência dos dados

## Dependências
```json
{
  "react-beautiful-dnd": "^13.1.1",
  "@types/react-beautiful-dnd": "^13.1.8"
}
```

## Estrutura do Banco de Dados

### Tabela `categories`
```sql
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  image_url text,
  display_order integer,
  is_active boolean default true,
  restaurant_id uuid references restaurants(id),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
```

O campo `display_order` é usado para controlar a ordem de exibição das categorias.

## Implementação

### 1. Hook `useCategories`

O hook `useCategories` gerencia toda a lógica de estado e operações das categorias, incluindo:

```typescript
// Função para reordenar categorias
const reorderCategories = async (orderedCategoryIds: string[]) => {
  try {
    // Verifica se todos os IDs são válidos
    const validIds = orderedCategoryIds.every(id => 
      categories.some(c => c.id === id)
    );
    
    if (!validIds || orderedCategoryIds.length !== categories.length) {
      throw new Error('IDs de categoria inválidos ou faltando');
    }
    
    // Atualiza a ordem de todas as categorias no banco
    const updates = orderedCategoryIds.map((id, index) => {
      return supabase
        .from('categories')
        .update({ display_order: index })
        .eq('id', id);
    });
    
    await Promise.all(updates);
    
    // Atualiza a interface
    await fetchCategories();
    return true;
  } catch (error) {
    console.error('Error reordering categories:', error);
    return false;
  }
};
```

### 2. Componente de Interface (DashboardProducts.tsx)

A interface utiliza o `react-beautiful-dnd` para implementar o drag and drop:

```typescript
<DragDropContext onDragEnd={handleDragEnd}>
  <Droppable droppableId="categorias">
    {(provided) => (
      <div {...provided.droppableProps} ref={provided.innerRef}>
        <table>
          <tbody>
            {categories
              .sort((a, b) => a.display_order - b.display_order)
              .map((category, index) => (
                <Draggable 
                  key={category.id} 
                  draggableId={category.id} 
                  index={index}
                >
                  {(provided) => (
                    <tr
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <td>
                        <div {...provided.dragHandleProps}>
                          <GripVertical />
                        </div>
                      </td>
                      {/* ... conteúdo da linha ... */}
                    </tr>
                  )}
                </Draggable>
              ))}
            {provided.placeholder}
          </tbody>
        </table>
      </div>
    )}
  </Droppable>
</DragDropContext>
```

### 3. Manipulação do Drag and Drop

```typescript
const handleDragEnd = (result: any) => {
  // Ignora se soltou fora da área ou na mesma posição
  if (!result.destination || 
      result.destination.index === result.source.index) {
    return;
  }

  const draggedItemId = result.draggableId;
  const reorderedIds = Array.from(categories)
    .sort((a, b) => a.display_order - b.display_order)
    .map(cat => cat.id);
  
  // Remove o ID arrastado da posição original
  reorderedIds.splice(result.source.index, 1);
  
  // Insere o ID na nova posição
  reorderedIds.splice(result.destination.index, 0, draggedItemId);
  
  // Atualiza a ordem no banco de dados
  reorderCategories(reorderedIds);
};
```

## Fluxo de Dados

1. Usuário arrasta uma categoria para uma nova posição
2. O evento `onDragEnd` é disparado
3. A função `handleDragEnd` calcula a nova ordem
4. `reorderCategories` é chamada com os IDs na nova ordem
5. As atualizações são feitas no banco de dados
6. A interface é atualizada com a nova ordem

## Considerações de UX

1. **Feedback Visual**: 
   - Ícone de "grip" indica que o item pode ser arrastado
   - Animação suave durante o arrasto
   - Placeholder mostra onde o item será solto

2. **Responsividade**:
   - Em dispositivos móveis, a reordenação é feita através de botões (cima/baixo)
   - Em desktop, usa drag and drop
   - Interface se adapta ao tamanho da tela

3. **Feedback de Sucesso/Erro**:
   - Toast notifications informam o sucesso ou falha da operação
   - Mensagens claras e objetivas

## Políticas de Segurança (RLS)

```sql
-- Política para leitura de categorias
create policy "Categorias são visíveis para todos"
  on categories for select
  using (true);

-- Política para atualização de categorias
create policy "Apenas donos do restaurante podem atualizar categorias"
  on categories for update
  using (auth.uid() in (
    select owner_id from restaurants 
    where id = restaurant_id
  ));
```

## Troubleshooting

### Problemas Comuns

1. **Ordem não persiste após atualização**
   - Verificar se o campo `display_order` está sendo atualizado corretamente
   - Confirmar se a ordenação está sendo aplicada na query

2. **Drag and Drop não funciona em mobile**
   - Comportamento esperado, use os botões de cima/baixo em mobile
   - Drag and drop é habilitado apenas em desktop

3. **Erros de permissão**
   - Verificar as políticas RLS
   - Confirmar se o usuário tem permissão de restaurante

### Soluções

1. **Reordenação falha**
   ```typescript
   // Adicione logs para debug
   console.log('Source:', result.source);
   console.log('Destination:', result.destination);
   console.log('Reordered IDs:', reorderedIds);
   ```

2. **Problemas de Performance**
   ```typescript
   // Use memoização para evitar re-renders
   const sortedCategories = useMemo(() => 
     categories.sort((a, b) => a.display_order - b.display_order),
     [categories]
   );
   ```

## Testes

```typescript
describe('Category Reordering', () => {
  it('should update display_order when dragging', async () => {
    // Setup
    const categories = [
      { id: '1', display_order: 0 },
      { id: '2', display_order: 1 }
    ];
    
    // Simulate drag
    const result = {
      draggableId: '2',
      source: { index: 1 },
      destination: { index: 0 }
    };
    
    await handleDragEnd(result);
    
    // Assert
    expect(categories[0].display_order).toBe(1);
    expect(categories[1].display_order).toBe(0);
  });
});
```

## Melhores Práticas

1. **Otimização de Performance**
   - Use `useMemo` para arrays ordenados
   - Implemente virtualização para muitas categorias
   - Batch updates no banco de dados

2. **Segurança**
   - Valide IDs antes de atualizar
   - Implemente políticas RLS adequadas
   - Sanitize inputs do usuário

3. **UX/UI**
   - Forneça feedback visual claro
   - Mantenha a interface responsiva
   - Implemente fallbacks para dispositivos móveis

4. **Manutenção**
   - Mantenha logs adequados
   - Documente mudanças na ordem
   - Implemente sistema de backup/restore 

## Estilos CSS

### 1. Estilos Base (Tailwind CSS)

```css
/* Estilização da tabela principal */
.min-w-full {
  min-width: 100%;
}

.divide-y {
  border-bottom-width: 1px;
  border-color: rgb(229 231 235); /* gray-200 */
}

/* Cabeçalho da tabela */
.bg-gray-50 {
  background-color: rgb(249 250 251);
}

/* Células do cabeçalho */
.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.sm\:px-6 {
  @media (min-width: 640px) {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

/* Texto do cabeçalho */
.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.font-medium {
  font-weight: 500;
}

.text-gray-500 {
  color: rgb(107 114 128);
}

.uppercase {
  text-transform: uppercase;
}

.tracking-wider {
  letter-spacing: 0.05em;
}

/* Corpo da tabela */
.bg-white {
  background-color: rgb(255 255 255);
}

/* Linhas da tabela */
.whitespace-nowrap {
  white-space: nowrap;
}

/* Item arrastável */
.cursor-grab {
  cursor: grab;
}

.cursor-grabbing {
  cursor: grabbing;
}

/* Ícone de arrasto */
.text-gray-400 {
  color: rgb(156 163 175);
}

/* Animações durante o drag */
.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Estado de hover */
.hover\:bg-gray-50:hover {
  background-color: rgb(249 250 251);
}

/* Estado de arrasto ativo */
.dragging {
  @apply shadow-lg;
  background-color: rgb(243 244 246);
  transform: scale(1.02);
  z-index: 10;
}
```

### 2. Estilos do Drag and Drop

```css
/* Área onde os itens podem ser soltos */
.droppable-area {
  @apply rounded-md border overflow-hidden;
  min-height: 50px;
  transition: background-color 0.2s ease;
}

/* Estilo quando arrastando sobre a área */
.droppable-area.dragging-over {
  @apply bg-gray-50 border-dashed;
}

/* Item sendo arrastado */
.draggable-item {
  @apply transition-all duration-200;
  touch-action: none; /* Previne scroll em touch devices */
}

/* Placeholder durante o arrasto */
.placeholder {
  @apply border-2 border-dashed border-gray-300 rounded-md;
  background-color: rgb(243 244 246);
  margin: 0.25rem 0;
}

/* Animação do item sendo arrastado */
.dragging-animation {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
```

### 3. Responsividade

```css
/* Mobile First */
.categories-list {
  @apply space-y-2 px-4;
}

/* Tablet e Desktop */
@media (min-width: 640px) {
  .categories-list {
    @apply px-0;
  }
  
  .draggable-item {
    @apply hover:bg-gray-50;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .categories-table {
    @apply hidden;
  }
  
  .categories-grid {
    @apply grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4;
  }
}
```

### 4. Acessibilidade

```css
/* Foco visível para navegação por teclado */
.draggable-item:focus-visible {
  @apply outline-none ring-2 ring-brand-500 ring-offset-2;
}

/* Estados de alto contraste */
@media (forced-colors: active) {
  .draggable-item {
    border: 1px solid CanvasText;
  }
  
  .draggable-item:focus-visible {
    outline: 2px solid CanvasText;
  }
}
```

### 5. Temas

```css
/* Tema Claro (padrão) */
:root {
  --drag-handle-color: rgb(156 163 175);
  --drag-bg-hover: rgb(249 250 251);
  --drag-border-color: rgb(229 231 235);
}

/* Tema Escuro */
.dark {
  --drag-handle-color: rgb(75 85 99);
  --drag-bg-hover: rgb(31 41 55);
  --drag-border-color: rgb(55 65 81);
}

/* Aplicação das variáveis */
.drag-handle {
  color: var(--drag-handle-color);
}

.draggable-item:hover {
  background-color: var(--drag-bg-hover);
}

.droppable-area {
  border-color: var(--drag-border-color);
}
```

### 6. Utilitários

```css
/* Classes utilitárias para drag and drop */
.drag-none {
  user-drag: none;
  -webkit-user-drag: none;
}

.select-none {
  user-select: none;
}

.touch-none {
  touch-action: none;
}

/* Feedback visual durante o arrasto */
.drag-feedback {
  @apply opacity-50 bg-gray-100;
}

.drop-indicator {
  @apply border-2 border-dashed border-brand-500 rounded-md my-1;
  height: 2px;
}
```

### Como Usar

1. **Setup Inicial**
```tsx
// Em seu arquivo de componente
import './styles.css'; // ou importado via Tailwind

// Aplicando classes
<div className="categories-list">
  <DragDropContext onDragEnd={handleDragEnd}>
    <Droppable droppableId="categorias">
      {(provided, snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={`droppable-area ${
            snapshot.isDraggingOver ? 'dragging-over' : ''
          }`}
        >
          {/* Items arrastáveis */}
        </div>
      )}
    </Droppable>
  </DragDropContext>
</div>
```

2. **Item Arrastável**
```tsx
<Draggable key={category.id} draggableId={category.id} index={index}>
  {(provided, snapshot) => (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={`draggable-item ${
        snapshot.isDragging ? 'dragging' : ''
      }`}
    >
      <div
        {...provided.dragHandleProps}
        className="drag-handle"
      >
        <GripVertical />
      </div>
      {/* Conteúdo do item */}
    </div>
  )}
</Draggable>
```

### Considerações de Estilo

1. **Performance**
   - Use `transform` e `opacity` para animações suaves
   - Evite propriedades que causam reflow (como `height` ou `width`)
   - Prefira `will-change` para otimizar renderização

2. **Acessibilidade**
   - Mantenha contraste adequado para o ícone de arrasto
   - Forneça feedback visual claro durante interações
   - Suporte navegação por teclado

3. **Responsividade**
   - Use unidades relativas (rem, em) para espaçamento
   - Adapte o layout para diferentes tamanhos de tela
   - Considere diferentes métodos de input (mouse, touch, teclado)

4. **Manutenção**
   - Organize estilos em módulos lógicos
   - Use variáveis CSS para valores reutilizáveis
   - Mantenha consistência com o design system 
# Padrões de Código - ComandeJá

Este documento define os padrões de código e boas práticas a serem seguidos no desenvolvimento do projeto ComandeJá.

## Estrutura do Projeto

```
src/
├── components/       # Componentes reutilizáveis
│   ├── dashboard/    # Componentes específicos do dashboard
│   ├── restaurant/   # Componentes específicos do restaurante
│   ├── landing/      # Componentes da página inicial
│   └── ui/           # Componentes de UI básicos e reutilizáveis
├── contexts/         # Contextos do React
├── hooks/            # Hooks personalizados
├── integrations/     # Integrações com APIs externas
├── lib/              # Funções e utilitários
├── middlewares/      # Middlewares
├── pages/            # Páginas da aplicação
├── services/         # Serviços
├── types/            # Tipos e interfaces
└── utils/            # Utilitários
```

## Nomenclatura

### Arquivos e Pastas

- **Componentes**: PascalCase (ex: `UserCard.tsx`, `ProductList.tsx`)
- **Hooks**: camelCase com prefixo 'use' (ex: `useProducts.tsx`, `useAuth.tsx`)
- **Utilitários**: camelCase (ex: `formatCurrency.ts`, `validateEmail.ts`)
- **Contextos**: PascalCase com sufixo 'Context' (ex: `AuthContext.tsx`, `CartContext.tsx`)
- **Tipos**: PascalCase (ex: `Product.ts`, `User.ts`)

### Variáveis e Funções

- **Variáveis**: camelCase (ex: `userName`, `productList`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `MAX_ITEMS`, `API_URL`)
- **Funções**: camelCase (ex: `calculateTotal`, `formatDate`)
- **Interfaces/Types**: PascalCase com prefixo 'I' opcional (ex: `User` ou `IUser`)
- **Enums**: PascalCase (ex: `OrderStatus`, `PaymentMethod`)

### Componentes React

- **Componentes**: PascalCase (ex: `ProductCard`, `OrderTable`)
- **Propriedades**: camelCase (ex: `onSubmit`, `isLoading`)
- **Eventos**: camelCase com prefixo 'handle' (ex: `handleSubmit`, `handleClick`)

## Estilo de Codificação

### TypeScript

- Sempre use tipos explícitos quando possível.
- Evite o uso de `any`.
- Use interfaces para estruturas de dados públicas e types para aliases e unions.
- Use generics quando apropriado.

```tsx
// Bom
interface User {
  id: string;
  name: string;
  age?: number;
}

// Evite
const user: any = { id: '123', name: 'João' };
```

### React

- Use componentes funcionais com hooks.
- Divida componentes grandes em componentes menores e reutilizáveis.
- Use desestruturação para props.
- Use corretamente os hooks de ciclo de vida (useEffect, useMemo, useCallback).

```tsx
// Bom
const UserCard = ({ user, onEdit }: UserCardProps) => {
  return (
    <div>
      <h3>{user.name}</h3>
      <Button onClick={onEdit}>Editar</Button>
    </div>
  );
};

// Evite
const UserCard = (props) => {
  return (
    <div>
      <h3>{props.user.name}</h3>
      <button onClick={props.onEdit}>Editar</button>
    </div>
  );
};
```

### CSS/Tailwind

- Use Tailwind para estilização seguindo a metodologia de utility-first.
- Para estilos complexos ou reutilizáveis, use o sistema de componentes Shadcn UI.
- Mantenha a consistência usando as cores e espaçamentos definidos no tema.

```tsx
// Bom
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md">
  <Avatar className="w-10 h-10" />
  <div>
    <h3 className="text-lg font-medium">{user.name}</h3>
    <p className="text-gray-500 text-sm">{user.email}</p>
  </div>
</div>

// Evite
<div style={{ display: 'flex', alignItems: 'center', padding: '16px' }}>
  <Avatar style={{ width: '40px', height: '40px' }} />
  <div>
    <h3 style={{ fontSize: '18px', fontWeight: 500 }}>{user.name}</h3>
    <p style={{ color: '#6b7280', fontSize: '14px' }}>{user.email}</p>
  </div>
</div>
```

## Importações

- Agrupamento de importações na seguinte ordem:
  1. Importações do React
  2. Importações de bibliotecas externas
  3. Importações de componentes internos
  4. Importações de tipos
  5. Importações de utilitários e hooks

```tsx
// React
import { useState, useEffect } from 'react';

// Bibliotecas externas
import { format } from 'date-fns';
import { zodResolver } from "@hookform/resolvers/zod";

// Componentes internos
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Hooks e contextos
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";

// Tipos
import type { Product } from "@/types";

// Utilitários
import { formatCurrency } from "@/lib/utils";
```

## Tratamento de Erros

- Use try-catch para tratar erros em operações assíncronas.
- Sempre forneça feedback ao usuário em caso de erro.
- Registre erros no console em ambientes de desenvolvimento.

```tsx
try {
  await api.post('/products', productData);
  toast({
    title: 'Produto criado',
    description: 'O produto foi criado com sucesso.',
  });
} catch (error) {
  console.error('Error creating product:', error);
  toast({
    title: 'Erro',
    description: 'Não foi possível criar o produto. Tente novamente mais tarde.',
    variant: 'destructive',
  });
}
```

## Formulários

Ver o documento específico [Form Guidelines](./form-guidelines.md) para padrões de formulários.

## Comentários

- Use comentários para explicar o "porquê", não o "o quê" ou "como".
- Use JSDoc para documentar funções e componentes públicos.
- Mantenha os comentários atualizados.

```tsx
/**
 * Calcula o total de itens no carrinho considerando descontos e impostos.
 * @param items - Itens do carrinho
 * @param discountPercent - Porcentagem de desconto (de 0 a 100)
 * @returns O valor total formatado em reais
 */
function calculateTotal(items: CartItem[], discountPercent: number = 0): string {
  // Implementação...
}
```

## Testes

- Escreva testes para lógica de negócios crítica.
- Use Jest para testes unitários.
- Use Testing Library para testes de componentes.
- Mantenha uma cobertura de testes adequada.

## Segurança

- Não exponha chaves de API ou segredos no código frontend.
- Valide todas as entradas do usuário.
- Use HTTPS para todas as requisições.
- Implemente proteção contra CSRF, XSS e outros ataques comuns.
- Use autenticação e autorização apropriadas.

## Otimização de Performance

- Use memoização para cálculos caros (useMemo, useCallback).
- Evite renderizações desnecessárias.
- Use lazy loading para componentes e imagens.
- Otimize as requisições de API com caching.

```tsx
// Bom
const memoizedValue = useMemo(() => {
  return calculateExpensiveValue(a, b);
}, [a, b]);

// Evite recalcular a cada render
const expensiveValue = calculateExpensiveValue(a, b);
```

## Git

- Use mensagens de commit descritivas e significativas.
- Siga o formato: `tipo: descrição breve` (ex: `fix: corrige erro no carrinho de compras`).
- Tipos comuns: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
- Mantenha os commits pequenos e focados em uma única tarefa.
- Faça merge/rebase frequentemente com a branch principal.

## Revisão de Código

- Revise o código em busca de problemas antes de enviar para revisão.
- Responda a todos os comentários da revisão.
- Aprove apenas código que atenda aos padrões definidos.

## Acessibilidade

- Use atributos ARIA quando apropriado.
- Mantenha uma hierarquia lógica de cabeçalhos.
- Garanta contraste adequado entre texto e fundo.
- Teste a navegação por teclado.
- Forneça textos alternativos para imagens.

---

Este documento deve ser seguido por todos os desenvolvedores do projeto ComandeJá. Os padrões podem ser ajustados conforme necessário com o consentimento da equipe. 
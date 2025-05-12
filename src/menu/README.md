
# ComandeJá - Documentação Técnica

## Integrando com PostgreSQL

Este projeto utiliza PostgreSQL como banco de dados principal. Para integrar corretamente, recomendamos:

### Opção 1: Supabase (Recomendado)

[Supabase](https://supabase.com/) oferece uma plataforma PostgreSQL completa com autenticação, armazenamento e APIs REST/GraphQL.

1. Crie uma conta no Supabase
2. Crie um novo projeto
3. Use os scripts SQL em [DATABASE.md](./DATABASE.md) para criar as tabelas
4. Integre o cliente JavaScript do Supabase ao projeto:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'SUA_URL_SUPABASE';
const supabaseKey = 'SUA_KEY_SUPABASE';
const supabase = createClient(supabaseUrl, supabaseKey);

// Exemplo de uso:
const { data, error } = await supabase
  .from('produtos')
  .select('*')
  .eq('restaurante_id', restauranteId);
```

### Opção 2: PostgreSQL Auto-Hospedado

Se preferir hospedar seu próprio banco de dados PostgreSQL:

1. Instale PostgreSQL em seu servidor
2. Configure o acesso com senha `Carlos244h` (apenas para desenvolvimento, use variáveis de ambiente em produção)
3. Execute os scripts SQL em [DATABASE.md](./DATABASE.md)
4. Use um cliente PostgreSQL como `pg` ou `node-postgres`:

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  user: 'seu_usuario',
  host: 'localhost',
  database: 'comandeja',
  password: 'Carlos244h',
  port: 5432,
});

// Exemplo de uso:
const result = await pool.query(
  'SELECT * FROM produtos WHERE restaurante_id = $1',
  [restauranteId]
);
```

## Configuração do Projeto

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_KEY=sua_chave_anon_supabase
VITE_API_URL=http://localhost:3000
```

### Dependências Principais

- React + TypeScript
- React Router
- TanStack Query (React Query)
- Supabase Client (opcional)
- Tailwind CSS + ShadCN UI

## Endpoints da API (Quando integrado com PostgreSQL)

### Restaurantes

- `GET /api/restaurantes/:id` - Obter detalhes do restaurante
- `PUT /api/restaurantes/:id` - Atualizar restaurante
- `GET /api/restaurantes/:id/categorias` - Listar categorias
- `GET /api/restaurantes/:id/produtos` - Listar produtos

### Produtos

- `GET /api/produtos/:id` - Obter produto
- `POST /api/produtos` - Criar produto
- `PUT /api/produtos/:id` - Atualizar produto
- `DELETE /api/produtos/:id` - Remover produto

### Pedidos

- `GET /api/pedidos?restaurante_id=X` - Listar pedidos
- `GET /api/pedidos/:id` - Obter pedido
- `POST /api/pedidos` - Criar pedido
- `PUT /api/pedidos/:id/status` - Atualizar status

### Clientes

- `GET /api/clientes?restaurante_id=X` - Listar clientes
- `GET /api/clientes/:id` - Obter cliente
- `POST /api/clientes` - Criar cliente

### Cupons

- `GET /api/cupons?restaurante_id=X` - Listar cupons
- `POST /api/cupons` - Criar cupom
- `PUT /api/cupons/:id` - Atualizar cupom
- `DELETE /api/cupons/:id` - Remover cupom
- `POST /api/cupons/validar` - Validar cupom

### Avaliações

- `GET /api/avaliacoes?restaurante_id=X` - Listar avaliações
- `POST /api/avaliacoes` - Criar avaliação
- `PUT /api/avaliacoes/:id/resposta` - Responder avaliação

## Integrações Recomendadas

1. **Processamento de Pagamento**: Stripe, Mercado Pago
2. **Notificações**: Firebase Cloud Messaging, OneSignal
3. **Análises**: Google Analytics, Mixpanel
4. **Mapas**: Google Maps, MapBox
5. **E-mail**: SendGrid, AWS SES

## Próximos Passos para Desenvolvimento

1. Implementar autenticação real com Supabase ou Firebase
2. Conectar com o banco de dados PostgreSQL
3. Implementar uploads de imagens para produtos
4. Adicionar gateway de pagamento
5. Desenvolver recursos de relatórios avançados


# Documentação do Banco de Dados - ComandeJá

Este documento descreve a estrutura do banco de dados para o sistema ComandeJá, um software de gerenciamento de restaurantes.

## Configuração do Banco de Dados PostgreSQL

### Informações de Conexão:
- **Tipo de Banco**: PostgreSQL
- **Senha**: Carlos244h (Nota: Em um ambiente de produção, use variáveis de ambiente para armazenar senhas)

## Estrutura do Banco de Dados

### Tabela: `usuarios`
Armazena informações dos usuários do sistema (proprietários de restaurantes, administradores).

```sql
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ultimo_acesso TIMESTAMP WITH TIME ZONE,
  ativo BOOLEAN DEFAULT TRUE
);
```

### Tabela: `restaurantes`
Armazena informações dos restaurantes cadastrados.

```sql
CREATE TABLE restaurantes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  logo VARCHAR(255),
  endereco TEXT NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  horario_funcionamento TEXT NOT NULL,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ativo BOOLEAN DEFAULT TRUE
);
```

### Tabela: `categorias`
Categorias de produtos do restaurante.

```sql
CREATE TABLE categorias (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  descricao TEXT,
  restaurante_id INTEGER NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
  ordem INTEGER DEFAULT 0
);
```

### Tabela: `produtos`
Produtos oferecidos pelo restaurante.

```sql
CREATE TABLE produtos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10, 2) NOT NULL,
  imagem_url VARCHAR(255),
  categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
  restaurante_id INTEGER NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
  disponivel BOOLEAN DEFAULT TRUE,
  destaque BOOLEAN DEFAULT FALSE,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: `clientes`
Clientes que fizeram pedidos no restaurante.

```sql
CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  telefone VARCHAR(20) NOT NULL,
  endereco TEXT,
  restaurante_id INTEGER NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: `pedidos`
Pedidos realizados pelos clientes.

```sql
CREATE TABLE pedidos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES clientes(id),
  restaurante_id INTEGER NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
  tipo_entrega VARCHAR(20) NOT NULL CHECK (tipo_entrega IN ('retirada', 'entrega')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('pendente', 'confirmado', 'preparando', 'pronto', 'entregue', 'cancelado')),
  valor_total DECIMAL(10, 2) NOT NULL,
  observacoes TEXT,
  endereco_entrega TEXT,
  agendado_para TIMESTAMP WITH TIME ZONE,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: `itens_pedido`
Itens incluídos em cada pedido.

```sql
CREATE TABLE itens_pedido (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id INTEGER NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(10, 2) NOT NULL,
  observacoes TEXT
);
```

### Tabela: `cupons`
Cupons de desconto para os pedidos.

```sql
CREATE TABLE cupons (
  id SERIAL PRIMARY KEY,
  restaurante_id INTEGER NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('percentual', 'fixo')),
  valor DECIMAL(10, 2) NOT NULL,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
  maximo_usos INTEGER,
  usos_atuais INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE
);
```

### Tabela: `avaliacoes`
Avaliações dos clientes sobre os restaurantes e pedidos.

```sql
CREATE TABLE avaliacoes (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER REFERENCES pedidos(id) ON DELETE SET NULL,
  cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
  restaurante_id INTEGER NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
  pontuacao INTEGER NOT NULL CHECK (pontuacao BETWEEN 1 AND 5),
  comentario TEXT,
  resposta TEXT,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  data_resposta TIMESTAMP WITH TIME ZONE
);
```

### Tabela: `configuracoes`
Configurações específicas de cada restaurante.

```sql
CREATE TABLE configuracoes (
  id SERIAL PRIMARY KEY,
  restaurante_id INTEGER NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE UNIQUE,
  taxa_entrega DECIMAL(10, 2) DEFAULT 0,
  tempo_medio_preparo INTEGER, -- em minutos
  raio_entrega DECIMAL(10, 2), -- em km
  aceita_pedidos BOOLEAN DEFAULT TRUE,
  pedido_minimo DECIMAL(10, 2) DEFAULT 0,
  metodos_pagamento JSONB
);
```

## Índices Recomendados

Para otimizar o desempenho das consultas mais comuns:

```sql
CREATE INDEX idx_produtos_categoria_id ON produtos(categoria_id);
CREATE INDEX idx_produtos_restaurante_id ON produtos(restaurante_id);
CREATE INDEX idx_pedidos_cliente_id ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_restaurante_id ON pedidos(restaurante_id);
CREATE INDEX idx_pedidos_status ON pedidos(status);
CREATE INDEX idx_itens_pedido_pedido_id ON itens_pedido(pedido_id);
CREATE INDEX idx_itens_pedido_produto_id ON itens_pedido(produto_id);
CREATE INDEX idx_avaliacoes_restaurante_id ON avaliacoes(restaurante_id);
```

## Exemplo de Integração com o ComandeJá

Este é um exemplo simplificado de como você pode integrar o PostgreSQL com o ComandeJá usando o Supabase (ou outra biblioteca de acesso a banco de dados PostgreSQL):

```typescript
// Exemplo usando Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'SUA_URL_SUPABASE'
const supabaseKey = 'SUA_KEY_SUPABASE'
const supabase = createClient(supabaseUrl, supabaseKey)

// Buscar produtos de um restaurante
async function buscarProdutos(restauranteId) {
  const { data, error } = await supabase
    .from('produtos')
    .select(`
      id, 
      nome, 
      descricao, 
      preco, 
      imagem_url, 
      disponivel,
      categorias (id, nome)
    `)
    .eq('restaurante_id', restauranteId)
    .order('nome')
  
  if (error) throw error
  return data
}

// Criar novo pedido
async function criarPedido(pedidoData, itensPedido) {
  // Iniciar transação
  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .insert(pedidoData)
    .select()
    .single()
  
  if (pedidoError) throw pedidoError
  
  // Adicionar itens ao pedido
  const itensComPedidoId = itensPedido.map(item => ({
    ...item,
    pedido_id: pedido.id
  }))
  
  const { error: itensError } = await supabase
    .from('itens_pedido')
    .insert(itensComPedidoId)
  
  if (itensError) throw itensError
  
  return pedido
}
```

## Diagrama de Relacionamento (ER)

```
usuarios 1 --- * restaurantes
restaurantes 1 --- * categorias
restaurantes 1 --- * produtos
restaurantes 1 --- * clientes
restaurantes 1 --- * pedidos
restaurantes 1 --- * cupons
restaurantes 1 --- * avaliacoes
restaurantes 1 --- 1 configuracoes
categorias 1 --- * produtos
clientes 1 --- * pedidos
clientes 1 --- * avaliacoes
pedidos 1 --- * itens_pedido
pedidos 1 --- * avaliacoes
produtos 1 --- * itens_pedido
```

## Considerações de Segurança

1. Sempre utilize senhas fortes e armazene-as de forma segura (hash + salt).
2. Implemente políticas de Row Level Security (RLS) no Supabase para controle de acesso.
3. Valide todos os inputs do usuário antes de inserir no banco de dados para prevenir SQL Injection.
4. Utilize SSL/TLS para conexões com o banco de dados.
5. Configure backups regulares do banco de dados.

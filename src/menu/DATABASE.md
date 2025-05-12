
# Documentação do Banco de Dados - ComandeJá

Este documento descreve a estrutura completa do banco de dados para o sistema ComandeJá, um software de gerenciamento de restaurantes operando como SaaS.

## Configuração do Banco de Dados PostgreSQL

### Informações de Conexão:
- **Tipo de Banco**: PostgreSQL
- **Senha**: Carlos244h (Nota: Em um ambiente de produção, use variáveis de ambiente para armazenar senhas)

## Estrutura do Banco de Dados

### Sistema de Usuários e Autenticação

#### Tabela: `usuarios`
Armazena informações dos usuários do sistema (proprietários de restaurantes).

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

#### Tabela: `admin_usuarios`
Armazena informações dos usuários administrativos do sistema SaaS.

```sql
CREATE TABLE admin_usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  perfil VARCHAR(20) NOT NULL CHECK (perfil IN ('admin', 'suporte', 'financeiro')),
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ultimo_acesso TIMESTAMP WITH TIME ZONE,
  ativo BOOLEAN DEFAULT TRUE
);
```

#### Tabela: `sessoes`
Armazena tokens de sessão para autenticação.

```sql
CREATE TABLE sessoes (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER,
  admin_usuario_id INTEGER,
  token VARCHAR(255) NOT NULL,
  data_expiracao TIMESTAMP WITH TIME ZONE NOT NULL,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CHECK ((usuario_id IS NOT NULL AND admin_usuario_id IS NULL) OR (usuario_id IS NULL AND admin_usuario_id IS NOT NULL)),
  CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_admin_usuario FOREIGN KEY (admin_usuario_id) REFERENCES admin_usuarios(id) ON DELETE CASCADE
);
```

### Sistema de Restaurantes e Configurações

#### Tabela: `restaurantes`
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

#### Tabela: `configuracoes`
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

### Sistema de Cardápio e Produtos

#### Tabela: `categorias`
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

#### Tabela: `produtos`
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

#### Tabela: `opcoes_produto`
Opções adicionais para produtos (ex: tamanho, sabores).

```sql
CREATE TABLE opcoes_produto (
  id SERIAL PRIMARY KEY,
  produto_id INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  nome VARCHAR(50) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('radio', 'checkbox')),
  obrigatorio BOOLEAN DEFAULT FALSE,
  min_opcoes INTEGER DEFAULT 0,
  max_opcoes INTEGER,
  ordem INTEGER DEFAULT 0
);
```

#### Tabela: `itens_opcao`
Valores para cada opção de produto.

```sql
CREATE TABLE itens_opcao (
  id SERIAL PRIMARY KEY,
  opcao_id INTEGER NOT NULL REFERENCES opcoes_produto(id) ON DELETE CASCADE,
  nome VARCHAR(50) NOT NULL,
  preco_adicional DECIMAL(10, 2) DEFAULT 0,
  disponivel BOOLEAN DEFAULT TRUE,
  ordem INTEGER DEFAULT 0
);
```

### Sistema de Pedidos

#### Tabela: `clientes`
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

#### Tabela: `pedidos`
Pedidos realizados pelos clientes.

```sql
CREATE TABLE pedidos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES clientes(id),
  restaurante_id INTEGER NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
  tipo_entrega VARCHAR(20) NOT NULL CHECK (tipo_entrega IN ('retirada', 'entrega')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('pendente', 'confirmado', 'preparando', 'pronto', 'entregue', 'cancelado')),
  valor_total DECIMAL(10, 2) NOT NULL,
  valor_desconto DECIMAL(10, 2) DEFAULT 0,
  taxa_entrega DECIMAL(10, 2) DEFAULT 0,
  observacoes TEXT,
  endereco_entrega TEXT,
  metodo_pagamento VARCHAR(50),
  referencia_pagamento VARCHAR(255),
  agendado_para TIMESTAMP WITH TIME ZONE,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: `itens_pedido`
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

#### Tabela: `opcoes_item_pedido`
Opções selecionadas para cada item do pedido.

```sql
CREATE TABLE opcoes_item_pedido (
  id SERIAL PRIMARY KEY,
  item_pedido_id INTEGER NOT NULL REFERENCES itens_pedido(id) ON DELETE CASCADE,
  item_opcao_id INTEGER NOT NULL REFERENCES itens_opcao(id) ON DELETE RESTRICT,
  preco_adicional DECIMAL(10, 2) NOT NULL,
  quantidade INTEGER DEFAULT 1
);
```

#### Tabela: `historico_status_pedido`
Histórico de alterações de status dos pedidos.

```sql
CREATE TABLE historico_status_pedido (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  status_anterior VARCHAR(20),
  status_atual VARCHAR(20) NOT NULL,
  comentario TEXT,
  usuario_id INTEGER REFERENCES usuarios(id),
  data_alteracao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Sistema de Promoções e Marketing

#### Tabela: `cupons`
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

#### Tabela: `uso_cupons`
Registra o uso de cupons em pedidos.

```sql
CREATE TABLE uso_cupons (
  id SERIAL PRIMARY KEY,
  cupom_id INTEGER NOT NULL REFERENCES cupons(id) ON DELETE CASCADE,
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  valor_desconto DECIMAL(10, 2) NOT NULL,
  data_uso TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Sistema de Feedback

#### Tabela: `avaliacoes`
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

### Sistema de SaaS e Administração

#### Tabela: `planos`
Planos oferecidos no modelo SaaS.

```sql
CREATE TABLE planos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  descricao TEXT,
  preco_mensal DECIMAL(10, 2) NOT NULL,
  preco_anual DECIMAL(10, 2),
  limite_produtos INTEGER,
  limite_usuarios INTEGER,
  recursos JSONB,
  ativo BOOLEAN DEFAULT TRUE
);
```

#### Tabela: `assinaturas`
Assinaturas dos restaurantes aos planos disponíveis.

```sql
CREATE TABLE assinaturas (
  id SERIAL PRIMARY KEY,
  restaurante_id INTEGER NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
  plano_id INTEGER NOT NULL REFERENCES planos(id),
  status VARCHAR(20) NOT NULL CHECK (status IN ('ativa', 'suspensa', 'cancelada', 'trial', 'inadimplente')),
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  intervalo VARCHAR(20) NOT NULL CHECK (intervalo IN ('mensal', 'anual')),
  renovacao_automatica BOOLEAN DEFAULT TRUE,
  metodo_pagamento VARCHAR(50),
  data_ultimo_pagamento TIMESTAMP WITH TIME ZONE,
  data_proximo_pagamento TIMESTAMP WITH TIME ZONE
);
```

#### Tabela: `pagamentos`
Registro de pagamentos realizados pelas assinaturas.

```sql
CREATE TABLE pagamentos (
  id SERIAL PRIMARY KEY,
  assinatura_id INTEGER NOT NULL REFERENCES assinaturas(id) ON DELETE CASCADE,
  valor DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pendente', 'pago', 'falha', 'reembolsado')),
  metodo_pagamento VARCHAR(50) NOT NULL,
  referencia_externa VARCHAR(255),
  data_vencimento TIMESTAMP WITH TIME ZONE,
  data_pagamento TIMESTAMP WITH TIME ZONE,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: `chamados_suporte`
Chamados de suporte abertos pelos restaurantes.

```sql
CREATE TABLE chamados_suporte (
  id SERIAL PRIMARY KEY,
  restaurante_id INTEGER REFERENCES restaurantes(id) ON DELETE SET NULL,
  admin_atribuido_id INTEGER REFERENCES admin_usuarios(id),
  assunto VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('aberto', 'em_andamento', 'resolvido', 'fechado')),
  prioridade VARCHAR(20) NOT NULL CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
  data_abertura TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  data_resolucao TIMESTAMP WITH TIME ZONE,
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: `mensagens_suporte`
Mensagens trocadas em cada chamado de suporte.

```sql
CREATE TABLE mensagens_suporte (
  id SERIAL PRIMARY KEY,
  chamado_id INTEGER NOT NULL REFERENCES chamados_suporte(id) ON DELETE CASCADE,
  usuario_id INTEGER REFERENCES usuarios(id),
  admin_usuario_id INTEGER REFERENCES admin_usuarios(id),
  mensagem TEXT NOT NULL,
  anexo_url VARCHAR(255),
  data_envio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CHECK ((usuario_id IS NOT NULL AND admin_usuario_id IS NULL) OR (usuario_id IS NULL AND admin_usuario_id IS NOT NULL))
);
```

#### Tabela: `notificacoes_sistema`
Notificações do sistema para usuários e administradores.

```sql
CREATE TABLE notificacoes_sistema (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  destinatarios VARCHAR(20) NOT NULL CHECK (destinatarios IN ('todos', 'admin', 'restaurante')),
  filtro_plano INTEGER REFERENCES planos(id),
  filtro_status VARCHAR(50),
  canais JSONB NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('rascunho', 'agendada', 'enviada', 'cancelada')),
  agendado_para TIMESTAMP WITH TIME ZONE,
  criado_por INTEGER REFERENCES admin_usuarios(id),
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  data_envio TIMESTAMP WITH TIME ZONE
);
```

#### Tabela: `notificacoes_usuario`
Notificações entregues para cada usuário.

```sql
CREATE TABLE notificacoes_usuario (
  id SERIAL PRIMARY KEY,
  notificacao_id INTEGER REFERENCES notificacoes_sistema(id) ON DELETE CASCADE,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  admin_usuario_id INTEGER REFERENCES admin_usuarios(id) ON DELETE CASCADE,
  lida BOOLEAN DEFAULT FALSE,
  canal VARCHAR(20) NOT NULL CHECK (canal IN ('email', 'app', 'whatsapp')),
  data_envio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  data_leitura TIMESTAMP WITH TIME ZONE,
  CHECK ((usuario_id IS NOT NULL AND admin_usuario_id IS NULL) OR (usuario_id IS NULL AND admin_usuario_id IS NOT NULL))
);
```

#### Tabela: `logs_sistema`
Registra ações importantes no sistema para auditoria.

```sql
CREATE TABLE logs_sistema (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  admin_usuario_id INTEGER REFERENCES admin_usuarios(id),
  acao VARCHAR(255) NOT NULL,
  entidade VARCHAR(50) NOT NULL,
  entidade_id INTEGER,
  dados_anteriores JSONB,
  dados_novos JSONB,
  ip_usuario VARCHAR(50),
  data_hora TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CHECK ((usuario_id IS NOT NULL AND admin_usuario_id IS NULL) OR (usuario_id IS NULL AND admin_usuario_id IS NOT NULL) OR (usuario_id IS NULL AND admin_usuario_id IS NULL))
);
```

#### Tabela: `emails_enviados`
Registro de todos os e-mails enviados pelo sistema.

```sql
CREATE TABLE emails_enviados (
  id SERIAL PRIMARY KEY,
  destinatario VARCHAR(255) NOT NULL,
  assunto VARCHAR(255) NOT NULL,
  corpo TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  referencia_id INTEGER,
  status VARCHAR(20) NOT NULL CHECK (status IN ('enviado', 'falha', 'processando')),
  mensagem_erro TEXT,
  data_envio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Sistema de Estatísticas e Relatórios

#### Tabela: `estatisticas_diarias_restaurante`
Estatísticas agregadas por dia para cada restaurante.

```sql
CREATE TABLE estatisticas_diarias_restaurante (
  id SERIAL PRIMARY KEY,
  restaurante_id INTEGER NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  total_pedidos INTEGER DEFAULT 0,
  total_vendas DECIMAL(10, 2) DEFAULT 0,
  ticket_medio DECIMAL(10, 2) DEFAULT 0,
  produtos_vendidos INTEGER DEFAULT 0,
  novos_clientes INTEGER DEFAULT 0,
  cancelamentos INTEGER DEFAULT 0,
  tempo_medio_preparo INTEGER,
  avaliacao_media DECIMAL(3, 2),
  UNIQUE (restaurante_id, data)
);
```

## Índices Recomendados

Para otimizar o desempenho das consultas mais comuns:

```sql
-- Índices para tabelas principais
CREATE INDEX idx_produtos_categoria_id ON produtos(categoria_id);
CREATE INDEX idx_produtos_restaurante_id ON produtos(restaurante_id);
CREATE INDEX idx_pedidos_cliente_id ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_restaurante_id ON pedidos(restaurante_id);
CREATE INDEX idx_pedidos_status ON pedidos(status);
CREATE INDEX idx_itens_pedido_pedido_id ON itens_pedido(pedido_id);
CREATE INDEX idx_itens_pedido_produto_id ON itens_pedido(produto_id);
CREATE INDEX idx_avaliacoes_restaurante_id ON avaliacoes(restaurante_id);

-- Índices para sistema SaaS
CREATE INDEX idx_assinaturas_restaurante_id ON assinaturas(restaurante_id);
CREATE INDEX idx_assinaturas_plano_id ON assinaturas(plano_id);
CREATE INDEX idx_assinaturas_status ON assinaturas(status);
CREATE INDEX idx_pagamentos_assinatura_id ON pagamentos(assinatura_id);
CREATE INDEX idx_chamados_restaurante_id ON chamados_suporte(restaurante_id);
CREATE INDEX idx_chamados_status ON chamados_suporte(status);
CREATE INDEX idx_notificacoes_status ON notificacoes_sistema(status);
CREATE INDEX idx_logs_entidade ON logs_sistema(entidade, entidade_id);
CREATE INDEX idx_logs_usuario_id ON logs_sistema(usuario_id);
CREATE INDEX idx_logs_admin_usuario_id ON logs_sistema(admin_usuario_id);
CREATE INDEX idx_estatisticas_restaurante_data ON estatisticas_diarias_restaurante(restaurante_id, data);
```

## Inserção de Dados Iniciais

Para iniciar o sistema com dados administrativos:

```sql
-- Inserir administrador padrão
INSERT INTO admin_usuarios (nome, email, senha, perfil, ativo) 
VALUES ('Administrador', 'admin@comandeja.com', '$2b$10$LERExzA/nMaEfLWm5L7Mw.VcdA.gB8ezH5C8kgfxZCQkXlxF9eApG', 'admin', true);
-- A senha inserida é 'comandeja@24h' (hash BCrypt)

-- Inserir planos padrão
INSERT INTO planos (nome, descricao, preco_mensal, preco_anual, limite_produtos, limite_usuarios, recursos, ativo)
VALUES
  ('Starter', 'Para restaurantes que estão começando', 99.90, 999.00, 50, 1, '{"cardapio_digital": true, "qrcode_pedidos": true, "gestao_pedidos_basico": true}', true),
  ('Pro', 'Para restaurantes em expansão', 199.90, 1999.00, NULL, 5, '{"cardapio_digital": true, "qrcode_pedidos": true, "gestao_pedidos_completo": true, "integracoes": true, "relatorios_avancados": true}', true),
  ('Premium', 'Para restaurantes consolidados', 299.90, 2999.00, NULL, NULL, '{"cardapio_digital": true, "qrcode_pedidos": true, "gestao_pedidos_completo": true, "integracoes": true, "relatorios_avancados": true, "gestao_mesas": true, "suporte_prioritario": true, "personalizacao_marca": true}', true);
```

## Considerações de Segurança

1. Sempre utilize senhas fortes e armazene-as de forma segura (hash + salt).
2. Implemente políticas de Row Level Security (RLS) no PostgreSQL para controle de acesso.
3. Valide todos os inputs do usuário antes de inserir no banco de dados para prevenir SQL Injection.
4. Utilize SSL/TLS para conexões com o banco de dados.
5. Configure backups regulares do banco de dados.
6. Implemente um sistema de logs para rastrear alterações críticas.

## Integração com o ComandeJá

Para integrar o banco de dados PostgreSQL com o ComandeJá:

1. Configure as variáveis de ambiente para conexão com o banco de dados.
2. Utilize um ORM ou driver PostgreSQL para facilitar a interação com o banco.
3. Implemente um sistema de migrações para versionamento do esquema.
4. Utilize prepared statements para evitar vulnerabilidades de SQL injection.
5. Configure um pool de conexões para gerenciar eficientemente as conexões ao banco.

```typescript
// Exemplo de configuração utilizando um client PostgreSQL
import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'comandeja',
  password: 'Carlos244h',
  port: 5432,
});

// Exemplo de função para autenticação do administrador
async function adminLogin(email, password) {
  try {
    const result = await pool.query(
      'SELECT id, nome, email, senha, perfil FROM admin_usuarios WHERE email = $1 AND ativo = true',
      [email]
    );
    
    if (result.rows.length === 0) {
      return { success: false, message: 'Credenciais inválidas' };
    }
    
    const admin = result.rows[0];
    const passwordValid = await bcrypt.compare(password, admin.senha);
    
    if (!passwordValid) {
      return { success: false, message: 'Credenciais inválidas' };
    }
    
    // Cria um token de sessão
    const token = generateToken();
    await pool.query(
      'INSERT INTO sessoes (admin_usuario_id, token, data_expiracao) VALUES ($1, $2, $3)',
      [admin.id, token, new Date(Date.now() + 24 * 60 * 60 * 1000)] // Expira em 24 horas
    );
    
    // Atualiza último acesso
    await pool.query(
      'UPDATE admin_usuarios SET ultimo_acesso = NOW() WHERE id = $1',
      [admin.id]
    );
    
    // Registra o login
    await pool.query(
      'INSERT INTO logs_sistema (admin_usuario_id, acao, entidade, entidade_id) VALUES ($1, $2, $3, $4)',
      [admin.id, 'login', 'admin_usuarios', admin.id]
    );
    
    return { 
      success: true, 
      data: {
        id: admin.id,
        name: admin.nome,
        email: admin.email,
        role: admin.perfil,
        token
      }
    };
  } catch (error) {
    console.error('Erro no login administrativo:', error);
    return { success: false, message: 'Erro interno do servidor' };
  }
}
```

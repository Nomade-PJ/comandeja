# Status do Armazenamento do Supabase no ComandeJá

## Status Atual ✅

O bucket "products" já está **corretamente configurado** no Supabase Storage para este projeto.

Verificações realizadas:
- ✅ O bucket "products" existe
- ✅ As políticas de acesso (SELECT, INSERT, UPDATE, DELETE) estão configuradas corretamente
- ✅ Já existem imagens no bucket, confirmando que o upload funciona

## Para Referência: Configuração do Bucket de Produtos

Se você precisar recriar essa configuração em um novo projeto, siga estas etapas:

### 1. Acesse o Dashboard do Supabase

- Faça login no [Supabase](https://app.supabase.com/)
- Selecione o seu projeto

### 2. Configure o Storage

1. No menu lateral, clique em "Storage"
2. Clique no botão "New Bucket"
3. Digite "products" como nome do bucket
4. Marque a opção "Public bucket" (para permitir acesso público às imagens)
5. Clique em "Create bucket"

### 3. Configure as Políticas de Acesso (RLS)

Para permitir que os usuários façam upload, visualizem e excluam imagens, você precisa configurar as políticas de Row Level Security (RLS).

1. No menu Storage, selecione o bucket "products"
2. Clique na aba "Policies"
3. Crie as seguintes políticas:

#### Política para permitir uploads (INSERT)

- Nome: "Allow public uploads to products"
- Operação: INSERT
- Definição da política: `bucket_id = 'products'`

#### Política para permitir visualização (SELECT)

- Nome: "Allow public downloads from products"
- Operação: SELECT
- Definição da política: `bucket_id = 'products'`

#### Política para permitir atualização (UPDATE)

- Nome: "Allow public updates to products"
- Operação: UPDATE
- Definição da política: `bucket_id = 'products'`

#### Política para permitir exclusão (DELETE)

- Nome: "Allow public deletions from products"
- Operação: DELETE
- Definição da política: `bucket_id = 'products'`

## Solução de Problemas

### Erro "Bucket not found"

Se você receber o erro "Bucket not found", verifique se:

- O bucket "products" foi criado corretamente
- O nome do bucket está escrito exatamente como "products" (sem maiúsculas)

### Erro de Permissão

Se você receber erros relacionados a permissões:

- Verifique se as políticas RLS foram configuradas corretamente
- Certifique-se de que o bucket está marcado como público

### Outros Erros

Para outros erros, verifique:

- Os logs do console no navegador para mensagens de erro detalhadas
- A aba "Storage" no painel do Supabase para verificar se há algum problema com o bucket ou com as políticas

## Configuração via SQL

Se preferir, você pode configurar o bucket e as políticas diretamente via SQL. Acesse o SQL Editor no Supabase e execute:

```sql
-- Criar o bucket products (se não existir)
INSERT INTO storage.buckets (id, name, public)
SELECT 'products', 'products', TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'products'
);

-- Configurar políticas de acesso
CREATE POLICY "Allow public uploads to products" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'products');

CREATE POLICY "Allow public downloads from products" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Allow public updates to products" ON storage.objects
  FOR UPDATE USING (bucket_id = 'products');

CREATE POLICY "Allow public deletions from products" ON storage.objects
  FOR DELETE USING (bucket_id = 'products');
``` 
# Configuração de Variáveis de Ambiente na Vercel

Para que o ComandeJá funcione corretamente na Vercel, é necessário configurar as variáveis de ambiente do banco de dados PostgreSQL.

## Opção 1: Usar o Vercel Postgres (Recomendado)

1. No dashboard da Vercel, vá para "Storage"
2. Clique em "Create" e selecione "Postgres Database"
3. Siga o processo de criação
4. Após criar, a Vercel fornecerá as variáveis de ambiente automaticamente

## Opção 2: Usar seu próprio Banco de Dados PostgreSQL

Se você preferir usar seu próprio banco de dados PostgreSQL, ele deve ser acessível pela internet. Siga estas etapas:

1. No dashboard da Vercel, vá para seu projeto
2. Clique em "Settings" > "Environment Variables"
3. Adicione as seguintes variáveis:

```
VITE_DB_USER=seu_usuario_postgres
VITE_DB_HOST=endereco_do_seu_servidor_postgres
VITE_DB_NAME=ComandeJa_SaaS
VITE_DB_PASSWORD=sua_senha_postgres
VITE_DB_PORT=5432
NODE_ENV=production
```

## Notas Importantes

- O banco de dados deve estar acessível externamente
- Para PostgreSQL hospedado em serviços como AWS RDS, Azure Database ou DigitalOcean, você precisa configurar as regras de firewall para permitir conexões da Vercel
- Sempre use senhas fortes para seu banco de dados

## Testando a Conexão

Após configurar as variáveis de ambiente, redeploy seu projeto e teste o login. Se o login funcionar, a conexão está correta. Se não funcionar, verifique os logs de erro na Vercel para identificar o problema. 
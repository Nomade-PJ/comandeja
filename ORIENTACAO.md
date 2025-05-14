# Orientações do Projeto ComandeJá

## Banco de Dados

### Configuração AWS RDS PostgreSQL
- **Plataforma:** Amazon Web Services (AWS) RDS
- **Engine:** PostgreSQL 12+
- **Host:** comandeja-db.cgie7mxjxlzr.us-east-1.rds.amazonaws.com
- **Porta:** 5432
- **Nome do Banco:** ComandeJa_SaaS
- **Usuário:** postgres
- **Senha:** comandeja@24h

### Estrutura do Banco de Dados
O banco de dados possui as seguintes tabelas principais:

1. **admin_users**
   - Armazena usuários administrativos
   - Campos principais: id, email, password_hash, name, role, is_active

2. **users**
   - Armazena usuários proprietários de restaurantes
   - Campos principais: id, email, password_hash, name, created_at

3. **restaurants**
   - Armazena informações dos restaurantes
   - Campos principais: id, owner_id, name, slug, created_at, updated_at

4. **customers**
   - Armazena clientes dos restaurantes
   - Campos principais: id, email, password_hash, name, phone, restaurant_id

5. **admin_access_passwords**
   - Armazena senhas de acesso ao painel administrativo
   - Campos principais: id, password_hash, description, created_at, expires_at

### Scripts SQL Importantes
- `database_setup.sql`: Criação inicial das tabelas
- `create_admin.sql`: Criação do usuário administrativo
- `install_pgcrypto.sql`: Instalação da extensão pgcrypto

## Configuração da Vercel

### Variáveis de Ambiente
Configure as seguintes variáveis em Settings > Environment Variables:

```env
VITE_DB_HOST=comandeja-db.cgie7mxjxlzr.us-east-1.rds.amazonaws.com
VITE_DB_PORT=5432
VITE_DB_NAME=ComandeJa_SaaS
VITE_DB_USER=postgres
VITE_DB_PASSWORD=comandeja@24h
```

### Passos para Configuração na Vercel

1. Acesse o dashboard da Vercel (vercel.com)
2. Selecione o projeto ComandeJá
3. Vá em "Settings"
4. Na seção "Environment Variables":
   - Clique em "Add New"
   - Adicione cada variável listada acima
   - Marque os ambientes onde cada variável deve estar disponível (Production, Preview, Development)

### Configurações Adicionais na Vercel

1. **Build Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

2. **Deployment Settings**
   - Node.js Version: 18.x
   - Regions: Washington D.C. (iad1)

## Conexão com o Banco de Dados

### No Código
A conexão com o banco de dados é gerenciada em dois lugares:

1. **Frontend (src/lib/db.ts)**
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  host: import.meta.env.VITE_DB_HOST,
  port: parseInt(import.meta.env.VITE_DB_PORT),
  database: import.meta.env.VITE_DB_NAME,
  user: import.meta.env.VITE_DB_USER,
  password: import.meta.env.VITE_DB_PASSWORD,
});
```

2. **Backend (server.cjs)**
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.VITE_DB_HOST,
  port: parseInt(process.env.VITE_DB_PORT),
  database: process.env.VITE_DB_NAME,
  user: process.env.VITE_DB_USER,
  password: process.env.VITE_DB_PASSWORD,
});
```

### Segurança
- As credenciais do banco de dados são armazenadas em variáveis de ambiente
- A conexão é feita através de SSL/TLS
- O banco de dados está em uma VPC privada na AWS
- O acesso é restrito por Security Groups

## AWS RDS

### Configurações do RDS
- **Instance Class:** db.t3.micro
- **Storage:** 20 GB gp2 (SSD)
- **Multi-AZ:** Disabled (desenvolvimento)
- **Backup Retention:** 7 days
- **Maintenance Window:** dom:05:00-dom:06:00 UTC

### Security Group
- Porta 5432 aberta apenas para IPs específicos:
  - Vercel IP ranges
  - IPs de desenvolvimento

### Monitoramento
- CloudWatch habilitado para métricas básicas
- Enhanced Monitoring: desabilitado
- Performance Insights: desabilitado

## Manutenção e Backup

### Backup Manual
Para fazer backup manual do banco:
```bash
pg_dump -h comandeja-db.cgie7mxjxlzr.us-east-1.rds.amazonaws.com -U postgres -d ComandeJa_SaaS > backup_$(date +%Y%m%d).sql
```

### Restauração
Para restaurar um backup:
```bash
psql -h comandeja-db.cgie7mxjxlzr.us-east-1.rds.amazonaws.com -U postgres -d ComandeJa_SaaS < backup_file.sql
```

## Troubleshooting

### Problemas Comuns

1. **Erro de Conexão com o Banco**
   - Verificar se as variáveis de ambiente estão corretas
   - Confirmar se o IP está liberado no Security Group
   - Testar conexão com: `psql -h [host] -U postgres -d ComandeJa_SaaS`

2. **Erro nas Migrations**
   - Verificar logs no console do RDS
   - Confirmar se todos os scripts SQL foram executados na ordem correta

3. **Problemas de Performance**
   - Verificar métricas no CloudWatch
   - Analisar queries lentas no log do RDS
   - Verificar conexões ativas com: `SELECT * FROM pg_stat_activity;`

## Links Úteis

- [Console AWS RDS](https://console.aws.amazon.com/rds)
- [Dashboard Vercel](https://vercel.com/dashboard)
- [Documentação PostgreSQL](https://www.postgresql.org/docs/12/index.html)
- [Repositório do Projeto](https://github.com/Nomade-PJ/comandeja)

## Contatos de Suporte

- **Suporte AWS:** Através do console AWS
- **Suporte Vercel:** support@vercel.com
- **Suporte Projeto:** Através das issues no GitHub 
# Configuração do ComandeJá na Vercel

Este documento detalha os passos necessários para configurar corretamente o projeto na Vercel.

## 1. Configuração de Variáveis de Ambiente

É **CRUCIAL** configurar as seguintes variáveis de ambiente EXATAMENTE como mostrado abaixo:

1. Vá ao painel da Vercel e selecione seu projeto ComandeJá
2. Navegue até "Settings" > "Environment Variables"
3. Adicione as seguintes variáveis:

```
VITE_DB_USER=postgres
VITE_DB_HOST=comandeja-saas.clag2oe2ce06.sa-east-1.rds.amazonaws.com
VITE_DB_NAME=postgres
VITE_DB_PASSWORD=Carlos2444h
VITE_DB_PORT=5432
NODE_ENV=production
```

4. Clique em "Save" para salvar as variáveis
5. **IMPORTANTE**: Você precisa fazer um novo deploy do projeto após salvar as variáveis de ambiente. Use a opção "Redeploy" no painel de controle.

## 2. Configuração do Banco de Dados RDS (PASSO MAIS CRÍTICO)

O principal problema geralmente é que o RDS não está configurado para permitir conexões externas:

1. Acesse o console AWS e vá até o serviço RDS
2. Selecione sua instância de banco de dados `comandeja-saas`
3. Vá até a aba "Connectivity & security"
4. Verifique o Security Group associado ao banco - clique no link do security group para editar
5. **IMPORTANTE**: Nas regras de entrada (Inbound rules), adicione uma nova regra:
   - Tipo: PostgreSQL
   - Protocolo: TCP
   - Porta: 5432
   - Origem: **0.0.0.0/0** (permite conexões de qualquer IP)
   - Descrição: Conexão temporária Vercel

6. Salve as regras e aguarde alguns minutos para que as alterações sejam aplicadas

## 3. Verifique a Página de Configuração do RDS

Certifique-se também de que:

1. "Publicly accessible" esteja marcado como "Yes" na configuração do RDS
2. O status do banco de dados seja "Available"
3. O banco de dados não tenha restrições de VPC que bloqueiem conexões externas

## 4. Verificando a Conexão e Diagnosticando Problemas

Para verificar se a aplicação está sendo configurada corretamente:

1. Após o deploy, acesse a rota `/api/test-connection` no seu domínio da Vercel
   - Por exemplo: `https://comandeja.vercel.app/api/test-connection`
   - Esta rota tentará se conectar ao banco de dados e retornará informações detalhadas

2. Se a conexão falhar, verifique os logs:
   - No dashboard da Vercel, vá em "Deployments" > clique no deploy mais recente
   - Vá para a aba "Functions" e clique em "server.cjs"
   - Analise os logs para identificar o erro específico

## 5. Testando Localmente a Conexão com o RDS

Para verificar se o RDS está realmente acessível:

1. Execute o script de teste no seu ambiente local:
   ```
   node test-db-connection.cjs
   ```
   
2. Este script tentará se conectar diretamente ao RDS e fornecerá informações detalhadas sobre qualquer erro

## 6. Erros Comuns e Soluções

1. **ECONNREFUSED ou ETIMEDOUT**: O RDS está bloqueando conexões
   - **Solução**: Configure o security group para permitir conexões de qualquer IP (0.0.0.0/0)

2. **Authentication failed**: Credenciais incorretas
   - **Solução**: Verifique se a senha e o usuário estão corretos

3. **Database does not exist**: O banco especificado não existe
   - **Solução**: Verifique o nome do banco de dados ou crie-o no RDS

4. **The endpoint is not publicly accessible**: RDS não está configurado como público
   - **Solução**: Configure o RDS para ser "Publicly accessible" 
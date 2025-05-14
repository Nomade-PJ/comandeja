# Configuração do ComandeJá na Vercel

Este documento detalha os passos necessários para configurar corretamente o projeto na Vercel.

## Configuração de Variáveis de Ambiente

É **CRUCIAL** configurar as seguintes variáveis de ambiente EXATAMENTE como mostrado abaixo:

1. Vá ao painel da Vercel e selecione seu projeto ComandeJá
2. Navegue até "Settings" > "Environment Variables"
3. Adicione as seguintes variáveis:

```
VITE_DB_USER=postgres
VITE_DB_HOST=comandeja-saas.clag2oe2ce06.sa-east-1.rds.amazonaws.com
VITE_DB_NAME=ComandeJa_SaaS
VITE_DB_PASSWORD=Carlos2444h
VITE_DB_PORT=5432
NODE_ENV=production
```

4. Clique em "Save" para salvar as variáveis
5. **IMPORTANTE**: Você precisa fazer um novo deploy do projeto após salvar as variáveis de ambiente. Use a opção "Redeploy" no painel de controle.

## Configuração do Banco de Dados RDS

Para que a aplicação na Vercel possa acessar o banco de dados RDS, verifique:

1. Acesse o console AWS e vá até o serviço RDS
2. Selecione sua instância de banco de dados `comandeja-saas`
3. Vá até a aba "Connectivity & security"
4. Verifique o Security Group associado ao banco
5. Edite as regras de entrada (Inbound rules) para permitir tráfego na porta 5432
   - Adicione uma regra para IPv4: `0.0.0.0/0` para a porta 5432 (temporariamente para testes)
   - Para produção, idealmente você limitaria aos IPs da Vercel

## Verificando a Conexão e Diagnosticando Problemas

Para verificar se a aplicação está sendo configurada corretamente:

1. Após o deploy, acesse a rota `/api/diagnostics` no seu domínio da Vercel
   - Por exemplo: `https://comandeja.vercel.app/api/diagnostics`
   - Isso mostrará se as variáveis de ambiente estão sendo carregadas corretamente

2. Se não conseguir acessar o app, verifique os logs:
   - No dashboard da Vercel, vá em "Deployments" > clique no deploy mais recente
   - Vá para a aba "Functions" e clique em "server.cjs"
   - Veja os logs para identificar erros

3. Se os logs mostrarem "cannot connect to database", verifique:
   - Se as variáveis de ambiente estão exatamente como definidas acima
   - Se o banco de dados RDS está acessível publicamente
   - Se as regras de segurança do RDS permitem conexões externas

## Corrigindo Problemas Comuns

1. **Problema**: As variáveis de ambiente não estão sendo reconhecidas
   **Solução**: Certifique-se de que foram salvas corretamente e que você fez redeploy

2. **Problema**: Erro "password authentication failed"
   **Solução**: Verifique se a senha está correta em VITE_DB_PASSWORD

3. **Problema**: Erro "could not connect to server"
   **Solução**: Verifique se o Security Group do RDS permite conexões da Vercel 
# Instruções para Deploy na Vercel

Este guia contém instruções detalhadas para realizar o deploy deste projeto na Vercel, garantindo compatibilidade total.

## Pré-requisitos

1. Conta na [Vercel](https://vercel.com)
2. Conta no [Supabase](https://supabase.com) com projeto configurado
3. Repositório Git com o código do projeto

## Configuração das Variáveis de Ambiente

Na Vercel, adicione as seguintes variáveis de ambiente:

- `VITE_SUPABASE_URL` - URL do seu projeto Supabase
- `VITE_SUPABASE_ANON_KEY` - Chave anônima do Supabase
- `NODE_ENV` - Defina como "production"
- `PORT` - A Vercel geralmente define esta automaticamente
- `JWT_SECRET` - Chave secreta para gerar tokens JWT (use uma chave forte e aleatória)
- `FRONTEND_URL` - URL do seu frontend após o deploy (ex: https://seu-app.vercel.app)

## Configuração do Deploy

1. **Conecte seu repositório Git** na plataforma Vercel

2. **Configuração do Projeto**:
   - Framework Preset: Selecione "Vite"
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Ignore Build Step** (opcional)
   - Se você quiser controlar quando os builds acontecem, configure um script na seção 
     "Ignored Build Step" para retornar exit 0 quando você não quiser builds.

## Verificação pós-deploy

Após o deploy, verifique:

1. Se todos os assets estáticos estão sendo carregados corretamente
2. Se o roteamento do frontend está funcionando (navegue entre páginas)
3. Se a API está funcionando corretamente
4. Se a autenticação está funcionando
5. Se a conexão com o Supabase está operacional

## Solução de problemas comuns

1. **Assets não carregando**
   - Verifique se o caminho dos assets está correto no código
   - Verifique se as configurações de rewrite no vercel.json estão corretas

2. **API não funcionando**
   - Verifique as variáveis de ambiente
   - Verifique logs no painel da Vercel

3. **Problemas de CORS**
   - Verifique se as configurações de CORS no server.cjs estão corretas
   - Verifique se a variável FRONTEND_URL está configurada corretamente

4. **Erro de autenticação**
   - Verifique as configurações do Supabase
   - Verifique se as variáveis de ambiente estão configuradas

## Deploy Manual via CLI

Se preferir usar a CLI da Vercel:

```bash
# Instale a CLI da Vercel globalmente
npm install -g vercel

# Faça login na sua conta
vercel login

# Deploy
vercel
```

Siga as instruções interativas para configurar o projeto. 

# Menu Administrativo - ComandeJá SaaS

Este documento descreve a estrutura do Menu Administrativo para o ComandeJá quando operado como um SaaS (Software as a Service), permitindo que múltiplos restaurantes utilizem a plataforma sob assinatura.

## Visão Geral

O painel administrativo do ComandeJá SaaS é destinado aos administradores do sistema (usuário: admin@comandeja.com) e contém ferramentas para gerenciar todos os clientes (restaurantes) que utilizam a plataforma.

## Estrutura do Menu Administrativo

### 1. Dashboard Geral

Visão geral do desempenho do SaaS:

- **Faturamento Total**: Visualização mensal e anual com gráficos de linha
- **Métricas de Clientes**:
  - Total de clientes ativos/inativos
  - Taxa de conversão de testes gratuitos
  - Churn rate (taxa de cancelamento)
- **Top Clientes**: Os 5 restaurantes com mais pedidos processados
- **Alertas**: Notificações de inadimplência, expiração de assinaturas, etc.
- **Gráficos Analíticos**: Filtráveis por data, região e tipo de cliente

### 2. Gestão de Assinaturas

Gerenciamento de todos os planos e assinaturas:

- **Lista de Assinaturas**: 
  - Nome do cliente
  - Plano atual
  - Status (ativo, cancelado, em teste, inadimplente)
  - Data de início/renovação
  - Valor mensal/anual
- **Ações por Cliente**:
  - Editar plano
  - Suspender/reativar acesso
  - Enviar cobrança manual
  - Visualizar histórico de pagamentos
- **Métodos de Pagamento**: Integração com gateways (PIX, boleto, cartão)

### 3. Cadastro e Gestão de Clientes

Informações detalhadas sobre cada restaurante cliente:

- **Dados Cadastrais**: 
  - Nome do estabelecimento
  - CNPJ/CPF
  - Responsável
  - Contatos (e-mail, telefone)
- **Configurações por Cliente**:
  - Recursos habilitados/desabilitados
  - Personalizações específicas
  - Limites de uso
- **Histórico do Cliente**:
  - Notas internas sobre suporte
  - Registro de problemas ou solicitações
  - Histórico de inadimplência (se houver)

### 4. Controle de Planos

Gerenciamento dos diferentes níveis de serviço oferecidos:

- **CRUD de Planos**: Criar, visualizar, editar e excluir planos
- **Definição de Limites por Plano**:
  - Quantidade de produtos no cardápio
  - Número de usuários/funcionários
  - Páginas de cardápio personalizadas
- **Recursos por Plano**:
  - Relatórios avançados
  - Integrações com delivery
  - Função de cardápio digital com QR Code
  - Analytics avançado

### 5. Suporte e Chamados

Central de atendimento para os restaurantes:

- **Lista de Chamados**:
  - Título/assunto
  - Cliente
  - Prioridade (baixa, média, alta, crítica)
  - Status (aberto, em andamento, resolvido)
  - Data de abertura e última atualização
- **Detalhes do Chamado**:
  - Histórico de interações
  - Arquivos anexados
  - Responsável interno
- **Integrações**:
  - E-mail
  - WhatsApp
  - Chat ao vivo

### 6. Configurações do Sistema

Administração da plataforma SaaS:

- **Usuários Administrativos**:
  - Cadastro de novos admin/suporte
  - Gerenciamento de permissões
  - Alteração de senhas
- **Segurança**:
  - Logs de acesso
  - Registro de alterações críticas
  - 2FA para administradores
- **Banco de Dados**:
  - Configurações de backup
  - Restauração de backups
  - Limpeza de dados antigos

### 7. Relatórios Avançados

Análises detalhadas do negócio:

- **Relatórios Financeiros**:
  - Faturamento total
  - Receita recorrente mensal (MRR)
  - Projeções futuras
- **Relatórios de Usuários**:
  - Análise de churn (cancelamentos)
  - Lifetime Value (LTV)
  - Custo de aquisição (CAC)
- **Exportação**: Opções para PDF, CSV e Excel
- **Agendamento**: Configuração de relatórios automáticos por e-mail

### 8. Notificações & Comunicação

Comunicação com os clientes restaurantes:

- **Sistema de Notificações**:
  - Criação de campanhas
  - Segmentação de clientes
  - Agendamento de envios
- **Canais**:
  - E-mail marketing
  - WhatsApp API
  - Notificações no sistema
- **Automações**:
  - Lembrete de fatura
  - Anúncio de novas funcionalidades
  - Alertas de manutenção
  - Felicitações (aniversário do restaurante na plataforma)

## Integração com o Banco de Dados

Este menu administrativo utiliza as tabelas específicas do módulo de administração SaaS descritas em [DATABASE.md](./DATABASE.md), incluindo:

- `admin_usuarios`
- `planos`
- `assinaturas`
- `restaurantes_saas`
- `pagamentos`
- `chamados_suporte`
- `comunicacoes`

## Acesso e Segurança

O acesso ao Menu Administrativo é restrito a usuários com perfil de administrador e implementa:

- Autenticação com senha forte + 2FA
- Diferentes níveis de permissões (admin total, financeiro, suporte)
- Registro completo de atividades (audit log)
- Timeout de sessão por inatividade

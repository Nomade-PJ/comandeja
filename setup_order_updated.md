# Instruções para Configuração das Tabelas no PostgreSQL

Após identificar o erro "relation 'subscriptions' does not exist", criamos instruções atualizadas para configurar as tabelas de forma correta no banco de dados do ComandeJá.

## Opção 1: Script inicial completo (RECOMENDADO)

A maneira mais simples é executar o script que cria todas as tabelas fundamentais de uma vez:

1. `create_initial_schema.sql` - Cria todas as tabelas básicas necessárias (users, admin_users, restaurants, subscription_plans, subscriptions, notifications)

Com o esquema básico criado, você pode continuar com os outros scripts para as funcionalidades adicionais:

2. `create_trial_periods_table_fixed.sql` - Cria a tabela para períodos de teste (versão corrigida)
3. `create_price_history_table.sql` - Cria a tabela para histórico de preços dos planos
4. `create_payment_methods_table.sql` - Cria a tabela para métodos de pagamento
5. `update_subscriptions_table.sql` - Atualiza a tabela de assinaturas com novos campos
6. `create_promotions_table.sql` - Cria a tabela para promoções temporárias

## Opção 2: Sequência detalhada (passo a passo)

Se preferir criar as tabelas individualmente, siga esta ordem exata:

1. `install_pgcrypto.sql` - Instala a extensão pgcrypto necessária para UUID
2. `create_timestamp_function.sql` - Cria a função update_timestamp() usada em vários triggers
3. `create_subscription_plans_table.sql` - Cria a tabela de planos de assinatura e insere os planos
4. `create_subscriptions_table.sql` - Cria a tabela de assinaturas
5. `create_notifications_table.sql` - Cria a tabela de notificações
6. `create_trial_periods_table_fixed.sql` - Cria a tabela para períodos de teste (versão corrigida)
7. `create_price_history_table.sql` - Cria a tabela para histórico de preços dos planos
8. `create_payment_methods_table.sql` - Cria a tabela para métodos de pagamento
9. `update_subscriptions_table.sql` - Atualiza a tabela de assinaturas com novos campos
10. `create_promotions_table.sql` - Cria a tabela para promoções temporárias

## Opção 3: Script combinado corrigido

Como alternativa às opções anteriores, execute o script:

- `create_combined_migrations_fixed.sql` - Script com todas as migrações em um arquivo único, na ordem correta e com verificações

## Verificando se a instalação foi bem-sucedida

Após executar os scripts, você pode verificar se tudo foi instalado corretamente:

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar planos cadastrados
SELECT * FROM subscription_plans;

-- Verificar triggers existentes
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY trigger_name;
```

## Resolução de problemas comuns

- **"relation 'subscriptions' does not exist"**: A tabela subscriptions não existe. Execute primeiro o script create_initial_schema.sql.
- **"function update_timestamp() does not exist"**: A função update_timestamp não existe. Execute o script create_timestamp_function.sql.
- **"already exists"**: A tabela ou objeto já existe. Isso é normal se você já executou parte dos scripts antes.
- **"permission denied"**: Verifique se você tem permissões adequadas no banco de dados. 
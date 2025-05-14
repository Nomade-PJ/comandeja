# Instruções para Configuração das Tabelas no PostgreSQL

Para configurar corretamente as tabelas no banco de dados do ComandeJá, siga a ordem abaixo ao executar os scripts SQL:

## 1. Primeiro, execute os scripts de configuração básica:

1. `install_pgcrypto.sql` - Instala a extensão pgcrypto necessária para UUID e funções de criptografia
2. `create_timestamp_function.sql` - Cria a função update_timestamp() usada em vários triggers

## 2. Depois, execute os scripts de criação de tabelas principais:

3. `create_subscription_plans_table.sql` - Cria a tabela de planos de assinatura e insere os planos
4. `create_price_history_table.sql` - Cria a tabela para histórico de preços dos planos
5. `create_payment_methods_table.sql` - Cria a tabela para métodos de pagamento
6. `create_trial_periods_table.sql` - Cria a tabela para períodos de teste
7. `update_subscriptions_table.sql` - Atualiza a tabela de assinaturas com novos campos
8. `create_promotions_table.sql` - Cria a tabela para promoções temporárias

## 3. Alternativamente, você pode executar o script combinado:

Como opção, você pode executar o script `create_combined_migrations.sql` que inclui todas as alterações acima em um único arquivo.

## Observações importantes:

- Se ocorrer o erro "relation 'subscription_plans' does not exist", execute primeiro o script `create_subscription_plans_table.sql`
- Se ocorrer o erro "function update_timestamp() does not exist", execute o script `create_timestamp_function.sql`
- Se você já executou algum dos scripts individuais com sucesso, pode continuar com os próximos na sequência
- Sempre verifique as mensagens de erro para identificar problemas específicos

## Consultas úteis para verificar a criação das tabelas:

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
Resumindo as alterações que fizemos para implementar a função de restrição de usuários ao restaurante onde foram cadastrados:
Banco de Dados:
Adicionamos a coluna registered_restaurant_id à tabela profiles para rastrear em qual restaurante um cliente foi registrado.
Criamos um índice para melhorar a performance das consultas.
Simplificamos as políticas de RLS para evitar erros 500 e implementamos a lógica de restrição no nível da aplicação.
Tipos e Interfaces:
Atualizamos os tipos em src/integrations/supabase/types.ts para incluir o novo campo.
Autenticação e Registro:
Modificamos src/lib/auth.ts para armazenar o ID do restaurante nos metadados do usuário e no registro do perfil.
Atualizamos o componente AuthModal.tsx para garantir que o restaurante seja registrado durante o cadastro.
Controle de Acesso:
Criamos o hook useRestaurantAccess para gerenciar o acesso dos usuários aos restaurantes.
Implementamos verificações no componente RestaurantView.tsx para redirecionar usuários para o restaurante onde estão registrados.
Modificamos as funções de adicionar ao carrinho para verificar se o usuário tem permissão para fazer pedidos no restaurante.
Navegação:
Atualizamos o componente UserMenu.tsx para redirecionar os usuários para o restaurante correto quando clicarem em "Meu Perfil".
Com essas alterações, os usuários agora só podem acessar e fazer pedidos no restaurante onde foram cadastrados. Se tentarem acessar outro restaurante, serão redirecionados para o restaurante correto.
Você gostaria que eu explicasse alguma parte específica da implementação com mais detalhes ou que fizesse alguma alteração adicional?
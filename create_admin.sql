-- Inserir usuário administrativo
INSERT INTO admin_users (
  email,
  password_hash,
  name,
  role,
  is_active
) VALUES (
  'comandeja@gmail.com',
  crypt('comandeja@24h', gen_salt('bf')),
  'Administrador ComandeJá',
  'admin',
  true
); 
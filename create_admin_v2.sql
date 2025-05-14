-- Remover usuário admin anterior se existir
DELETE FROM admin_users WHERE email = 'comandeja@gmail.com';

-- Inserir novo usuário administrativo
INSERT INTO admin_users (
  email,
  password_hash,
  name,
  role,
  is_active
) VALUES (
  'comandeja@gmail.com',
  encode(digest('comandeja@24h', 'sha256'), 'hex'),
  'Administrador ComandeJá',
  'admin',
  true
); 
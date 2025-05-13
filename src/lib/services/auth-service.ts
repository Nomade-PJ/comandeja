import { query } from '../db';
import { User } from '../models';
import * as crypto from 'crypto';
import { getApiUrl } from '../env';

// Determinar se estamos em um ambiente de navegador
const isBrowser = typeof window !== 'undefined';

/**
 * Serviço de Autenticação que integra com o PostgreSQL
 */
export class AuthService {
  /**
   * Realiza hash da senha de forma segura
   * @param password Senha em texto simples
   * @returns Hash da senha
   */
  private static hashPassword(password: string): string {
    // Em produção, use bcrypt ou argon2 - aqui usamos sha256 por simplicidade
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  /**
   * Autentica um usuário (proprietário de restaurante)
   * @param email Email do usuário
   * @param password Senha em texto simples
   * @returns Dados do usuário ou null se autenticação falhar
   */
  public static async login(email: string, password: string): Promise<User | null> {
    try {
      // Em navegador, tenta usar a API
      if (isBrowser) {
        try {
          const apiUrl = getApiUrl('login');
          console.log('Tentando login via API:', apiUrl);
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });
          
          if (!response.ok) {
            console.warn(`Login via API falhou: ${response.status}`);
            return null;
          }
          
          const data = await response.json();
          if (!data.success || !data.user) {
            return null;
          }
          
          return data.user;
        } catch (apiError) {
          console.warn('Erro ao usar API para login, tentando método direto:', apiError);
        }
      }
      
      // Método direto (fallback)
      const passwordHash = this.hashPassword(password);
      
      const result = await query(
        'SELECT id, email, name, created_at, last_login, is_active FROM users WHERE email = $1 AND password_hash = $2',
        [email, passwordHash]
      );

      if (result.rows.length === 0) {
        return null;
      }

      // Atualiza a data do último login
      await query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [result.rows[0].id]
      );

      // Busca o restaurante do usuário
      const restaurantResult = await query(
        'SELECT id, slug FROM restaurants WHERE owner_id = $1',
        [result.rows[0].id]
      );

      // Cria o objeto de usuário com os dados necessários
      const user: User = {
        ...result.rows[0],
        restaurantId: restaurantResult.rows.length > 0 ? restaurantResult.rows[0].id : undefined,
        restaurantSlug: restaurantResult.rows.length > 0 ? restaurantResult.rows[0].slug : undefined,
      };

      return user;
    } catch (error) {
      console.error('Erro no login:', error);
      return null;
    }
  }

  /**
   * Registra um novo usuário e seu restaurante
   * @param name Nome do usuário
   * @param email Email do usuário
   * @param password Senha em texto simples
   * @param restaurantName Nome do restaurante
   * @returns Dados do usuário criado ou null em caso de erro
   */
  public static async register(
    name: string, 
    email: string, 
    password: string, 
    restaurantName: string
  ): Promise<User | null> {
    console.log('🔶 Iniciando registro de novo usuário:', { name, email, restaurantName });
    
    try {
      // Em navegador, tenta usar a API
      if (isBrowser) {
        try {
          const apiUrl = getApiUrl('register');
          console.log('Tentando registro via API:', apiUrl);
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password, restaurantName }),
          });
          
          if (!response.ok) {
            console.warn(`Registro via API falhou: ${response.status}`);
            return null;
          }
          
          const data = await response.json();
          if (!data.success || !data.user) {
            return null;
          }
          
          return data.user;
        } catch (apiError) {
          console.warn('Erro ao usar API para registro, tentando método direto:', apiError);
        }
      }
      
      // Método direto (fallback)
      const passwordHash = this.hashPassword(password);
      
      // Gera o slug a partir do nome do restaurante
      const slug = restaurantName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      console.log('📝 Slug gerado para o restaurante:', slug);
      
      // Verificar se o e-mail já está em uso
      const checkEmail = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );
      
      if (checkEmail.rows.length > 0) {
        console.log('⚠️ Email já está em uso:', email);
        return null;
      }
      
      // Verificar se o slug já existe
      const checkSlug = await query(
        'SELECT id FROM restaurants WHERE slug = $1',
        [slug]
      );
      
      if (checkSlug.rows.length > 0) {
        console.log('⚠️ Slug já está em uso:', slug);
        return null;
      }
      
      // Inicia uma transação
      console.log('🔄 Iniciando transação de banco de dados');
      await query('BEGIN');
      
      try {
        // Insere o usuário
        console.log('➕ Inserindo novo usuário no banco de dados');
        const userResult = await query(
          'INSERT INTO users (email, password_hash, name, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
          [email, passwordHash, name]
        );
        
        if (userResult.rows.length === 0) {
          console.error('❌ Falha ao inserir usuário no banco de dados');
          await query('ROLLBACK');
          return null;
        }
        
        const userId = userResult.rows[0].id;
        console.log('✅ Usuário criado com sucesso, ID:', userId);
        
        // Insere o restaurante
        console.log('➕ Inserindo novo restaurante no banco de dados');
        const restaurantResult = await query(
          'INSERT INTO restaurants (owner_id, name, slug, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *',
          [userId, restaurantName, slug]
        );
        
        if (restaurantResult.rows.length === 0) {
          console.error('❌ Falha ao inserir restaurante no banco de dados');
          await query('ROLLBACK');
          return null;
        }
        
        const restaurantId = restaurantResult.rows[0].id;
        console.log('✅ Restaurante criado com sucesso, ID:', restaurantId);
        
        // Insere as configurações iniciais do restaurante
        console.log('➕ Inserindo configurações iniciais do restaurante');
        await query(
          'INSERT INTO restaurant_settings (restaurant_id) VALUES ($1)',
          [restaurantId]
        );
        
        // Confirma a transação
        console.log('✅ Confirmando transação');
        await query('COMMIT');
        
        // Cria e retorna o usuário com os dados necessários
        const user: User = {
          id: userId,
          email: email,
          name: name,
          created_at: userResult.rows[0].created_at,
          is_active: true,
          restaurantId: restaurantId,
          restaurantSlug: slug
        };
        
        console.log('🎉 Registro completado com sucesso');
        return user;
      } catch (error) {
        // Se ocorrer qualquer erro durante a transação, fazemos rollback
        console.error('❌ Erro durante a transação, executando rollback');
        await query('ROLLBACK');
        throw error; // Re-lançar o erro para ser tratado no catch externo
      }
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      return null;
    }
  }

  /**
   * Solicita redefinição de senha
   * @param email Email do usuário
   * @returns Verdadeiro se o email existir e token for gerado
   */
  public static async requestPasswordReset(email: string): Promise<boolean> {
    try {
      // Verifica se o email existe
      const userResult = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );
      
      if (userResult.rows.length === 0) {
        // Retornamos true mesmo se o email não existir para evitar enumeração de usuários
        return true;
      }
      
      // Gera um token aleatório
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date();
      expires.setHours(expires.getHours() + 1); // Token válido por 1 hora
      
      // Salva o token no banco
      await query(
        'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3',
        [token, expires, userResult.rows[0].id]
      );
      
      // Aqui, idealmente, enviaríamos um email com o token
      // Em um sistema real, isso seria feito com um serviço de email
      
      return true;
    } catch (error) {
      console.error('Erro ao solicitar redefinição de senha:', error);
      return false;
    }
  }

  /**
   * Redefine a senha usando um token
   * @param token Token de redefinição
   * @param newPassword Nova senha
   * @returns Verdadeiro se a senha foi alterada com sucesso
   */
  public static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      // Verifica se o token é válido e não expirou
      const userResult = await query(
        'SELECT id FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()',
        [token]
      );
      
      if (userResult.rows.length === 0) {
        return false;
      }
      
      const passwordHash = this.hashPassword(newPassword);
      
      // Atualiza a senha e limpa o token
      await query(
        'UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2',
        [passwordHash, userResult.rows[0].id]
      );
      
      return true;
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      return false;
    }
  }

  /**
   * Registra um novo cliente para um restaurante
   * @param name Nome do cliente
   * @param email Email do cliente
   * @param phone Telefone do cliente
   * @param password Senha em texto simples
   * @param restaurantSlug Slug do restaurante
   * @returns Verdadeiro se o cliente foi registrado com sucesso
   */
  public static async registerCustomer(
    name: string,
    email: string,
    phone: string,
    password: string,
    restaurantSlug: string
  ): Promise<boolean> {
    try {
      // Busca o restaurante pelo slug
      const restaurantResult = await query(
        'SELECT id FROM restaurants WHERE slug = $1',
        [restaurantSlug]
      );
      
      if (restaurantResult.rows.length === 0) {
        return false;
      }
      
      const restaurantId = restaurantResult.rows[0].id;
      const passwordHash = this.hashPassword(password);
      
      // Verifica se o telefone já está cadastrado para este restaurante
      const checkCustomer = await query(
        'SELECT id FROM customers WHERE restaurant_id = $1 AND phone = $2',
        [restaurantId, phone]
      );
      
      if (checkCustomer.rows.length > 0) {
        // Atualiza o cliente existente
        await query(
          'UPDATE customers SET name = $1, email = $2, password_hash = $3 WHERE id = $4',
          [name, email, passwordHash, checkCustomer.rows[0].id]
        );
      } else {
        // Insere um novo cliente
        await query(
          'INSERT INTO customers (restaurant_id, name, email, phone, password_hash, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
          [restaurantId, name, email, phone, passwordHash]
        );
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao registrar cliente:', error);
      return false;
    }
  }

  /**
   * Autentica um cliente para um restaurante específico
   * @param email Email ou telefone do cliente
   * @param password Senha em texto simples
   * @param restaurantSlug Slug do restaurante
   * @returns Dados do cliente ou null se autenticação falhar
   */
  public static async customerLogin(
    email: string,
    password: string,
    restaurantSlug: string
  ): Promise<any | null> {
    try {
      // Busca o restaurante pelo slug
      const restaurantResult = await query(
        'SELECT id FROM restaurants WHERE slug = $1',
        [restaurantSlug]
      );
      
      if (restaurantResult.rows.length === 0) {
        return null;
      }
      
      const restaurantId = restaurantResult.rows[0].id;
      const passwordHash = this.hashPassword(password);
      
      // Busca o cliente pelo email/telefone e senha
      const customerResult = await query(
        'SELECT id, name, email, phone, created_at FROM customers WHERE restaurant_id = $1 AND (email = $2 OR phone = $2) AND password_hash = $3',
        [restaurantId, email, passwordHash]
      );
      
      if (customerResult.rows.length === 0) {
        return null;
      }
      
      // Atualiza a data do último login
      await query(
        'UPDATE customers SET last_order_at = NOW() WHERE id = $1',
        [customerResult.rows[0].id]
      );
      
      return {
        ...customerResult.rows[0],
        restaurantId,
        role: 'customer'
      };
    } catch (error) {
      console.error('Erro no login do cliente:', error);
      return null;
    }
  }
} 
import * as z from 'zod';

// Esquema de validação para o login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

// Esquema de validação para o registro
export const registerSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  restaurantName: z.string().min(2, 'O nome do restaurante deve ter pelo menos 2 caracteres'),
  password: z.string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'A senha deve ter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'A senha deve ter pelo menos um número')
    .regex(/[^a-zA-Z0-9]/, 'A senha deve ter pelo menos um caractere especial'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Você deve aceitar os termos de uso',
  })
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

// Esquema de validação para novos produtos
export const productSchema = z.object({
  name: z.string().min(2, 'O nome do produto deve ter pelo menos 2 caracteres'),
  description: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres'),
  price: z.number().positive('O preço deve ser um valor positivo'),
  categoryId: z.string().uuid('Categoria inválida'),
  available: z.boolean().default(true),
  featured: z.boolean().default(false),
  image: z.any().optional(),
});

// Esquema de validação para categorias
export const categorySchema = z.object({
  name: z.string().min(2, 'O nome da categoria deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  available: z.boolean().default(true),
});

// Esquema de validação para pedidos
export const orderSchema = z.object({
  customer: z.object({
    name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
    email: z.string().email('Email inválido').optional(),
    phone: z.string().min(10, 'Telefone inválido').optional(),
  }),
  items: z.array(
    z.object({
      productId: z.string().uuid('Produto inválido'),
      quantity: z.number().int().positive('A quantidade deve ser um número positivo'),
      notes: z.string().optional(),
    })
  ).min(1, 'O pedido deve ter pelo menos um item'),
  paymentMethod: z.enum(['cash', 'credit_card', 'debit_card', 'pix']),
  notes: z.string().optional(),
});

// Esquema de validação para configurações de restaurante
export const restaurantSettingsSchema = z.object({
  name: z.string().min(2, 'O nome do restaurante deve ter pelo menos 2 caracteres'),
  description: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres'),
  address: z.string().min(5, 'O endereço deve ter pelo menos 5 caracteres'),
  phone: z.string().min(10, 'Telefone inválido'),
  openingHours: z.string().min(2, 'Horário de funcionamento inválido'),
  logo: z.any().optional(),
  banner: z.any().optional(),
  acceptsDelivery: z.boolean().default(false),
  deliveryFee: z.number().min(0, 'Taxa de entrega inválida').optional(),
  minOrderValue: z.number().min(0, 'Valor mínimo inválido').optional(),
});

// Função helper para validar dados com tratamento de erros
export async function validateData(schema: z.ZodType<any>, data: any) {
  try {
    const validData = await schema.parseAsync(data);
    return { success: true, data: validData, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Formatar mensagens de erro
      const errorMessages = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }));
      return { success: false, data: null, error: errorMessages };
    }
    return { success: false, data: null, error: [{ path: 'form', message: 'Erro de validação desconhecido' }] };
  }
} 
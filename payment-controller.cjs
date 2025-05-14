const { Pool } = require('pg');
const mercadopago = require('mercadopago');
const crypto = require('crypto');

// Configuração do banco de dados PostgreSQL
const pool = new Pool({
  user: process.env.VITE_DB_USER || 'postgres',
  host: process.env.VITE_DB_HOST || 'comandeja-saas.clag2oe2ce06.sa-east-1.rds.amazonaws.com',
  database: process.env.VITE_DB_NAME || 'postgres',
  password: process.env.VITE_DB_PASSWORD || 'Carlos2444h',
  port: parseInt(process.env.VITE_DB_PORT || '5432'),
  ssl: {
    rejectUnauthorized: false
  }
});

// Configurar MercadoPago - Isso deve vir de uma variável de ambiente em produção
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-1234567890123456789012345678901234'
});

// Função para criar pagamento com cartão
async function createCardPayment(paymentData) {
  try {
    // Criar pagamento no MercadoPago
    const payment = await mercadopago.payment.create({
      transaction_amount: parseFloat(paymentData.amount),
      token: paymentData.cardToken,
      description: `Assinatura ${paymentData.planName}`,
      installments: 1,
      payment_method_id: paymentData.paymentMethodId,
      payer: {
        email: paymentData.email
      }
    });

    // Iniciar transação no banco
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Registrar transação no banco
      const transactionResult = await client.query(
        `INSERT INTO payment_transactions (
          restaurant_id, 
          user_id, 
          payment_method_id, 
          amount, 
          currency, 
          status, 
          gateway, 
          gateway_transaction_id, 
          gateway_response
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [
          paymentData.restaurantId,
          paymentData.userId,
          paymentData.paymentMethodId,
          paymentData.amount,
          'BRL',
          payment.status === 'approved' ? 'completed' : payment.status,
          'mercadopago',
          payment.id.toString(),
          JSON.stringify(payment)
        ]
      );
      
      const transactionId = transactionResult.rows[0].id;
      
      // Se o pagamento foi aprovado, criar ou atualizar a assinatura
      if (payment.status === 'approved') {
        // Chamar função SQL para criar assinatura
        await client.query(
          'SELECT create_subscription_after_payment($1, $2, $3, $4)',
          [
            paymentData.restaurantId,
            paymentData.planId,
            paymentData.paymentMethodId,
            paymentData.trialId || null
          ]
        );
        
        // Atualizar transação com ID da assinatura
        const subscriptionResult = await client.query(
          'SELECT id FROM subscriptions WHERE restaurant_id = $1 ORDER BY created_at DESC LIMIT 1',
          [paymentData.restaurantId]
        );
        
        if (subscriptionResult.rows.length > 0) {
          await client.query(
            'UPDATE payment_transactions SET subscription_id = $1 WHERE id = $2',
            [subscriptionResult.rows[0].id, transactionId]
          );
        }
      }
      
      await client.query('COMMIT');
      
      return {
        success: true,
        paymentId: payment.id,
        status: payment.status,
        transactionId: transactionId
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao processar pagamento com cartão:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Função para criar pagamento com PIX
async function createPixPayment(paymentData) {
  try {
    // Criar pagamento no MercadoPago
    const payment = await mercadopago.payment.create({
      transaction_amount: parseFloat(paymentData.amount),
      description: `Assinatura ${paymentData.planName}`,
      payment_method_id: 'pix',
      payer: {
        email: paymentData.email,
        first_name: paymentData.firstName || 'Cliente',
        last_name: paymentData.lastName || 'ComandeJá'
      }
    });

    // Iniciar transação no banco
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Registrar transação no banco
      const transactionResult = await client.query(
        `INSERT INTO payment_transactions (
          restaurant_id, 
          user_id, 
          payment_method_id, 
          amount, 
          currency, 
          status, 
          gateway, 
          gateway_transaction_id, 
          gateway_response,
          pix_qr_code,
          pix_expiration_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
        [
          paymentData.restaurantId,
          paymentData.userId,
          paymentData.paymentMethodId,
          paymentData.amount,
          'BRL',
          'pending', // PIX começa como pendente
          'mercadopago',
          payment.id.toString(),
          JSON.stringify(payment),
          payment.point_of_interaction.transaction_data.qr_code,
          new Date(Date.now() + 30 * 60 * 1000) // Expira em 30 minutos
        ]
      );
      
      const transactionId = transactionResult.rows[0].id;
      
      await client.query('COMMIT');
      
      return {
        success: true,
        paymentId: payment.id,
        status: payment.status,
        transactionId: transactionId,
        qrCode: payment.point_of_interaction.transaction_data.qr_code,
        qrCodeBase64: payment.point_of_interaction.transaction_data.qr_code_base64
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao processar pagamento com PIX:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Função para verificar o status de um pagamento PIX
async function checkPixPaymentStatus(transactionId) {
  try {
    // Buscar informações da transação
    const transactionResult = await pool.query(
      'SELECT gateway_transaction_id FROM payment_transactions WHERE id = $1',
      [transactionId]
    );
    
    if (transactionResult.rows.length === 0) {
      return {
        success: false,
        error: 'Transação não encontrada'
      };
    }
    
    const gatewayTransactionId = transactionResult.rows[0].gateway_transaction_id;
    
    // Verificar status no MercadoPago
    const payment = await mercadopago.payment.get(gatewayTransactionId);
    
    // Atualizar status no banco
    if (payment.response.status === 'approved') {
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Atualizar status da transação
        await client.query(
          'UPDATE payment_transactions SET status = $1, updated_at = NOW() WHERE id = $2',
          ['completed', transactionId]
        );
        
        // Buscar dados necessários para criar a assinatura
        const paymentData = await client.query(
          `SELECT 
            restaurant_id, 
            user_id, 
            payment_method_id,
            (SELECT plan_id FROM trial_periods WHERE restaurant_id = pt.restaurant_id AND status = 'active' LIMIT 1) as trial_id
          FROM payment_transactions pt 
          WHERE id = $1`,
          [transactionId]
        );
        
        if (paymentData.rows.length > 0) {
          const data = paymentData.rows[0];
          
          // Buscar plano para o qual o pagamento foi feito
          const planResult = await client.query(
            `SELECT 
              sp.id as plan_id
            FROM subscription_plans sp
            JOIN trial_periods tp ON tp.plan_id = sp.id
            WHERE tp.restaurant_id = $1 AND tp.status = 'active'
            LIMIT 1`,
            [data.restaurant_id]
          );
          
          if (planResult.rows.length > 0) {
            // Criar assinatura
            await client.query(
              'SELECT create_subscription_after_payment($1, $2, $3, $4)',
              [
                data.restaurant_id,
                planResult.rows[0].plan_id,
                data.payment_method_id,
                data.trial_id
              ]
            );
            
            // Atualizar transação com ID da assinatura
            const subscriptionResult = await client.query(
              'SELECT id FROM subscriptions WHERE restaurant_id = $1 ORDER BY created_at DESC LIMIT 1',
              [data.restaurant_id]
            );
            
            if (subscriptionResult.rows.length > 0) {
              await client.query(
                'UPDATE payment_transactions SET subscription_id = $1 WHERE id = $2',
                [subscriptionResult.rows[0].id, transactionId]
              );
            }
          }
        }
        
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }
    
    return {
      success: true,
      status: payment.response.status,
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Erro ao verificar status do pagamento PIX:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Função para salvar novo método de pagamento
async function savePaymentMethod(methodData) {
  try {
    // Gerar token se for cartão (simulado)
    let cardToken = null;
    if (methodData.paymentType.includes('card')) {
      cardToken = crypto
        .createHash('sha256')
        .update(`${methodData.cardNumber}-${Date.now()}`)
        .digest('hex');
    }
    
    // Inserir método de pagamento
    const result = await pool.query(
      `INSERT INTO payment_methods (
        user_id,
        restaurant_id,
        payment_type,
        is_default,
        card_last_four,
        card_brand,
        card_holder_name,
        card_expiry_month,
        card_expiry_year,
        card_token,
        pix_key_type,
        pix_key
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
      [
        methodData.userId,
        methodData.restaurantId,
        methodData.paymentType,
        methodData.isDefault || false,
        methodData.cardLastFour || null,
        methodData.cardBrand || null,
        methodData.cardHolderName || null,
        methodData.cardExpiryMonth || null,
        methodData.cardExpiryYear || null,
        cardToken,
        methodData.pixKeyType || null,
        methodData.pixKey || null
      ]
    );
    
    return {
      success: true,
      paymentMethodId: result.rows[0].id
    };
  } catch (error) {
    console.error('Erro ao salvar método de pagamento:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  createCardPayment,
  createPixPayment,
  checkPixPaymentStatus,
  savePaymentMethod
}; 
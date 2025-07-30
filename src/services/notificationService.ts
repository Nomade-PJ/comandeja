export interface NotificationMessage {
  title: string;
  body: string;
  icon?: string;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
}

class NotificationService {
  private permission: NotificationPermission = 'default';

  constructor() {
    this.requestPermission();
  }

  // Solicitar permissão para notificações
  async requestPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission();
    }
    return this.permission;
  }

  // Enviar notificação do browser
  async sendBrowserNotification(message: NotificationMessage): Promise<void> {
    if (this.permission !== 'granted') {
      console.log('Permissão para notificações negada');
      return;
    }

    if ('Notification' in window) {
      const notification = new Notification(message.title, {
        body: message.body,
        icon: message.icon || '/logo.png',
        badge: '/logo.png',
        tag: 'order-status',
        requireInteraction: true,
        actions: message.actions
      });

      // Auto fechar após 10 segundos
      setTimeout(() => {
        notification.close();
      }, 10000);
    }
  }

  // Obter mensagem personalizada baseada no status do pedido
  getStatusMessage(status: string, orderNumber: string): NotificationMessage {
    const messages: Record<string, NotificationMessage> = {
      confirmed: {
        title: `Pedido #${orderNumber} Confirmado! 🎉`,
        body: 'Seu pedido foi confirmado e está sendo preparado com carinho!',
        actions: [
          { action: 'view', title: 'Ver Pedido' },
          { action: 'track', title: 'Acompanhar' }
        ]
      },
      preparing: {
        title: `Preparando seu Pedido #${orderNumber} 👨‍🍳`,
        body: 'Nossos chefs estão preparando seu pedido. Em breve estará pronto!',
        actions: [
          { action: 'view', title: 'Ver Detalhes' }
        ]
      },
      ready: {
        title: `Pedido #${orderNumber} Pronto! ✅`,
        body: 'Seu pedido está pronto e saindo para entrega!',
        actions: [
          { action: 'track', title: 'Rastrear Entrega' }
        ]
      },
      out_for_delivery: {
        title: `Pedido #${orderNumber} a Caminho! 🚗`,
        body: 'Seu pedido saiu para entrega. Chegada prevista em breve!',
        actions: [
          { action: 'track', title: 'Ver no Mapa' },
          { action: 'contact', title: 'Contatar Entregador' }
        ]
      },
      delivered: {
        title: `Pedido #${orderNumber} Entregue! 🎊`,
        body: 'Seu pedido foi entregue! Que tal avaliar sua experiência?',
        actions: [
          { action: 'review', title: 'Avaliar Pedido' },
          { action: 'reorder', title: 'Pedir Novamente' }
        ]
      },
      cancelled: {
        title: `Pedido #${orderNumber} Cancelado ❌`,
        body: 'Seu pedido foi cancelado. Entre em contato conosco se tiver dúvidas.',
        actions: [
          { action: 'contact', title: 'Falar Conosco' },
          { action: 'reorder', title: 'Fazer Novo Pedido' }
        ]
      }
    };

    return messages[status] || {
      title: `Atualização do Pedido #${orderNumber}`,
      body: `Status do pedido atualizado para: ${status}`
    };
  }

  // Enviar notificação para mudança de status
  async notifyStatusChange(orderNumber: string, newStatus: string, customerName?: string): Promise<void> {
    const message = this.getStatusMessage(newStatus, orderNumber);
    
    // Personalizar mensagem com nome do cliente se disponível
    if (customerName) {
      message.body = `Olá ${customerName}! ${message.body}`;
    }

    await this.sendBrowserNotification(message);
    
    // Log para debug
    console.log(`📱 Notificação enviada: ${message.title}`);
  }

  // Integração futura com WhatsApp (placeholder)
  async sendWhatsAppNotification(phone: string, message: string): Promise<void> {
    // TODO: Implementar integração com WhatsApp Business API
    console.log(`📱 WhatsApp para ${phone}: ${message}`);
  }

  // Integração futura com email (placeholder)
  async sendEmailNotification(email: string, subject: string, body: string): Promise<void> {
    // TODO: Implementar integração com serviço de email
    console.log(`📧 Email para ${email}: ${subject}`);
  }
}

export const notificationService = new NotificationService(); 
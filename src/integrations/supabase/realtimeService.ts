import { supabase, logDebug } from './client';
import { RealtimeChannel, RealtimeChannelOptions } from '@supabase/supabase-js';

// Singleton para gerenciar canais Realtime do Supabase
class RealtimeService {
  private channels: Map<string, RealtimeChannel>;
  private listeners: Map<string, Set<() => void>>;
  private errorHandlers: Set<() => void>;
  private connectionStatus: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' = 'DISCONNECTED';
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private maxReconnectAttempts = 15;
  private currentReconnectAttempt = 0;
  private reconnectDelay = 1000;

  constructor() {
    this.channels = new Map();
    this.listeners = new Map();
    this.errorHandlers = new Set();
    
    // Monitorar estado da conexão
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  /**
   * Registra um handler para erros de conexão
   * @param handler Função a ser chamada quando houver erro de conexão
   * @returns Função para remover o handler
   */
  onError(handler: () => void): () => void {
    this.errorHandlers.add(handler);
    return () => {
      this.errorHandlers.delete(handler);
    };
  }

  /**
   * Subscreve a mudanças em uma tabela para um restaurante específico
   * @param table Nome da tabela
   * @param restaurantId ID do restaurante
   * @param callback Função a ser executada quando houver mudanças
   * @returns Uma função para cancelar a subscrição
   */
  subscribeToTable(table: string, restaurantId: string, callback: () => void): () => void {
    const channelId = `${table}_changes_${restaurantId}`;
    
    // Adicionar callback à lista de listeners
    if (!this.listeners.has(channelId)) {
      this.listeners.set(channelId, new Set());
    }
    
    this.listeners.get(channelId)?.add(callback);
    
    // Se o canal já existe, não criar novamente
    if (!this.channels.has(channelId)) {
      this.createChannel(channelId, table, restaurantId);
    }
    
    // Retornar função para cancelar a subscrição
    return () => {
      const listeners = this.listeners.get(channelId);
      
      if (listeners) {
        listeners.delete(callback);
        
        // Se não houver mais listeners, remover o canal
        if (listeners.size === 0) {
          const channel = this.channels.get(channelId);
          if (channel) {
            supabase.removeChannel(channel);
            this.channels.delete(channelId);
            this.listeners.delete(channelId);
          }
        }
      }
    };
  }

  /**
   * Cria um canal de realtime com tratamento de erros
   */
  private createChannel(channelId: string, table: string, restaurantId: string) {
    // Opções do canal com timeout mais curto e mais tentativas de reconexão
    const channelOptions: RealtimeChannelOptions = {
      config: {
        broadcast: { ack: true },
        presence: { key: '' },
      },
    };

    const channel = supabase
      .channel(channelId, channelOptions)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          try {
            // Notificar todos os listeners
            this.listeners.get(channelId)?.forEach(listener => listener());
          } catch (error) {
            console.error(`Erro ao processar mudança em ${table}`);
          }
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error(`Erro na subscrição ${channelId}`);
          this.connectionStatus = 'DISCONNECTED';
          this.notifyError();
          this.attemptReconnect();
          return;
        }
        
        if (status === 'SUBSCRIBED') {
          this.connectionStatus = 'CONNECTED';
          this.currentReconnectAttempt = 0;
        } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          console.error(`Canal ${channelId} com erro`);
          this.connectionStatus = 'DISCONNECTED';

          this.notifyError();
          this.attemptReconnect();
        } else if (status === 'CLOSED') {
          this.connectionStatus = 'DISCONNECTED';
          if (this.listeners.has(channelId) && this.listeners.get(channelId)!.size > 0) {
            this.notifyError();
            this.attemptReconnect();
          }
        }
      });
    
    this.channels.set(channelId, channel);
  }

  /**
   * Notifica handlers de erro
   */
  private notifyError() {
    this.errorHandlers.forEach(handler => handler());
  }

  /**
   * Tenta reconectar todos os canais
   */
  private attemptReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.currentReconnectAttempt >= this.maxReconnectAttempts) {
      return;
    }

    this.currentReconnectAttempt++;
    const delay = this.reconnectDelay * Math.pow(1.5, this.currentReconnectAttempt - 1);
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAll();
    }, delay);
  }

  /**
   * Reconecta todos os canais
   */
  private reconnectAll() {
    // Armazenar configurações dos canais atuais
    const channelsConfig: Array<{id: string, table: string, restaurantId: string}> = [];
    
    // Remover todos os canais
    this.channels.forEach((channel, channelId) => {
      const parts = channelId.split('_changes_');
      const table = parts[0];
      const restaurantId = parts[1];
      
      channelsConfig.push({
        id: channelId,
        table,
        restaurantId
      });
      
      supabase.removeChannel(channel);
    });
    
    this.channels.clear();
    
    // Recriar todos os canais
    channelsConfig.forEach(config => {
      if (this.listeners.has(config.id) && this.listeners.get(config.id)!.size > 0) {
        this.createChannel(config.id, config.table, config.restaurantId);
      }
    });
  }

  /**
   * Manipula evento de conexão online
   */
  private handleOnline() {
    this.reconnectAll();
  }

  /**
   * Manipula evento de conexão offline
   */
  private handleOffline() {
    this.connectionStatus = 'DISCONNECTED';
    this.notifyError();
  }

  /**
   * Cancela todas as subscrições
   */
  unsubscribeAll() {
    this.channels.forEach(channel => {
      supabase.removeChannel(channel);
    });
    
    this.channels.clear();
    this.listeners.clear();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}

export const realtimeService = new RealtimeService();

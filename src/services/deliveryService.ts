interface DeliveryCalculation {
  deliveryFee: number;
  estimatedTime: number;
  distance: number;
  canDeliver: boolean;
  reason?: string;
}

interface RestaurantLocation {
  latitude: number;
  longitude: number;
  delivery_radius: number;
  base_delivery_fee: number;
  estimated_delivery_time: number;
}

interface CustomerLocation {
  latitude: number;
  longitude: number;
}

class DeliveryService {
  // Calcular distância entre dois pontos usando fórmula de Haversine
  private calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  // Calcular taxa de entrega baseada na distância
  private calculateFeeByDistance(distance: number, baseFee: number): number {
    // Taxa base para até 2km
    if (distance <= 2) {
      return baseFee;
    }
    
    // Taxa adicional de R$ 1,50 por km adicional
    const additionalKm = distance - 2;
    const additionalFee = additionalKm * 1.5;
    
    return baseFee + additionalFee;
  }

  // Calcular tempo estimado baseado na distância
  private calculateDeliveryTime(distance: number, baseTime: number): number {
    // Velocidade média de entrega: 20 km/h
    const deliverySpeed = 20; // km/h
    const travelTime = (distance / deliverySpeed) * 60; // em minutos
    
    // Tempo base (preparo) + tempo de viagem
    return Math.ceil(baseTime + travelTime);
  }

  // Aplicar modificadores por horário de pico
  private applyPeakHourModifier(fee: number, time: number): { fee: number, time: number } {
    const currentHour = new Date().getHours();
    
    // Horários de pico: 11:30-14:00 e 18:00-21:00
    const isLunchPeak = currentHour >= 11 && currentHour <= 14;
    const isDinnerPeak = currentHour >= 18 && currentHour <= 21;
    
    if (isLunchPeak || isDinnerPeak) {
      return {
        fee: fee * 1.2, // 20% de aumento na taxa
        time: time * 1.3 // 30% de aumento no tempo
      };
    }
    
    return { fee, time };
  }

  // Verificar se o endereço está na zona de entrega
  private isWithinDeliveryRadius(
    distance: number, 
    maxRadius: number
  ): { canDeliver: boolean, reason?: string } {
    if (distance <= maxRadius) {
      return { canDeliver: true };
    }
    
    return { 
      canDeliver: false, 
      reason: `Endereço fora da área de entrega. Máximo: ${maxRadius}km, Distância: ${distance.toFixed(1)}km` 
    };
  }

  // Função principal para calcular entrega
  async calculateDelivery(
    restaurantLocation: RestaurantLocation,
    customerLocation: CustomerLocation,
    orderValue: number = 0
  ): Promise<DeliveryCalculation> {
    try {
      // Calcular distância
      const distance = this.calculateDistance(
        restaurantLocation.latitude,
        restaurantLocation.longitude,
        customerLocation.latitude,
        customerLocation.longitude
      );

      // Verificar se está dentro do raio de entrega
      const deliveryCheck = this.isWithinDeliveryRadius(
        distance, 
        restaurantLocation.delivery_radius
      );

      if (!deliveryCheck.canDeliver) {
        return {
          deliveryFee: 0,
          estimatedTime: 0,
          distance,
          canDeliver: false,
          reason: deliveryCheck.reason
        };
      }

      // Calcular taxa base por distância
      let deliveryFee = this.calculateFeeByDistance(
        distance, 
        restaurantLocation.base_delivery_fee
      );

      // Calcular tempo estimado
      let estimatedTime = this.calculateDeliveryTime(
        distance, 
        restaurantLocation.estimated_delivery_time
      );

      // Aplicar modificadores de horário de pico
      const peakModified = this.applyPeakHourModifier(deliveryFee, estimatedTime);
      deliveryFee = peakModified.fee;
      estimatedTime = peakModified.time;

      // Frete grátis para pedidos acima de R$ 50
      if (orderValue >= 50) {
        deliveryFee = 0;
      }

      return {
        deliveryFee: Math.round(deliveryFee * 100) / 100, // Arredondar para 2 casas decimais
        estimatedTime: Math.ceil(estimatedTime),
        distance: Math.round(distance * 100) / 100,
        canDeliver: true
      };

    } catch (error) {
      console.error('Erro ao calcular entrega:', error);
      return {
        deliveryFee: restaurantLocation.base_delivery_fee,
        estimatedTime: restaurantLocation.estimated_delivery_time,
        distance: 0,
        canDeliver: true,
        reason: 'Erro no cálculo, usando valores padrão'
      };
    }
  }

  // Obter localização do cliente via geolocalização
  async getCustomerLocation(): Promise<CustomerLocation | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.log('Geolocalização não suportada');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutos
        }
      );
    });
  }

  // Geocodificar endereço (placeholder para integração futura)
  async geocodeAddress(address: string): Promise<CustomerLocation | null> {
    // TODO: Integrar com Google Maps Geocoding API ou similar
    console.log('Geocodificação de endereço:', address);
    return null;
  }
}

export const deliveryService = new DeliveryService();
export type { DeliveryCalculation, RestaurantLocation, CustomerLocation }; 
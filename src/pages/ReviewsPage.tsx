
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MessageSquare } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Tipos para avaliações
type ReviewStatus = 'pending' | 'published' | 'hidden';

type Review = {
  id: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  comment: string;
  date: Date;
  status: ReviewStatus;
  productName?: string;
  orderNumber?: string;
  reply?: string;
};

// Dados de exemplo
const mockReviews: Review[] = [
  {
    id: 'rev-1',
    customerName: 'Ana Souza',
    customerAvatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    comment: 'Comida excelente! O hambúrguer estava perfeito e chegou ainda quente. Com certeza vou pedir novamente.',
    date: new Date(2025, 4, 8),
    status: 'published',
    productName: 'Classic Burger',
    orderNumber: 'ORD-19384',
  },
  {
    id: 'rev-2',
    customerName: 'Pedro Costa',
    rating: 3,
    comment: 'A comida estava boa, mas demorou muito para entregar. Quase 1 hora de atraso.',
    date: new Date(2025, 4, 7),
    status: 'published',
    productName: 'Pepperoni Pizza',
    orderNumber: 'ORD-19350',
    reply: 'Pedimos desculpas pelo atraso, Pedro. Estávamos com alto volume de pedidos nesse dia, mas estamos trabalhando para melhorar nosso tempo de entrega.'
  },
  {
    id: 'rev-3',
    customerName: 'Mariana Lima',
    customerAvatar: 'https://i.pravatar.cc/150?img=5',
    rating: 1,
    comment: 'Comida fria e pedido incompleto. Muito decepcionada.',
    date: new Date(2025, 4, 6),
    status: 'hidden',
    productName: 'Veggie Burger',
    orderNumber: 'ORD-19325',
  },
  {
    id: 'rev-4',
    customerName: 'José Santos',
    rating: 4,
    comment: 'Ótima comida! Só achei um pouco caro.',
    date: new Date(2025, 4, 5),
    status: 'pending',
    productName: 'Classic Burger',
    orderNumber: 'ORD-19310',
  },
];

const ReviewsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<ReviewStatus | 'all'>('all');
  const [reviews] = useState<Review[]>(mockReviews);
  
  // Filtra avaliações por status e termo de busca
  const filteredReviews = reviews.filter(review => {
    // Filtro de status
    if (filter !== 'all' && review.status !== filter) {
      return false;
    }
    
    // Filtro de busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        review.customerName.toLowerCase().includes(searchLower) ||
        review.comment.toLowerCase().includes(searchLower) ||
        (review.productName?.toLowerCase().includes(searchLower) || false) ||
        (review.orderNumber?.toLowerCase().includes(searchLower) || false)
      );
    }
    
    return true;
  });

  // Formata data para padrão brasileiro
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  // Componente para exibir estrelas de avaliação
  const RatingStars = ({ rating }: { rating: number }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout title="Avaliações">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="w-full md:w-1/2">
              <Input
                placeholder="Buscar avaliações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={(value) => setFilter(value as ReviewStatus | 'all')}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="published">Publicadas</SelectItem>
                  <SelectItem value="hidden">Ocultas</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">Exportar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Classificação Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4.2</div>
            <div className="flex items-center mt-1">
              <RatingStars rating={4} />
              <span className="text-sm text-gray-500 ml-2">de 5</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total de Avaliações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">245</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Avaliações Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Taxa de Resposta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">78%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="positive">Positivas (4-5★)</TabsTrigger>
          <TabsTrigger value="neutral">Neutras (3★)</TabsTrigger>
          <TabsTrigger value="negative">Negativas (1-2★)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="space-y-4">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <Card key={review.id} className={`
                  ${review.status === 'pending' ? 'border-blue-300' : ''}
                  ${review.status === 'hidden' ? 'opacity-70' : ''}
                `}>
                  <CardContent className="pt-6">
                    <div className="flex items-start">
                      <Avatar className="h-10 w-10 mr-4">
                        <AvatarImage src={review.customerAvatar} alt={review.customerName} />
                        <AvatarFallback>{review.customerName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{review.customerName}</h3>
                            <div className="flex items-center text-sm text-gray-500 gap-2 mt-1">
                              <RatingStars rating={review.rating} />
                              <span>•</span>
                              <span>{formatDate(review.date)}</span>
                              {review.productName && (
                                <>
                                  <span>•</span>
                                  <span>{review.productName}</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {review.status === 'pending' && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Pendente</span>
                            )}
                            {review.status === 'hidden' && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">Oculta</span>
                            )}
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Responder
                            </Button>
                          </div>
                        </div>
                        
                        <p className="mt-2">{review.comment}</p>
                        
                        {review.reply && (
                          <div className="mt-4 pl-4 border-l-2 border-gray-200">
                            <p className="text-sm font-medium">Resposta do restaurante:</p>
                            <p className="text-sm mt-1">{review.reply}</p>
                          </div>
                        )}
                        
                        <div className="flex justify-end mt-4 gap-2">
                          {review.status !== 'published' && (
                            <Button variant="outline" size="sm">Publicar</Button>
                          )}
                          {review.status !== 'hidden' && (
                            <Button variant="outline" size="sm">Ocultar</Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Nenhuma avaliação encontrada</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="positive" className="mt-6">
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Avaliações positivas serão exibidas aqui</p>
          </div>
        </TabsContent>
        
        <TabsContent value="neutral" className="mt-6">
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Avaliações neutras serão exibidas aqui</p>
          </div>
        </TabsContent>
        
        <TabsContent value="negative" className="mt-6">
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Avaliações negativas serão exibidas aqui</p>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default ReviewsPage;

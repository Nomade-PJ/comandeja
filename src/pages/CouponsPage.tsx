import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useIsMobile } from '@/hooks/use-mobile';
import { Search, Plus, Calendar, Tag } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// Tipos para os cupons
type CouponType = 'percentage' | 'fixed';

type Coupon = {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderValue?: number;
  usageLimit?: number;
  usedCount: number;
  validUntil: Date;
  active: boolean;
};

// Dados de exemplo
const mockCoupons: Coupon[] = [
  {
    id: 'coup-1',
    code: 'BEMVINDO10',
    type: 'percentage',
    value: 10,
    minOrderValue: 40,
    usageLimit: 1,
    usedCount: 145,
    validUntil: new Date(2025, 9, 30),
    active: true
  },
  {
    id: 'coup-2',
    code: 'FRETE-GRATIS',
    type: 'fixed',
    value: 15,
    minOrderValue: 50,
    usedCount: 78,
    validUntil: new Date(2025, 5, 30),
    active: true
  },
  {
    id: 'coup-3',
    code: 'ANIVERSARIO25',
    type: 'percentage',
    value: 25,
    minOrderValue: 100,
    usageLimit: 1,
    usedCount: 37,
    validUntil: new Date(2025, 7, 15),
    active: false
  },
];

const CouponsPage = () => {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);
  
  // Filtra cupons pelo código
  const filteredCoupons = coupons.filter(coupon => 
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Alterna o status ativo/inativo do cupom
  const toggleCouponStatus = (id: string) => {
    setCoupons(coupons.map(coupon => 
      coupon.id === id ? { ...coupon, active: !coupon.active } : coupon
    ));
  };

  // Formata valor para moeda brasileira
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formata data para padrão brasileiro
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  // Verifica se o cupom expirou
  const isExpired = (date: Date) => {
    return new Date() > date;
  };

  // Renderiza cards de cupons para mobile
  const renderMobileCouponList = () => {
    return (
      <div className="space-y-4">
        {filteredCoupons.length > 0 ? (
          filteredCoupons.map((coupon) => (
            <Card key={coupon.id} className={isExpired(coupon.validUntil) ? "border-red-300" : coupon.active ? "border-green-300" : ""}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">{coupon.code}</h3>
                  <Badge variant={isExpired(coupon.validUntil) ? "destructive" : "outline"}>
                    {isExpired(coupon.validUntil) ? "Expirado" : "Válido"}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                  <span className="flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    {coupon.type === 'percentage' ? `${coupon.value}%` : formatCurrency(coupon.value)}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(coupon.validUntil)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Pedido Mínimo</p>
                    <p>
                      {coupon.minOrderValue ? 
                        formatCurrency(coupon.minOrderValue) :
                        'Sem mínimo'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Uso</p>
                    <p>{coupon.usedCount} usos</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-3 border-t">
                  <span className="text-sm font-medium">Ativo</span>
                  <Switch 
                    checked={coupon.active} 
                    onCheckedChange={() => toggleCouponStatus(coupon.id)}
                    disabled={isExpired(coupon.validUntil)}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-gray-500">Nenhum cupom encontrado</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Renderiza tabela para desktop
  const renderDesktopCouponTable = () => {
    return (
      <Card>
        <CardContent className="pt-6">
          <ScrollArea className="w-full">
            <Table>
              <TableCaption>Lista de cupons de desconto disponíveis</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Pedido Mínimo</TableHead>
                  <TableHead>Limite de Uso</TableHead>
                  <TableHead>Uso Atual</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ativo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.length > 0 ? (
                  filteredCoupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-medium">{coupon.code}</TableCell>
                      <TableCell>
                        {coupon.type === 'percentage' ? 
                          `${coupon.value}%` : 
                          formatCurrency(coupon.value)
                        }
                      </TableCell>
                      <TableCell>
                        {coupon.minOrderValue ? 
                          formatCurrency(coupon.minOrderValue) :
                          'Sem mínimo'
                        }
                      </TableCell>
                      <TableCell>
                        {coupon.usageLimit ? 
                          `${coupon.usageLimit} por cliente` :
                          'Ilimitado'
                        }
                      </TableCell>
                      <TableCell>{coupon.usedCount} usos</TableCell>
                      <TableCell>{formatDate(coupon.validUntil)}</TableCell>
                      <TableCell>
                        <Badge variant={isExpired(coupon.validUntil) ? "destructive" : "outline"}>
                          {isExpired(coupon.validUntil) ? "Expirado" : "Válido"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch 
                          checked={coupon.active} 
                          onCheckedChange={() => toggleCouponStatus(coupon.id)}
                          disabled={isExpired(coupon.validUntil)} 
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      Nenhum cupom encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout title="Cupons de Desconto">
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Gerenciar Cupons</CardTitle>
          <CardDescription>
            Crie e gerencie cupons de desconto para seus clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="w-full md:w-1/2 relative">
              <Input
                placeholder="Buscar cupons por código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            </div>
            <Button className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Criar Novo Cupom
            </Button>
          </div>
        </CardContent>
      </Card>

      {isMobile ? renderMobileCouponList() : renderDesktopCouponTable()}
    </DashboardLayout>
  );
};

export default CouponsPage;

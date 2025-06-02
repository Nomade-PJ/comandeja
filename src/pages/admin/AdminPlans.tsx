import React, { useState } from 'react';
import AdminDashboardLayout from '@/components/AdminDashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  CheckCircle, 
  XCircle, 
  Edit, 
  MoreHorizontal, 
  Plus, 
  Trash
} from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// In a real implementation, this would be fetched from PostgreSQL
const plans = [
  {
    id: '1',
    name: 'Starter',
    description: 'Para restaurantes que estão começando',
    isActive: true,
    price: 99.90,
    pricePeriod: 'mensal',
    features: [
      { name: 'Cardápio Digital', included: true },
      { name: 'Limite de 50 produtos', included: true },
      { name: 'QR Code para Pedidos', included: true },
      { name: 'Gestão de Pedidos Básica', included: true },
      { name: 'Apenas 1 usuário', included: true },
      { name: 'Integrações com Delivery', included: false },
      { name: 'Relatórios Avançados', included: false },
      { name: 'Gestão de Mesas', included: false },
      { name: 'Suporte Prioritário', included: false },
      { name: 'Personalização de Marca', included: false }
    ],
    clientsCount: 45
  },
  {
    id: '2',
    name: 'Pro',
    description: 'Para restaurantes em expansão',
    isActive: true,
    price: 199.90,
    pricePeriod: 'mensal',
    features: [
      { name: 'Cardápio Digital', included: true },
      { name: 'Produtos ilimitados', included: true },
      { name: 'QR Code para Pedidos', included: true },
      { name: 'Gestão de Pedidos Completa', included: true },
      { name: 'Até 5 usuários', included: true },
      { name: 'Integrações com Delivery', included: true },
      { name: 'Relatórios Avançados', included: true },
      { name: 'Gestão de Mesas', included: false },
      { name: 'Suporte Prioritário', included: false },
      { name: 'Personalização de Marca', included: false }
    ],
    clientsCount: 87
  },
  {
    id: '3',
    name: 'Premium',
    description: 'Para restaurantes consolidados',
    isActive: true,
    price: 299.90,
    pricePeriod: 'mensal',
    features: [
      { name: 'Cardápio Digital', included: true },
      { name: 'Produtos ilimitados', included: true },
      { name: 'QR Code para Pedidos', included: true },
      { name: 'Gestão de Pedidos Completa', included: true },
      { name: 'Usuários ilimitados', included: true },
      { name: 'Integrações com Delivery', included: true },
      { name: 'Relatórios Avançados', included: true },
      { name: 'Gestão de Mesas', included: true },
      { name: 'Suporte Prioritário', included: true },
      { name: 'Personalização de Marca', included: true }
    ],
    clientsCount: 36
  },
  {
    id: '4',
    name: 'Enterprise',
    description: 'Para redes de restaurantes',
    isActive: false,
    price: 599.90,
    pricePeriod: 'mensal',
    features: [
      { name: 'Cardápio Digital', included: true },
      { name: 'Produtos ilimitados', included: true },
      { name: 'QR Code para Pedidos', included: true },
      { name: 'Gestão de Pedidos Completa', included: true },
      { name: 'Usuários ilimitados', included: true },
      { name: 'Integrações com Delivery', included: true },
      { name: 'Relatórios Avançados', included: true },
      { name: 'Gestão de Mesas', included: true },
      { name: 'Suporte Prioritário', included: true },
      { name: 'Personalização de Marca', included: true },
      { name: 'API exclusiva', included: true },
      { name: 'Múltiplas unidades', included: true }
    ],
    clientsCount: 5
  }
];

const PlanCard = ({ plan }: { plan: typeof plans[0] }) => {
  const [isActive, setIsActive] = useState(plan.isActive);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-row justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              {plan.name}
              {!isActive && (
                <Badge variant="outline" className="ml-2">
                  Inativo
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Trash className="mr-2 h-4 w-4" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
          <div className="mb-2 sm:mb-0">
            <span className="text-3xl font-bold">
              R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-muted-foreground">/{plan.pricePeriod}</span>
          </div>
          <div className="flex items-center gap-2">
            <Switch 
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <span>{isActive ? 'Ativo' : 'Inativo'}</span>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Clientes usando este plano:</span>
            <span className="font-bold">{plan.clientsCount}</span>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-2">
          <h4 className="font-semibold mb-2">Recursos incluídos:</h4>
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              {feature.included ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-gray-300" />
              )}
              <span className={feature.included ? '' : 'text-gray-400'}>
                {feature.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Ver clientes neste plano
        </Button>
      </CardFooter>
    </Card>
  );
};

const AdminPlans = () => {
  return (
    <AdminDashboardLayout title="Gerenciamento de Planos">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Planos de Assinatura</h1>
          <p className="text-muted-foreground">
            Gerencie os planos disponíveis para os restaurantes
          </p>
        </div>
        <Button className="flex items-center gap-1">
          <Plus className="h-4 w-4" /> Novo Plano
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="md:col-span-3">
            <PlanCard plan={plan} />
          </div>
        ))}
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminPlans;

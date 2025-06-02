import React, { useState } from 'react';
import AdminDashboardLayout from '@/components/AdminDashboardLayout';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
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
  MoreHorizontal, 
  Search,
  ArrowUpDown,
  MessageCircle,
  Clock,
  Users
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

// In a real implementation, this would be fetched from PostgreSQL
const tickets = [
  {
    id: 'T001',
    subject: 'Problema com integração de pagamento',
    status: 'open',
    priority: 'high',
    client: {
      name: 'Pizzaria Napolitana',
      avatar: null
    },
    assignedTo: {
      name: 'Suporte Técnico',
      avatar: null
    },
    createdAt: '2025-05-10T14:23:00',
    updatedAt: '2025-05-10T15:45:00',
    messages: 3
  },
  {
    id: 'T002',
    subject: 'Dúvida sobre relatórios de vendas',
    status: 'inProgress',
    priority: 'medium',
    client: {
      name: 'Café Expresso',
      avatar: null
    },
    assignedTo: {
      name: 'Ana Silva',
      avatar: null
    },
    createdAt: '2025-05-09T09:15:00',
    updatedAt: '2025-05-11T11:30:00',
    messages: 5
  },
  {
    id: 'T003',
    subject: 'Solicitação de nova funcionalidade',
    status: 'closed',
    priority: 'low',
    client: {
      name: 'Hamburgueria Top',
      avatar: null
    },
    assignedTo: {
      name: 'Carlos Mendes',
      avatar: null
    },
    createdAt: '2025-05-05T16:45:00',
    updatedAt: '2025-05-08T10:20:00',
    messages: 7
  },
  {
    id: 'T004',
    subject: 'Erro ao gerar QR Code para mesa',
    status: 'open',
    priority: 'high',
    client: {
      name: 'Restaurante Sabor Brasileiro',
      avatar: null
    },
    assignedTo: {
      name: 'Departamento Técnico',
      avatar: null
    },
    createdAt: '2025-05-11T08:30:00',
    updatedAt: '2025-05-11T08:30:00',
    messages: 1
  },
  {
    id: 'T005',
    subject: 'Renovação de plano com desconto',
    status: 'inProgress',
    priority: 'medium',
    client: {
      name: 'Sushiteria Oriental',
      avatar: null
    },
    assignedTo: {
      name: 'Departamento Comercial',
      avatar: null
    },
    createdAt: '2025-05-07T11:20:00',
    updatedAt: '2025-05-10T09:15:00',
    messages: 4
  },
  {
    id: 'T006',
    subject: 'Problema com envio de notificações',
    status: 'closed',
    priority: 'medium',
    client: {
      name: 'Doceria Doce Sabor',
      avatar: null
    },
    assignedTo: {
      name: 'Suporte Técnico',
      avatar: null
    },
    createdAt: '2025-05-03T14:50:00',
    updatedAt: '2025-05-07T16:30:00',
    messages: 6
  }
];

const PriorityBadge = ({ priority }: { priority: string }) => {
  let variant: "default" | "destructive" | "outline" | "secondary" = "default";
  let label = priority;
  
  switch (priority) {
    case 'high':
      variant = "destructive";
      label = "Alta";
      break;
    case 'medium':
      variant = "default";
      label = "Média";
      break;
    case 'low':
      variant = "secondary";
      label = "Baixa";
      break;
    default:
      variant = "outline";
  }
  
  return <Badge variant={variant}>{label}</Badge>;
};

const StatusBadge = ({ status }: { status: string }) => {
  let variant: "default" | "destructive" | "outline" | "secondary" = "default";
  let label = status;
  
  switch (status) {
    case 'open':
      variant = "secondary";
      label = "Aberto";
      break;
    case 'inProgress':
      variant = "default";
      label = "Em Andamento";
      break;
    case 'closed':
      variant = "outline";
      label = "Fechado";
      break;
    default:
      variant = "outline";
  }
  
  return <Badge variant={variant}>{label}</Badge>;
};

const AdminSupport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'open' && ticket.status === 'open') ||
      (activeTab === 'inProgress' && ticket.status === 'inProgress') ||
      (activeTab === 'closed' && ticket.status === 'closed');
    
    return matchesSearch && matchesTab;
  });

  return (
    <AdminDashboardLayout title="Gestão de Suporte">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <Card className="md:col-span-3">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Chamados</p>
              <h3 className="text-2xl font-bold mt-1">24</h3>
            </div>
            <MessageCircle className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card className="md:col-span-3">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Chamados Abertos</p>
              <h3 className="text-2xl font-bold mt-1">8</h3>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
        <Card className="md:col-span-3">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Em Andamento</p>
              <h3 className="text-2xl font-bold mt-1">10</h3>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </CardContent>
        </Card>
        <Card className="md:col-span-3">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tempo Médio</p>
              <h3 className="text-2xl font-bold mt-1">1.5 dias</h3>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Chamados de Suporte</CardTitle>
          <CardDescription>
            Gerencie todos os chamados de suporte dos clientes
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-4 w-full md:w-[400px]">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="open">Abertos</TabsTrigger>
              <TabsTrigger value="inProgress">Em Andamento</TabsTrigger>
              <TabsTrigger value="closed">Fechados</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center mb-4 relative">
            <Search className="absolute left-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por assunto, cliente ou número..."
              className="pl-9 w-full md:w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead className="w-[350px]">
                    <div className="flex items-center gap-1 cursor-pointer">
                      Assunto <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1 cursor-pointer">
                      Atualizado <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono">{ticket.id}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>{ticket.subject}</span>
                          <Badge variant="outline" className="ml-1">{ticket.messages}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>{ticket.client.name[0]}</AvatarFallback>
                          </Avatar>
                          <span>{ticket.client.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={ticket.status} />
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={ticket.priority} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>{ticket.assignedTo.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{ticket.assignedTo.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(ticket.updatedAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                            <DropdownMenuItem>Responder</DropdownMenuItem>
                            <DropdownMenuItem>Atribuir</DropdownMenuItem>
                            <DropdownMenuItem>Alterar status</DropdownMenuItem>
                            <DropdownMenuItem>Fechar chamado</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                      Nenhum chamado encontrado com os filtros selecionados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminDashboardLayout>
  );
};

export default AdminSupport;

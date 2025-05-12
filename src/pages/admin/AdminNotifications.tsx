
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Mail, 
  MessageSquare, 
  Bell,
  CheckCircle,
  Clock,
  Search,
  CalendarIcon, 
  Plus
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// In a real implementation, this would be fetched from PostgreSQL
const notifications = [
  {
    id: '001',
    title: 'Atualização de sistema - Nova versão 2.5',
    type: 'system',
    status: 'scheduled',
    channels: ['email', 'app'],
    audience: 'all',
    scheduledFor: '2025-05-20T10:00:00',
    createdAt: '2025-05-10T14:23:00',
  },
  {
    id: '002',
    title: 'Promoção: 20% de desconto para plano anual',
    type: 'marketing',
    status: 'sent',
    channels: ['email', 'app', 'whatsapp'],
    audience: 'starter',
    scheduledFor: '2025-05-05T09:00:00',
    sentAt: '2025-05-05T09:00:00',
    createdAt: '2025-04-28T11:30:00',
    metrics: {
      sent: 45,
      opened: 32,
      clicked: 18
    }
  },
  {
    id: '003',
    title: 'Novos recursos disponíveis no plano Pro',
    type: 'feature',
    status: 'sent',
    channels: ['email', 'app'],
    audience: 'pro',
    scheduledFor: '2025-04-15T14:00:00',
    sentAt: '2025-04-15T14:00:00',
    createdAt: '2025-04-10T13:45:00',
    metrics: {
      sent: 87,
      opened: 68,
      clicked: 45
    }
  },
  {
    id: '004',
    title: 'Lembrete: Renovação de assinatura próxima',
    type: 'billing',
    status: 'draft',
    channels: ['email', 'whatsapp'],
    audience: 'expiring',
    createdAt: '2025-05-11T15:30:00',
  },
  {
    id: '005',
    title: 'Nova política de privacidade',
    type: 'legal',
    status: 'sent',
    channels: ['email'],
    audience: 'all',
    scheduledFor: '2025-03-01T08:00:00',
    sentAt: '2025-03-01T08:00:00',
    createdAt: '2025-02-20T09:45:00',
    metrics: {
      sent: 173,
      opened: 121,
      clicked: 54
    }
  }
];

const TypeBadge = ({ type }: { type: string }) => {
  let variant: "default" | "destructive" | "outline" | "secondary" = "default";
  let label = type;
  
  switch (type) {
    case 'system':
      variant = "secondary";
      label = "Sistema";
      break;
    case 'marketing':
      variant = "default";
      label = "Marketing";
      break;
    case 'feature':
      variant = "outline";
      label = "Recurso";
      break;
    case 'billing':
      variant = "destructive";
      label = "Cobrança";
      break;
    case 'legal':
      variant = "secondary";
      label = "Legal";
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
    case 'draft':
      variant = "outline";
      label = "Rascunho";
      break;
    case 'scheduled':
      variant = "secondary";
      label = "Agendado";
      break;
    case 'sent':
      variant = "default";
      label = "Enviado";
      break;
    case 'cancelled':
      variant = "destructive";
      label = "Cancelado";
      break;
    default:
      variant = "outline";
  }
  
  return <Badge variant={variant}>{label}</Badge>;
};

const ChannelBadge = ({ channel }: { channel: string }) => {
  let icon;
  
  switch (channel) {
    case 'email':
      icon = <Mail className="h-3 w-3" />;
      break;
    case 'app':
      icon = <Bell className="h-3 w-3" />;
      break;
    case 'whatsapp':
      icon = <MessageSquare className="h-3 w-3" />;
      break;
    default:
      icon = <Bell className="h-3 w-3" />;
  }
  
  return (
    <Badge variant="outline" className="flex items-center gap-1">
      {icon} {channel}
    </Badge>
  );
};

const AdminNotifications = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [date, setDate] = useState<Date | undefined>(new Date());

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'draft' && notification.status === 'draft') ||
      (activeTab === 'scheduled' && notification.status === 'scheduled') ||
      (activeTab === 'sent' && notification.status === 'sent');
    
    return matchesSearch && matchesTab;
  });

  return (
    <AdminDashboardLayout title="Gerenciamento de Notificações">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left side - Notifications List */}
        <div className="w-full md:w-3/5">
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Notificações</CardTitle>
                  <CardDescription>
                    Gerencie comunicações com clientes da plataforma
                  </CardDescription>
                </div>
                <Button className="flex items-center gap-1 w-full md:w-auto">
                  <Plus className="h-4 w-4" /> Nova Notificação
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="draft">Rascunhos</TabsTrigger>
                  <TabsTrigger value="scheduled">Agendadas</TabsTrigger>
                  <TabsTrigger value="sent">Enviadas</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex items-center mb-4 relative">
                <Search className="absolute left-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar por título ou conteúdo..."
                  className="pl-9 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Título</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Canais</TableHead>
                      <TableHead>Público</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotifications.length > 0 ? (
                      filteredNotifications.map((notification) => (
                        <TableRow 
                          key={notification.id} 
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          <TableCell className="font-medium">
                            {notification.title}
                          </TableCell>
                          <TableCell>
                            <TypeBadge type={notification.type} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={notification.status} />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {notification.channels.map((channel, idx) => (
                                <ChannelBadge key={idx} channel={channel} />
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>{notification.audience}</TableCell>
                          <TableCell>
                            {notification.status === 'sent' && notification.sentAt && (
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                {new Date(notification.sentAt).toLocaleDateString('pt-BR')}
                              </div>
                            )}
                            {notification.status === 'scheduled' && notification.scheduledFor && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-blue-500" />
                                {new Date(notification.scheduledFor).toLocaleDateString('pt-BR')}
                              </div>
                            )}
                            {notification.status === 'draft' && (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          Nenhuma notificação encontrada com os filtros selecionados.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right side - New Notification Form */}
        <div className="w-full md:w-2/5">
          <Card>
            <CardHeader>
              <CardTitle>Nova Notificação</CardTitle>
              <CardDescription>
                Crie e agende uma nova comunicação para clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" placeholder="Título da notificação" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">Conteúdo</Label>
                  <Textarea id="content" placeholder="Escreva o conteúdo da mensagem..." className="min-h-[120px]" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">Sistema</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="feature">Novo Recurso</SelectItem>
                        <SelectItem value="billing">Cobrança</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="audience">Público</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o público" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os clientes</SelectItem>
                        <SelectItem value="starter">Plano Starter</SelectItem>
                        <SelectItem value="pro">Plano Pro</SelectItem>
                        <SelectItem value="premium">Plano Premium</SelectItem>
                        <SelectItem value="expiring">Assinaturas a vencer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Canais de Envio</Label>
                  <div className="flex flex-col gap-4 pt-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>E-mail</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-4 w-4" />
                        <span>Notificação no App</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>WhatsApp</span>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Agendamento</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, 'PPP', { locale: ptBR }) : <span>Selecionar data</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="w-[120px]">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Horário" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="08:00">08:00</SelectItem>
                          <SelectItem value="09:00">09:00</SelectItem>
                          <SelectItem value="10:00">10:00</SelectItem>
                          <SelectItem value="11:00">11:00</SelectItem>
                          <SelectItem value="12:00">12:00</SelectItem>
                          <SelectItem value="13:00">13:00</SelectItem>
                          <SelectItem value="14:00">14:00</SelectItem>
                          <SelectItem value="15:00">15:00</SelectItem>
                          <SelectItem value="16:00">16:00</SelectItem>
                          <SelectItem value="17:00">17:00</SelectItem>
                          <SelectItem value="18:00">18:00</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2 justify-between">
              <Button variant="outline" className="w-full sm:w-auto">Salvar Rascunho</Button>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="secondary" className="flex-1">Agendar</Button>
                <Button className="flex-1">Enviar Agora</Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminNotifications;

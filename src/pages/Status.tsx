import { useState, useEffect } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Bell,
  Server,
  Database,
  Globe,
  ShoppingCart,
  CreditCard,
  MessageSquare,
  Mail
} from "lucide-react";
import { Link } from "react-router-dom";

// Tipos para o status dos serviços
type ServiceStatus = "operational" | "degraded" | "outage" | "maintenance";

interface ServiceIncident {
  date: string;
  title: string;
  status: "resolved" | "investigating" | "identified" | "monitoring";
  updates: {
    time: string;
    message: string;
  }[];
}

interface ServiceInfo {
  name: string;
  description: string;
  status: ServiceStatus;
  icon: React.ReactNode;
  uptime: string;
}

const Status = () => {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const refreshStatus = () => {
    setIsRefreshing(true);
    // Simular uma atualização de status
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 1000);
  };
  
  useEffect(() => {
    // Atualizar status a cada 60 segundos
    const interval = setInterval(() => {
      refreshStatus();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Dados simulados de serviços
  const services: ServiceInfo[] = [
    {
      name: "API",
      description: "Interface de programação de aplicações",
      status: "operational",
      icon: <Server className="w-5 h-5" />,
      uptime: "99.98%"
    },
    {
      name: "Banco de Dados",
      description: "Sistema de armazenamento de dados",
      status: "operational",
      icon: <Database className="w-5 h-5" />,
      uptime: "99.99%"
    },
    {
      name: "Website",
      description: "Site principal e dashboard",
      status: "operational",
      icon: <Globe className="w-5 h-5" />,
      uptime: "99.95%"
    },
    {
      name: "Sistema de Pedidos",
      description: "Processamento e gerenciamento de pedidos",
      status: "degraded",
      icon: <ShoppingCart className="w-5 h-5" />,
      uptime: "99.87%"
    },
    {
      name: "Pagamentos",
      description: "Processamento de transações financeiras",
      status: "operational",
      icon: <CreditCard className="w-5 h-5" />,
      uptime: "99.99%"
    },
    {
      name: "Notificações",
      description: "Sistema de alertas e notificações",
      status: "operational",
      icon: <Bell className="w-5 h-5" />,
      uptime: "99.93%"
    },
    {
      name: "Chat",
      description: "Sistema de comunicação em tempo real",
      status: "operational",
      icon: <MessageSquare className="w-5 h-5" />,
      uptime: "99.91%"
    },
    {
      name: "Email",
      description: "Sistema de envio de emails",
      status: "maintenance",
      icon: <Mail className="w-5 h-5" />,
      uptime: "99.85%"
    }
  ];
  
  // Dados simulados de incidentes
  const incidents: ServiceIncident[] = [
    {
      date: "15/07/2024",
      title: "Lentidão no sistema de pedidos",
      status: "resolved",
      updates: [
        {
          time: "15:45",
          message: "Problema resolvido. O sistema de pedidos está funcionando normalmente."
        },
        {
          time: "14:30",
          message: "Identificamos um gargalo no processamento de pedidos simultâneos. Nossa equipe está implementando uma solução."
        },
        {
          time: "14:00",
          message: "Estamos investigando relatos de lentidão no sistema de pedidos."
        }
      ]
    },
    {
      date: "12/07/2024",
      title: "Manutenção programada no sistema de email",
      status: "monitoring",
      updates: [
        {
          time: "10:30",
          message: "Manutenção concluída. Estamos monitorando o sistema para garantir estabilidade."
        },
        {
          time: "08:00",
          message: "Iniciamos a manutenção programada no sistema de email. O serviço ficará indisponível por aproximadamente 2 horas."
        }
      ]
    }
  ];
  
  // Função para obter a cor e texto do status
  const getStatusInfo = (status: ServiceStatus) => {
    switch (status) {
      case "operational":
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          text: "Operacional",
          bgColor: "bg-green-100",
          textColor: "text-green-800"
        };
      case "degraded":
        return {
          icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
          text: "Desempenho Reduzido",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800"
        };
      case "outage":
        return {
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          text: "Indisponível",
          bgColor: "bg-red-100",
          textColor: "text-red-800"
        };
      case "maintenance":
        return {
          icon: <Clock className="w-5 h-5 text-blue-500" />,
          text: "Em Manutenção",
          bgColor: "bg-blue-100",
          textColor: "text-blue-800"
        };
    }
  };
  
  // Função para obter informações do status do incidente
  const getIncidentStatusInfo = (status: ServiceIncident['status']) => {
    switch (status) {
      case "resolved":
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          text: "Resolvido",
          bgColor: "bg-green-100",
          textColor: "text-green-800"
        };
      case "investigating":
        return {
          icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
          text: "Investigando",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800"
        };
      case "identified":
        return {
          icon: <AlertCircle className="w-5 h-5 text-blue-500" />,
          text: "Identificado",
          bgColor: "bg-blue-100",
          textColor: "text-blue-800"
        };
      case "monitoring":
        return {
          icon: <Clock className="w-5 h-5 text-blue-500" />,
          text: "Monitorando",
          bgColor: "bg-blue-100",
          textColor: "text-blue-800"
        };
    }
  };
  
  // Calcular o status geral do sistema
  const calculateOverallStatus = () => {
    if (services.some(s => s.status === "outage")) {
      return "outage";
    } else if (services.some(s => s.status === "degraded")) {
      return "degraded";
    } else if (services.some(s => s.status === "maintenance")) {
      return "maintenance";
    } else {
      return "operational";
    }
  };
  
  const overallStatus = calculateOverallStatus();
  const overallStatusInfo = getStatusInfo(overallStatus);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30 px-3 py-1">
              Status
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Status Operacional
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Acompanhe em tempo real o status dos serviços do Comandejá.
            </p>
            
            {/* Overall Status */}
            <div className={`inline-flex items-center ${overallStatusInfo.bgColor} ${overallStatusInfo.textColor} px-4 py-3 rounded-lg`}>
              {overallStatusInfo.icon}
              <span className="ml-2 font-medium">
                {overallStatus === "operational" 
                  ? "Todos os sistemas estão operacionais" 
                  : overallStatus === "maintenance"
                  ? "Manutenção programada em andamento"
                  : overallStatus === "degraded"
                  ? "Alguns serviços estão com desempenho reduzido"
                  : "Alguns serviços estão indisponíveis"}
              </span>
            </div>
            
            {/* Last Updated */}
            <div className="mt-4 text-sm text-gray-500 flex items-center justify-center">
              <span>Última atualização: {lastUpdated.toLocaleTimeString()}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2" 
                onClick={refreshStatus}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Services Status */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Status dos Serviços</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const statusInfo = getStatusInfo(service.status);
              return (
                <Card key={index} className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          {service.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                          <CardDescription>{service.description}</CardDescription>
                        </div>
                      </div>
                      {statusInfo.icon}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <Badge className={`${statusInfo.bgColor} ${statusInfo.textColor} hover:${statusInfo.bgColor}`}>
                        {statusInfo.text}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Uptime: {service.uptime}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Incidents */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Incidentes Recentes</h2>
          
          <div className="max-w-3xl mx-auto space-y-8">
            {incidents.length > 0 ? (
              incidents.map((incident, index) => {
                const statusInfo = getIncidentStatusInfo(incident.status);
                return (
                  <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center mb-1">
                          <Badge className={`${statusInfo.bgColor} ${statusInfo.textColor} hover:${statusInfo.bgColor} mr-2`}>
                            {statusInfo.text}
                          </Badge>
                          <span className="text-sm text-gray-500">{incident.date}</span>
                        </div>
                        <h3 className="text-xl font-semibold">{incident.title}</h3>
                      </div>
                      {statusInfo.icon}
                    </div>
                    
                    <div className="border-l-2 border-gray-200 pl-4 ml-2 space-y-4">
                      {incident.updates.map((update, updateIndex) => (
                        <div key={updateIndex} className="relative">
                          <div className="absolute -left-[21px] top-1 w-3 h-3 bg-gray-200 rounded-full border-2 border-white"></div>
                          <p className="text-sm text-gray-500 mb-1">{update.time}</p>
                          <p className="text-gray-700">{update.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum incidente recente</h3>
                <p className="text-gray-600">
                  Todos os sistemas estão funcionando normalmente.
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center">
            <Link to="/historico-incidentes">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Ver histórico completo de incidentes
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Uptime History */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Histórico de Disponibilidade</h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-100 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Últimos 30 dias</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Operacional</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Degradado</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Indisponível</span>
                  </div>
                </div>
              </div>
              
              {/* Uptime Calendar - Simplified Version */}
              <div className="grid grid-cols-30 gap-1 h-12">
                {Array.from({ length: 30 }).map((_, index) => {
                  // Simular alguns dias com problemas
                  const status = 
                    index === 27 ? "bg-yellow-500" : 
                    index === 28 ? "bg-yellow-500" : 
                    index === 15 ? "bg-red-500" : 
                    "bg-green-500";
                  
                  return (
                    <div 
                      key={index} 
                      className={`${status} rounded-sm h-full`}
                      title={`Dia ${30 - index}: ${
                        status === "bg-green-500" ? "100% operacional" : 
                        status === "bg-yellow-500" ? "Desempenho reduzido" : 
                        "Incidente reportado"
                      }`}
                    ></div>
                  );
                })}
              </div>
              
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>30 dias atrás</span>
                <span>Hoje</span>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Uptime nos últimos 30 dias</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span>API</span>
                      <span className="text-sm font-medium">99.98%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "99.98%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span>Banco de Dados</span>
                      <span className="text-sm font-medium">99.99%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "99.99%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span>Sistema de Pedidos</span>
                      <span className="text-sm font-medium">99.87%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "99.87%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Tempo médio de resposta</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span>API</span>
                      <span className="text-sm font-medium">120ms</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "20%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span>Website</span>
                      <span className="text-sm font-medium">350ms</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "35%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span>Sistema de Pedidos</span>
                      <span className="text-sm font-medium">280ms</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "28%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Subscribe to Updates */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Receba atualizações de status</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Inscreva-se para receber notificações em tempo real sobre incidentes e manutenções programadas.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
              <Bell className="mr-2 w-5 h-5" />
              Inscrever-se
            </Button>
            <Link to="/central-ajuda">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Reportar um problema
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Status; 
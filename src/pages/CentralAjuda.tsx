import { useState } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  FileText, 
  Video, 
  MessageCircle, 
  Phone, 
  Mail, 
  ChevronRight,
  Lightbulb,
  ShoppingCart,
  Users,
  Settings,
  CreditCard,
  BarChart3,
  HelpCircle
} from "lucide-react";
import { Link } from "react-router-dom";

const CentralAjuda = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("faq");
  
  const faqCategories = [
    {
      icon: <ShoppingCart className="w-5 h-5" />,
      name: "Pedidos",
      questions: [
        {
          question: "Como alterar um pedido após confirmar?",
          answer: "Para alterar um pedido já confirmado, acesse a seção 'Pedidos' no dashboard, localize o pedido desejado e clique em 'Editar'. Você poderá modificar os itens desde que o pedido ainda não tenha entrado em preparo. Caso já esteja em preparo, entre em contato com o cliente para informar sobre possíveis limitações nas alterações."
        },
        {
          question: "Como cancelar um pedido?",
          answer: "Para cancelar um pedido, acesse a seção 'Pedidos', encontre o pedido que deseja cancelar e clique no botão 'Cancelar'. Você precisará informar o motivo do cancelamento, que será registrado no sistema. Lembre-se que pedidos já em entrega não podem ser cancelados pelo sistema."
        },
        {
          question: "Como definir tempo de entrega?",
          answer: "O tempo de entrega pode ser configurado nas configurações do restaurante. Acesse 'Configurações > Entrega' e defina o tempo médio de preparo e entrega. Você também pode ajustar este tempo manualmente para cada pedido na tela de detalhes do pedido."
        }
      ]
    },
    {
      icon: <Users className="w-5 h-5" />,
      name: "Clientes",
      questions: [
        {
          question: "Como gerenciar a base de clientes?",
          answer: "Para gerenciar sua base de clientes, acesse a seção 'Clientes' no dashboard. Lá você poderá visualizar todos os clientes cadastrados, pesquisar por nome ou email, ver histórico de pedidos e adicionar notas personalizadas para cada cliente."
        },
        {
          question: "Como criar um programa de fidelidade?",
          answer: "Para criar um programa de fidelidade, vá até 'Configurações > Fidelidade' e ative a opção. Você poderá definir regras como pontos por valor gasto, recompensas disponíveis e validade dos pontos. O sistema gerenciará automaticamente os pontos de cada cliente."
        },
        {
          question: "Como enviar promoções para clientes?",
          answer: "Para enviar promoções, acesse 'Marketing > Campanhas' e crie uma nova campanha. Você pode segmentar os clientes por frequência de compra, valor médio gasto ou itens preferidos. As promoções podem ser enviadas por email ou notificação no aplicativo."
        }
      ]
    },
    {
      icon: <Settings className="w-5 h-5" />,
      name: "Configurações",
      questions: [
        {
          question: "Como configurar horários de funcionamento?",
          answer: "Para configurar os horários de funcionamento, acesse 'Configurações > Horários'. Você pode definir horários diferentes para cada dia da semana, incluir intervalos (como pausa para almoço) e configurar feriados ou dias especiais em que o restaurante estará fechado."
        },
        {
          question: "Como adicionar usuários ao sistema?",
          answer: "Para adicionar novos usuários, vá até 'Configurações > Usuários' e clique em 'Adicionar Usuário'. Preencha os dados do novo usuário e defina seu nível de permissão (administrador, gerente, atendente, etc.). Cada usuário receberá um email para criar sua senha."
        },
        {
          question: "Como configurar métodos de pagamento?",
          answer: "Para configurar os métodos de pagamento aceitos, acesse 'Configurações > Pagamentos'. Você pode ativar ou desativar opções como cartão de crédito, débito, dinheiro, PIX e outros. Para pagamentos online, será necessário configurar as integrações com as operadoras."
        }
      ]
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      name: "Pagamentos",
      questions: [
        {
          question: "Como configurar integração com gateway de pagamento?",
          answer: "Para configurar a integração com gateway de pagamento, acesse 'Configurações > Pagamentos > Integrações'. Selecione o gateway desejado (Stripe, PayPal, Mercado Pago, etc.), insira suas credenciais de API e configure as opções de parcelamento e taxas conforme necessário."
        },
        {
          question: "Como emitir reembolsos?",
          answer: "Para emitir um reembolso, acesse o pedido específico na seção 'Pedidos', clique em 'Detalhes' e depois em 'Reembolsar'. Você poderá escolher entre reembolso total ou parcial. O sistema processará o reembolso através do mesmo método de pagamento utilizado na compra."
        },
        {
          question: "Como gerar relatórios financeiros?",
          answer: "Para gerar relatórios financeiros, acesse 'Relatórios > Financeiro'. Você pode filtrar por período, método de pagamento ou categoria de produto. Os relatórios podem ser visualizados online ou exportados em formatos CSV, PDF ou Excel para uso em seu sistema contábil."
        }
      ]
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      name: "Relatórios",
      questions: [
        {
          question: "Quais relatórios estão disponíveis?",
          answer: "O Comandejá oferece diversos relatórios, incluindo: Vendas (diárias, semanais, mensais), Produtos mais vendidos, Clientes mais frequentes, Horários de pico, Desempenho de entrega, Avaliações de clientes, Financeiro (receitas, taxas, impostos) e Comparativos de períodos."
        },
        {
          question: "Como exportar relatórios?",
          answer: "Para exportar relatórios, acesse a seção 'Relatórios', selecione o relatório desejado e os filtros necessários. Após gerar o relatório, clique no botão 'Exportar' no canto superior direito e escolha o formato desejado (PDF, Excel, CSV). O arquivo será baixado automaticamente."
        },
        {
          question: "Como configurar relatórios automáticos?",
          answer: "Para configurar relatórios automáticos, acesse 'Relatórios > Automação'. Selecione o tipo de relatório, frequência (diária, semanal, mensal), formato e destinatários. Os relatórios serão gerados e enviados automaticamente por email nos períodos definidos."
        }
      ]
    }
  ];
  
  const tutorials = [
    {
      title: "Primeiros passos com o Comandejá",
      description: "Aprenda o básico para começar a usar a plataforma",
      type: "video",
      duration: "5:32"
    },
    {
      title: "Configurando seu cardápio digital",
      description: "Como criar categorias, produtos e opções",
      type: "video",
      duration: "8:15"
    },
    {
      title: "Gerenciando pedidos eficientemente",
      description: "Fluxo completo desde o recebimento até a entrega",
      type: "video",
      duration: "7:45"
    },
    {
      title: "Configurações de pagamento",
      description: "Como configurar métodos de pagamento e integrações",
      type: "article",
      readTime: "4 min"
    },
    {
      title: "Relatórios e análises",
      description: "Como extrair insights dos seus dados de vendas",
      type: "article",
      readTime: "6 min"
    },
    {
      title: "Marketing e fidelização",
      description: "Estratégias para aumentar o retorno de clientes",
      type: "video",
      duration: "10:20"
    }
  ];
  
  const popularArticles = [
    "Como configurar promoções e descontos",
    "Integrando com aplicativos de delivery",
    "Gerenciando avaliações de clientes",
    "Configurando impressoras térmicas",
    "Personalizando recibos e notas fiscais",
    "Backup e restauração de dados"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30 px-3 py-1">
              Suporte
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Central de Ajuda
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Encontre respostas para suas dúvidas e aprenda a aproveitar ao máximo o Comandejá.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar na Central de Ajuda..."
                className="pl-10 py-6 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/90 text-white">
                Buscar
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="faq" className="w-full" onValueChange={setActiveTab}>
            <div className="flex justify-center mb-8">
              <TabsList className="grid grid-cols-3 w-full max-w-2xl">
                <TabsTrigger value="faq">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Perguntas Frequentes
                </TabsTrigger>
                <TabsTrigger value="tutorials">
                  <Video className="w-4 h-4 mr-2" />
                  Tutoriais
                </TabsTrigger>
                <TabsTrigger value="contact">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contato
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="faq" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {faqCategories.map((category, index) => (
                  <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center gap-2">
                      <div className="bg-primary/10 p-2 rounded-full">
                        {category.icon}
                      </div>
                      <CardTitle>{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {category.questions.map((q, qIndex) => (
                          <li key={qIndex}>
                            <button 
                              className="text-left w-full flex items-center justify-between text-primary hover:text-primary/80 transition-colors"
                              onClick={() => {
                                // Lógica para expandir/mostrar a resposta
                              }}
                            >
                              <span>{q.question}</span>
                              <ChevronRight className="w-4 h-4 flex-shrink-0" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-12 bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-2xl font-bold mb-6">Não encontrou o que procurava?</h3>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      <MessageCircle className="w-5 h-5 text-primary mr-2" />
                      <h4 className="font-semibold">Chat ao vivo</h4>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Converse em tempo real com nossa equipe de suporte. Disponível de segunda a sexta, das 8h às 18h.
                    </p>
                    <Button className="bg-primary hover:bg-primary/90 text-white">
                      Iniciar Chat
                    </Button>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      <Mail className="w-5 h-5 text-primary mr-2" />
                      <h4 className="font-semibold">Enviar ticket</h4>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Envie sua dúvida detalhada e nossa equipe responderá em até 24 horas úteis.
                    </p>
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                      Abrir Ticket
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="tutorials" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutorials.map((tutorial, index) => (
                  <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-center mb-2">
                        <Badge className={tutorial.type === "video" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}>
                          {tutorial.type === "video" ? (
                            <><Video className="w-3 h-3 mr-1" /> Vídeo</>
                          ) : (
                            <><FileText className="w-3 h-3 mr-1" /> Artigo</>
                          )}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {tutorial.type === "video" ? tutorial.duration : tutorial.readTime + " leitura"}
                        </span>
                      </div>
                      <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                      <CardDescription>{tutorial.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
                        {tutorial.type === "video" ? "Assistir" : "Ler"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-8">
                <h3 className="text-2xl font-bold mb-6">Artigos mais acessados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {popularArticles.map((article, index) => (
                    <a 
                      key={index}
                      href="#" 
                      className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <Lightbulb className="w-5 h-5 text-primary mr-3" />
                      <span>{article}</span>
                    </a>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="contact" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                      <MessageCircle className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-center">Chat ao vivo</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 mb-6">
                      Converse em tempo real com nossa equipe de suporte para resolver suas dúvidas rapidamente.
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Disponível de segunda a sexta<br />
                      8h às 18h
                    </p>
                    <Button className="bg-primary hover:bg-primary/90 text-white">
                      Iniciar Chat
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                      <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-center">Email</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 mb-6">
                      Envie sua dúvida detalhada e nossa equipe responderá em até 24 horas úteis.
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      suporte@comandeja.com.br<br />
                      Atendimento 24/7
                    </p>
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                      Enviar Email
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                      <Phone className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-center">Telefone</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 mb-6">
                      Para assuntos urgentes, entre em contato diretamente com nossa central de atendimento.
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      (11) 4000-0000<br />
                      Segunda a sexta, 9h às 17h
                    </p>
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                      Ligar Agora
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-12 bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-2xl font-bold mb-6">Envie sua mensagem</h3>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Nome completo
                      </label>
                      <Input id="name" placeholder="Seu nome" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <Input id="email" type="email" placeholder="seu@email.com" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                      Assunto
                    </label>
                    <Input id="subject" placeholder="Assunto da mensagem" />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                      Mensagem
                    </label>
                    <textarea 
                      id="message" 
                      rows={5} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Digite sua mensagem aqui..."
                    ></textarea>
                  </div>
                  
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    Enviar Mensagem
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ainda precisa de ajuda?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Nossa equipe de suporte está pronta para ajudar você a resolver qualquer problema ou dúvida.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
              <MessageCircle className="mr-2 w-5 h-5" />
              Falar com Suporte
            </Button>
            <Link to="/documentacao">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                <FileText className="mr-2 w-5 h-5" />
                Ver Documentação
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default CentralAjuda; 
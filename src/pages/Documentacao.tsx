import { useState } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  FileText, 
  Code, 
  BookOpen, 
  ChevronRight, 
  ExternalLink,
  Download,
  Copy,
  Check,
  Laptop,
  Smartphone,
  Server,
  Database,
  Settings
} from "lucide-react";
import { Link } from "react-router-dom";

const Documentacao = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const documentationCategories = [
    {
      title: "Guias de Início Rápido",
      icon: <Laptop className="w-6 h-6 text-primary" />,
      description: "Aprenda os conceitos básicos e comece a usar o Comandejá rapidamente.",
      links: [
        { title: "Primeiros passos", url: "#primeiros-passos" },
        { title: "Configuração inicial", url: "#configuracao-inicial" },
        { title: "Criando seu cardápio", url: "#criando-cardapio" },
        { title: "Recebendo pedidos", url: "#recebendo-pedidos" }
      ]
    },
    {
      title: "Guias do Administrador",
      icon: <Settings className="w-6 h-6 text-primary" />,
      description: "Configurações avançadas e gerenciamento do sistema.",
      links: [
        { title: "Gerenciamento de usuários", url: "#gerenciamento-usuarios" },
        { title: "Configurações de pagamento", url: "#configuracoes-pagamento" },
        { title: "Integrações com delivery", url: "#integracoes-delivery" },
        { title: "Backup e restauração", url: "#backup-restauracao" }
      ]
    },
    {
      title: "API e Desenvolvimento",
      icon: <Code className="w-6 h-6 text-primary" />,
      description: "Documentação técnica para desenvolvedores e integrações.",
      links: [
        { title: "Visão geral da API", url: "#api-visao-geral" },
        { title: "Autenticação", url: "#api-autenticacao" },
        { title: "Endpoints", url: "#api-endpoints" },
        { title: "Webhooks", url: "#api-webhooks" }
      ]
    },
    {
      title: "Aplicativo Mobile",
      icon: <Smartphone className="w-6 h-6 text-primary" />,
      description: "Tudo sobre o aplicativo móvel para clientes e gerentes.",
      links: [
        { title: "Instalação e configuração", url: "#app-instalacao" },
        { title: "Funcionalidades", url: "#app-funcionalidades" },
        { title: "Notificações push", url: "#app-notificacoes" },
        { title: "Resolução de problemas", url: "#app-problemas" }
      ]
    },
    {
      title: "Infraestrutura",
      icon: <Server className="w-6 h-6 text-primary" />,
      description: "Informações sobre a infraestrutura e requisitos técnicos.",
      links: [
        { title: "Requisitos de sistema", url: "#requisitos-sistema" },
        { title: "Segurança e privacidade", url: "#seguranca-privacidade" },
        { title: "Escalabilidade", url: "#escalabilidade" },
        { title: "Monitoramento", url: "#monitoramento" }
      ]
    },
    {
      title: "Banco de Dados",
      icon: <Database className="w-6 h-6 text-primary" />,
      description: "Estrutura de dados e gerenciamento de informações.",
      links: [
        { title: "Modelo de dados", url: "#modelo-dados" },
        { title: "Migrações", url: "#migracoes" },
        { title: "Backup e recuperação", url: "#backup-recuperacao" },
        { title: "Otimização de performance", url: "#otimizacao-performance" }
      ]
    }
  ];
  
  const recentUpdates = [
    {
      date: "15/07/2024",
      title: "Atualização da API v2.3",
      description: "Novos endpoints para gerenciamento de promoções e cupons."
    },
    {
      date: "02/07/2024",
      title: "Guia de integração com iFood",
      description: "Tutorial completo para conectar o Comandejá com o iFood."
    },
    {
      date: "25/06/2024",
      title: "Documentação de webhooks",
      description: "Nova seção sobre como configurar e usar webhooks."
    }
  ];
  
  const codeExample = `// Exemplo de requisição para listar pedidos
const API_KEY = 'seu_api_key_aqui';

async function getOrders() {
  const response = await fetch('https://api.comandeja.com.br/v1/orders', {
    method: 'GET',
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json',
    },
  });
  
  const data = await response.json();
  return data.orders;
}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30 px-3 py-1">
              Documentação
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Documentação Técnica
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Guias detalhados, referências de API e recursos para aproveitar ao máximo o Comandejá.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar na documentação..."
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
      
      {/* Documentation Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Categorias de Documentação</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {documentationCategories.map((category, index) => (
              <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-primary/10 p-3 rounded-full">
                      {category.icon}
                    </div>
                    <CardTitle>{category.title}</CardTitle>
                  </div>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <a 
                          href={link.url} 
                          className="text-primary hover:text-primary/80 flex items-center"
                        >
                          <ChevronRight className="w-4 h-4 mr-1" />
                          <span>{link.title}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Recent Updates */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold mb-8">Atualizações Recentes</h2>
              
              <div className="space-y-6">
                {recentUpdates.map((update, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        {update.date}
                      </Badge>
                      <a href="#" className="text-primary hover:text-primary/80 text-sm flex items-center">
                        <span>Ver detalhes</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{update.title}</h3>
                    <p className="text-gray-600">{update.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  Ver todas as atualizações
                </Button>
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold mb-8">Exemplo de Código</h2>
              
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
                  <span className="text-gray-400 text-sm">JavaScript</span>
                  <button 
                    className="text-gray-400 hover:text-white flex items-center text-sm"
                    onClick={() => handleCopy(codeExample)}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-gray-100 overflow-x-auto">
                  <code>{codeExample}</code>
                </pre>
              </div>
              
              <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold mb-4">Recursos para Desenvolvedores</h3>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="flex items-center text-primary hover:text-primary/80">
                      <Download className="w-5 h-5 mr-2" />
                      <span>SDK JavaScript (v2.3.0)</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-center text-primary hover:text-primary/80">
                      <Download className="w-5 h-5 mr-2" />
                      <span>SDK PHP (v2.1.5)</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-center text-primary hover:text-primary/80">
                      <Download className="w-5 h-5 mr-2" />
                      <span>Postman Collection</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-center text-primary hover:text-primary/80">
                      <ExternalLink className="w-5 h-5 mr-2" />
                      <span>GitHub Repository</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Documentation Navigation */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Navegue pela Documentação</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <a href="#" className="flex flex-col items-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20 hover:shadow-md transition-shadow">
              <BookOpen className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-center">Guias do Usuário</h3>
              <p className="text-gray-600 text-center">
                Tutoriais passo a passo para todas as funcionalidades do sistema.
              </p>
            </a>
            
            <a href="#" className="flex flex-col items-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20 hover:shadow-md transition-shadow">
              <Code className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-center">Referência da API</h3>
              <p className="text-gray-600 text-center">
                Documentação completa de endpoints, parâmetros e respostas.
              </p>
            </a>
            
            <a href="#" className="flex flex-col items-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20 hover:shadow-md transition-shadow">
              <FileText className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-center">Artigos Técnicos</h3>
              <p className="text-gray-600 text-center">
                Aprofunde-se em tópicos específicos e melhores práticas.
              </p>
            </a>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Perguntas Frequentes</h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold mb-2">Preciso de conhecimentos técnicos para usar o Comandejá?</h3>
              <p className="text-gray-600">
                Não, o Comandejá foi projetado para ser intuitivo e fácil de usar. A interface administrativa 
                não requer conhecimentos técnicos especiais. No entanto, para integrações avançadas ou 
                personalização via API, conhecimentos básicos de programação podem ser necessários.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold mb-2">Como faço para integrar o Comandejá com meu sistema atual?</h3>
              <p className="text-gray-600">
                O Comandejá oferece uma API RESTful completa que permite integração com diversos sistemas. 
                Na seção de API da documentação, você encontrará guias detalhados para integração com sistemas 
                de contabilidade, ERP, CRM e outros. Também oferecemos integrações prontas com os principais 
                sistemas do mercado.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold mb-2">É possível personalizar o sistema para minhas necessidades?</h3>
              <p className="text-gray-600">
                Sim, o Comandejá oferece diversas opções de personalização através da interface administrativa. 
                Para personalizações mais avançadas, você pode utilizar nossa API ou entrar em contato com nossa 
                equipe de consultoria para desenvolvimento de funcionalidades específicas para o seu negócio.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold mb-2">Como funciona o suporte técnico?</h3>
              <p className="text-gray-600">
                Oferecemos suporte técnico por chat, email e telefone, dependendo do seu plano. Todos os clientes 
                têm acesso à nossa base de conhecimento e fórum da comunidade. Para problemas técnicos complexos, 
                nossa equipe de suporte especializado está disponível para ajudar na resolução.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Não encontrou o que procurava?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Nossa equipe de suporte técnico está pronta para ajudar com qualquer dúvida ou problema.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/central-ajuda">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                Falar com Suporte Técnico
              </Button>
            </Link>
            <Link to="/contato">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Solicitar Documentação Específica
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Documentacao; 
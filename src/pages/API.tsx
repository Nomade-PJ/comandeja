import { useState } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Code, 
  Database, 
  Lock, 
  Zap, 
  FileJson, 
  BookOpen, 
  Server,
  BarChart3,
  ShoppingCart,
  Users,
  Clock,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

const API = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Exemplo de código para a documentação
  const codeExamples = {
    authentication: `// Exemplo de autenticação com a API do ComandeJá
const API_KEY = 'seu_api_key_aqui';

// Função para obter token de acesso
async function getAccessToken() {
  const response = await fetch('https://api.comandeja.com.br/v1/auth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: API_KEY,
    }),
  });
  
  const data = await response.json();
  return data.access_token;
}`,
    orders: `// Exemplo de listagem de pedidos
async function getOrders() {
  const token = await getAccessToken();
  
  const response = await fetch('https://api.comandeja.com.br/v1/orders', {
    method: 'GET',
    headers: {
      'Authorization': \`Bearer \${token}\`,
      'Content-Type': 'application/json',
    },
  });
  
  const data = await response.json();
  return data.orders;
}`,
    products: `// Exemplo de criação de produto
async function createProduct(product) {
  const token = await getAccessToken();
  
  const response = await fetch('https://api.comandeja.com.br/v1/products', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${token}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  });
  
  const data = await response.json();
  return data.product;
}`
  };
  
  const apiFeatures = [
    {
      icon: <Code className="w-10 h-10 text-primary" />,
      title: "RESTful API",
      description: "API completa seguindo os princípios REST para integração simples e eficiente."
    },
    {
      icon: <Database className="w-10 h-10 text-primary" />,
      title: "Dados em Tempo Real",
      description: "Acesso a dados atualizados em tempo real para pedidos, produtos e clientes."
    },
    {
      icon: <Lock className="w-10 h-10 text-primary" />,
      title: "Autenticação Segura",
      description: "Autenticação OAuth 2.0 e JWT para garantir a segurança das suas integrações."
    },
    {
      icon: <Zap className="w-10 h-10 text-primary" />,
      title: "Alta Performance",
      description: "Endpoints otimizados para respostas rápidas, mesmo em momentos de alto tráfego."
    },
    {
      icon: <FileJson className="w-10 h-10 text-primary" />,
      title: "Respostas em JSON",
      description: "Dados formatados em JSON para fácil manipulação em qualquer linguagem."
    },
    {
      icon: <BookOpen className="w-10 h-10 text-primary" />,
      title: "Documentação Completa",
      description: "Documentação detalhada com exemplos de código e guias de integração."
    }
  ];
  
  const endpoints = [
    {
      category: "Autenticação",
      routes: [
        { method: "POST", path: "/auth/token", description: "Gerar token de acesso" },
        { method: "POST", path: "/auth/refresh", description: "Renovar token de acesso" },
        { method: "POST", path: "/auth/revoke", description: "Revogar token de acesso" }
      ]
    },
    {
      category: "Pedidos",
      routes: [
        { method: "GET", path: "/orders", description: "Listar todos os pedidos" },
        { method: "GET", path: "/orders/:id", description: "Obter detalhes de um pedido" },
        { method: "POST", path: "/orders", description: "Criar novo pedido" },
        { method: "PUT", path: "/orders/:id", description: "Atualizar pedido existente" },
        { method: "PATCH", path: "/orders/:id/status", description: "Atualizar status do pedido" }
      ]
    },
    {
      category: "Produtos",
      routes: [
        { method: "GET", path: "/products", description: "Listar todos os produtos" },
        { method: "GET", path: "/products/:id", description: "Obter detalhes de um produto" },
        { method: "POST", path: "/products", description: "Criar novo produto" },
        { method: "PUT", path: "/products/:id", description: "Atualizar produto existente" },
        { method: "DELETE", path: "/products/:id", description: "Excluir produto" }
      ]
    },
    {
      category: "Categorias",
      routes: [
        { method: "GET", path: "/categories", description: "Listar todas as categorias" },
        { method: "GET", path: "/categories/:id", description: "Obter detalhes de uma categoria" },
        { method: "POST", path: "/categories", description: "Criar nova categoria" },
        { method: "PUT", path: "/categories/:id", description: "Atualizar categoria existente" },
        { method: "DELETE", path: "/categories/:id", description: "Excluir categoria" }
      ]
    },
    {
      category: "Clientes",
      routes: [
        { method: "GET", path: "/customers", description: "Listar todos os clientes" },
        { method: "GET", path: "/customers/:id", description: "Obter detalhes de um cliente" },
        { method: "POST", path: "/customers", description: "Criar novo cliente" },
        { method: "PUT", path: "/customers/:id", description: "Atualizar cliente existente" },
        { method: "GET", path: "/customers/:id/orders", description: "Listar pedidos de um cliente" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30 px-3 py-1">
              API
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Integre seu sistema com o Comandejá
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Nossa API RESTful permite que você conecte seus sistemas existentes com o Comandejá, 
              automatizando processos e expandindo funcionalidades.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Documentação Completa
              </Button>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Solicitar Acesso à API
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Recursos da nossa API</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {apiFeatures.map((feature, index) => (
              <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Documentation Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Documentação da API</h2>
          
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
              <div className="flex justify-center mb-8">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
                  <TabsTrigger value="examples">Exemplos</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Visão Geral da API</CardTitle>
                    <CardDescription>
                      Informações básicas sobre a API do Comandejá
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Base URL</h3>
                      <code className="bg-gray-100 p-2 rounded-md block">
                        https://api.comandeja.com.br/v1
                      </code>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Autenticação</h3>
                      <p className="text-gray-600 mb-2">
                        A API utiliza OAuth 2.0 para autenticação. Você precisará gerar um token de acesso 
                        usando sua chave de API e incluí-lo em todas as requisições.
                      </p>
                      <code className="bg-gray-100 p-2 rounded-md block">
                        Authorization: Bearer seu_token_aqui
                      </code>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Formatos de Resposta</h3>
                      <p className="text-gray-600 mb-2">
                        Todas as respostas são retornadas no formato JSON.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Limites de Taxa</h3>
                      <p className="text-gray-600 mb-2">
                        As requisições são limitadas a 100 por minuto por API key. Requisições excedentes 
                        receberão um status 429 (Too Many Requests).
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Códigos de Status</h3>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        <li><span className="font-medium">200</span> - Sucesso</li>
                        <li><span className="font-medium">201</span> - Criado com sucesso</li>
                        <li><span className="font-medium">400</span> - Requisição inválida</li>
                        <li><span className="font-medium">401</span> - Não autorizado</li>
                        <li><span className="font-medium">404</span> - Recurso não encontrado</li>
                        <li><span className="font-medium">429</span> - Muitas requisições</li>
                        <li><span className="font-medium">500</span> - Erro interno do servidor</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="endpoints" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Endpoints Disponíveis</CardTitle>
                    <CardDescription>
                      Lista de todos os endpoints disponíveis na API
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {endpoints.map((category, index) => (
                        <div key={index}>
                          <h3 className="text-lg font-semibold mb-3">{category.category}</h3>
                          <div className="overflow-x-auto">
                            <table className="min-w-full">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Método
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Endpoint
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Descrição
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {category.routes.map((route, routeIndex) => (
                                  <tr key={routeIndex}>
                                    <td className="px-4 py-3">
                                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-md ${
                                        route.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                                        route.method === 'POST' ? 'bg-green-100 text-green-800' :
                                        route.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                                        route.method === 'PATCH' ? 'bg-purple-100 text-purple-800' :
                                        'bg-red-100 text-red-800'
                                      }`}>
                                        {route.method}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-sm">
                                      {route.path}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                      {route.description}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="examples" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Exemplos de Código</CardTitle>
                    <CardDescription>
                      Exemplos de como utilizar a API em JavaScript
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Autenticação</h3>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
                        <code>{codeExamples.authentication}</code>
                      </pre>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Listagem de Pedidos</h3>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
                        <code>{codeExamples.orders}</code>
                      </pre>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Criação de Produto</h3>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
                        <code>{codeExamples.products}</code>
                      </pre>
                    </div>
                    
                    <div className="text-center mt-6">
                      <Button className="bg-primary hover:bg-primary/90 text-white">
                        Ver mais exemplos na documentação
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
      
      {/* Use Cases */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">O que você pode fazer com nossa API</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="flex">
              <div className="mr-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Server className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Integração com outros sistemas</h3>
                <p className="text-gray-600 mb-4">
                  Conecte o Comandejá com seu ERP, sistema de estoque, contabilidade ou qualquer outra 
                  ferramenta que você já utilize.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Sincronização automática de estoque</li>
                  <li>Importação de cardápios existentes</li>
                  <li>Exportação de dados financeiros</li>
                </ul>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Analytics personalizados</h3>
                <p className="text-gray-600 mb-4">
                  Crie dashboards e relatórios personalizados com os dados do seu restaurante para análises 
                  mais profundas.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Análise de tendências de vendas</li>
                  <li>Métricas de desempenho de produtos</li>
                  <li>Relatórios de fidelização de clientes</li>
                </ul>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <ShoppingCart className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Experiências de compra customizadas</h3>
                <p className="text-gray-600 mb-4">
                  Crie experiências de compra únicas em seu próprio site ou aplicativo, mantendo a gestão 
                  centralizada no Comandejá.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Cardápios personalizados</li>
                  <li>Processos de checkout customizados</li>
                  <li>Programas de fidelidade integrados</li>
                </ul>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Automação de processos</h3>
                <p className="text-gray-600 mb-4">
                  Automatize tarefas repetitivas e crie fluxos de trabalho eficientes para sua operação.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Notificações automáticas para a cozinha</li>
                  <li>Atualizações de status de pedidos</li>
                  <li>Reposição automática de estoque</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Pronto para integrar?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Solicite acesso à nossa API e comece a desenvolver integrações poderosas para o seu restaurante.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/contato">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                Solicitar Acesso <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
              Ver Documentação Completa
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default API; 
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 flex justify-center items-center">
          <div className="flex items-center -my-12">
            <Link to="/" className="flex items-center">
              <img src="/images/logo.png" alt="ComandeJá" className="h-40 w-auto" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link to="/" className="flex items-center text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para a página inicial
            </Link>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Termos de Uso</h1>
            
            <div className="space-y-6 text-gray-700">
              <p>
                Última atualização: {new Date().toLocaleDateString()}
              </p>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">1. Aceitação dos Termos</h2>
                <p>
                  Ao acessar ou utilizar o ComandeJá, você concorda em cumprir estes Termos de Uso e 
                  todas as leis e regulamentos aplicáveis. Se você não concordar com estes termos, 
                  não utilize nossos serviços.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">2. Descrição do Serviço</h2>
                <p>
                  O ComandeJá é uma plataforma de gestão para restaurantes, pizzarias e estabelecimentos 
                  de alimentação online e físicos que oferece funcionalidades como:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Gestão de pedidos em tempo real</li>
                  <li>Cardápio digital personalizado</li>
                  <li>Relatórios detalhados</li>
                  <li>Sistema de controle de entregas</li>
                  <li>Gestão de clientes</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">3. Contas de Usuário</h2>
                <p>
                  Para utilizar o ComandeJá, você deve criar uma conta com informações precisas e 
                  completas. Você é responsável por manter a confidencialidade de sua senha e por 
                  todas as atividades que ocorrerem em sua conta.
                </p>
                <p className="mt-2">
                  Você concorda em notificar imediatamente o ComandeJá sobre qualquer uso não autorizado 
                  de sua conta ou qualquer outra violação de segurança.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">4. Uso Aceitável</h2>
                <p>
                  Você concorda em não usar o ComandeJá para:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Violar leis ou regulamentos aplicáveis</li>
                  <li>Infringir direitos de propriedade intelectual</li>
                  <li>Transmitir conteúdo ilegal, prejudicial ou ofensivo</li>
                  <li>Interferir no funcionamento normal da plataforma</li>
                  <li>Acessar áreas do sistema não destinadas ao seu uso</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">5. Pagamentos e Assinaturas</h2>
                <p>
                  Para acessar todos os recursos do ComandeJá, você pode precisar assinar um de nossos 
                  planos. Os preços e condições estão disponíveis em nosso site e podem ser alterados 
                  mediante aviso prévio.
                </p>
                <p className="mt-2">
                  Você concorda em fornecer informações de pagamento precisas e em manter sua assinatura 
                  em dia para continuar utilizando os serviços.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">6. Propriedade Intelectual</h2>
                <p>
                  Todo o conteúdo disponível no ComandeJá, incluindo, mas não se limitando a textos, 
                  gráficos, logotipos, ícones, imagens, clips de áudio, downloads digitais e software, 
                  é propriedade do ComandeJá ou de seus licenciadores e está protegido por leis de 
                  direitos autorais.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">7. Limitação de Responsabilidade</h2>
                <p>
                  O ComandeJá não será responsável por quaisquer danos diretos, indiretos, incidentais, 
                  especiais, consequenciais ou punitivos, incluindo, mas não se limitando a, perda de 
                  lucros, dados, uso, boa vontade ou outras perdas intangíveis, resultantes do uso ou 
                  incapacidade de uso dos serviços.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">8. Alterações nos Termos</h2>
                <p>
                  O ComandeJá pode modificar estes Termos de Uso a qualquer momento. Você deve revisar 
                  esta página periodicamente para estar ciente das alterações. O uso contínuo da plataforma 
                  após a publicação de alterações constitui sua aceitação das novas condições.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">9. Lei Aplicável</h2>
                <p>
                  Estes Termos de Uso são regidos e interpretados de acordo com as leis do Brasil, sem 
                  considerar seus princípios de conflito de leis.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">10. Contato</h2>
                <p>
                  Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco pelo e-mail: 
                  termos@comandeja.com.br
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} ComandeJá. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Terms; 
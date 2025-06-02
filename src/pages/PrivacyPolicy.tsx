import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
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
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Política de Privacidade</h1>
            
            <div className="space-y-6 text-gray-700">
              <p>
                Última atualização: {new Date().toLocaleDateString()}
              </p>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">1. Introdução</h2>
                <p>
                  O ComandeJá respeita a sua privacidade e está comprometido em proteger seus dados pessoais. 
                  Esta política de privacidade descreve como coletamos, usamos e compartilhamos suas informações 
                  quando você utiliza nossa plataforma de gestão para restaurantes.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">2. Dados que Coletamos</h2>
                <p>
                  Podemos coletar os seguintes tipos de informações:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Informações de registro, como nome, e-mail, senha e dados do estabelecimento</li>
                  <li>Informações de uso, incluindo como você interage com nossa plataforma</li>
                  <li>Informações sobre dispositivos, como endereço IP, navegador e sistema operacional</li>
                  <li>Dados de clientes do seu restaurante (que você compartilha conosco)</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">3. Como Usamos seus Dados</h2>
                <p>
                  Utilizamos suas informações para:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Fornecer, manter e melhorar nossos serviços</li>
                  <li>Processar transações e gerenciar sua conta</li>
                  <li>Enviar comunicações relacionadas ao serviço</li>
                  <li>Personalizar sua experiência</li>
                  <li>Garantir a segurança de nossa plataforma</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">4. Compartilhamento de Dados</h2>
                <p>
                  Não vendemos suas informações pessoais. Podemos compartilhar seus dados com:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Provedores de serviços que nos ajudam a operar nossa plataforma</li>
                  <li>Parceiros de negócios, com seu consentimento</li>
                  <li>Autoridades, quando exigido por lei</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">5. Seus Direitos</h2>
                <p>
                  De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Acessar seus dados pessoais</li>
                  <li>Corrigir informações imprecisas</li>
                  <li>Excluir seus dados (com certas limitações)</li>
                  <li>Restringir ou se opor ao processamento</li>
                  <li>Solicitar a portabilidade dos dados</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">6. Segurança</h2>
                <p>
                  Implementamos medidas de segurança técnicas e organizacionais para proteger 
                  suas informações contra acesso não autorizado, perda ou alteração.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">7. Contato</h2>
                <p>
                  Se você tiver dúvidas sobre esta política de privacidade ou sobre como tratamos 
                  seus dados, entre em contato conosco pelo e-mail: privacidade@comandeja.com.br
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

export default PrivacyPolicy; 
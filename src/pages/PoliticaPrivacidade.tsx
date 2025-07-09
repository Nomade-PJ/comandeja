import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";

const PoliticaPrivacidade = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30 px-3 py-1">
              Legal
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Política de Privacidade
            </h1>
            <p className="text-xl text-gray-600">
              Última atualização: 15 de julho de 2024
            </p>
          </div>
        </div>
      </section>
      
      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm">
            <div className="prose prose-lg max-w-none">
              <p>
                A ComandeJá Tecnologia Ltda. ("ComandeJá", "nós", "nosso" ou "conosco") está comprometida em proteger sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações pessoais quando você utiliza nosso website, aplicativos móveis, APIs e outros serviços online (coletivamente, os "Serviços").
              </p>
              
              <p>
                Ao utilizar nossos Serviços, você concorda com a coleta e uso de informações de acordo com esta política. Se você não concordar com esta Política de Privacidade, por favor, não utilize nossos Serviços.
              </p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">1. Informações que Coletamos</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">1.1 Informações Fornecidas por Você</h3>
              <p>
                Coletamos informações que você nos fornece diretamente quando:
              </p>
              <ul className="list-disc pl-6 my-4 space-y-2">
                <li>Cria uma conta ou se registra em nossos Serviços;</li>
                <li>Preenche formulários em nossos Serviços;</li>
                <li>Participa de pesquisas, promoções ou sorteios;</li>
                <li>Comunica-se conosco por e-mail, telefone ou outros meios;</li>
                <li>Configura seu perfil ou preferências;</li>
                <li>Faz pedidos ou processa pagamentos.</li>
              </ul>
              <p>
                Essas informações podem incluir seu nome, endereço de e-mail, número de telefone, endereço postal, informações de pagamento, nome da empresa, cargo, preferências de comunicação e quaisquer outras informações que você optar por fornecer.
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">1.2 Informações Coletadas Automaticamente</h3>
              <p>
                Quando você utiliza nossos Serviços, podemos coletar automaticamente certas informações, incluindo:
              </p>
              <ul className="list-disc pl-6 my-4 space-y-2">
                <li>Informações sobre seu dispositivo, como endereço IP, tipo de navegador, sistema operacional e identificadores de dispositivo;</li>
                <li>Informações sobre sua atividade em nossos Serviços, como páginas visitadas, tempo gasto em cada página, links clicados e ações realizadas;</li>
                <li>Informações de geolocalização;</li>
                <li>Informações coletadas por meio de cookies, web beacons e tecnologias similares.</li>
              </ul>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">1.3 Informações de Terceiros</h3>
              <p>
                Podemos receber informações sobre você de terceiros, incluindo:
              </p>
              <ul className="list-disc pl-6 my-4 space-y-2">
                <li>Parceiros de negócios;</li>
                <li>Provedores de serviços;</li>
                <li>Plataformas de mídia social, se você optar por se conectar a elas através de nossos Serviços;</li>
                <li>Fontes publicamente disponíveis.</li>
              </ul>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">2. Como Utilizamos Suas Informações</h2>
              
              <p>
                Utilizamos as informações que coletamos para:
              </p>
              <ul className="list-disc pl-6 my-4 space-y-2">
                <li>Fornecer, manter e melhorar nossos Serviços;</li>
                <li>Processar transações e enviar notificações relacionadas;</li>
                <li>Enviar informações administrativas, como alterações em nossos termos, condições e políticas;</li>
                <li>Responder a seus comentários, perguntas e solicitações;</li>
                <li>Comunicar-se com você sobre produtos, serviços, ofertas, promoções e eventos;</li>
                <li>Monitorar e analisar tendências, uso e atividades relacionadas aos nossos Serviços;</li>
                <li>Detectar, investigar e prevenir atividades fraudulentas e não autorizadas;</li>
                <li>Personalizar e melhorar sua experiência com nossos Serviços;</li>
                <li>Cumprir obrigações legais.</li>
              </ul>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">3. Compartilhamento de Informações</h2>
              
              <p>
                Podemos compartilhar suas informações pessoais com:
              </p>
              <ul className="list-disc pl-6 my-4 space-y-2">
                <li>Provedores de serviços que realizam serviços em nosso nome;</li>
                <li>Parceiros de negócios com os quais oferecemos produtos ou serviços em conjunto;</li>
                <li>Afiliadas ou subsidiárias do ComandeJá;</li>
                <li>Em resposta a uma solicitação legal, se acreditarmos que a divulgação é de acordo com, ou exigida por, qualquer lei aplicável;</li>
                <li>Para proteger os direitos, propriedade ou segurança do ComandeJá, nossos usuários ou outros;</li>
                <li>Em conexão com, ou durante negociações de, qualquer fusão, venda de ativos da empresa, financiamento ou aquisição de todo ou parte de nosso negócio por outra empresa;</li>
                <li>Com seu consentimento ou mediante sua instrução.</li>
              </ul>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">4. Cookies e Tecnologias Similares</h2>
              
              <p>
                Utilizamos cookies, web beacons e tecnologias similares para coletar informações sobre você e suas atividades em nossos Serviços. Cookies são pequenos arquivos de dados armazenados em seu navegador ou dispositivo. Eles nos permitem reconhecê-lo quando você retorna aos nossos Serviços e nos ajudam a entender quais áreas de nossos Serviços são mais interessantes para você.
              </p>
              
              <p>
                Você pode configurar seu navegador para recusar todos os cookies ou para indicar quando um cookie está sendo enviado. No entanto, alguns recursos de nossos Serviços podem não funcionar adequadamente sem cookies.
              </p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">5. Segurança de Dados</h2>
              
              <p>
                Implementamos medidas de segurança técnicas, administrativas e físicas projetadas para proteger suas informações pessoais contra acesso não autorizado, divulgação, alteração e destruição. No entanto, nenhum sistema de segurança é impenetrável, e não podemos garantir a segurança de nossas bases de dados, nem podemos garantir que as informações que você fornece não serão interceptadas durante a transmissão para nós.
              </p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">6. Retenção de Dados</h2>
              
              <p>
                Retemos suas informações pessoais pelo tempo necessário para cumprir os propósitos descritos nesta Política de Privacidade, a menos que um período de retenção mais longo seja exigido ou permitido por lei. Quando não tivermos mais uma necessidade comercial legítima de processar suas informações pessoais, nós as excluiremos ou anonimizaremos.
              </p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">7. Seus Direitos e Escolhas</h2>
              
              <p>
                Dependendo da sua localização, você pode ter certos direitos em relação às suas informações pessoais, incluindo:
              </p>
              <ul className="list-disc pl-6 my-4 space-y-2">
                <li>Acessar, corrigir ou excluir suas informações pessoais;</li>
                <li>Restringir ou opor-se ao processamento de suas informações pessoais;</li>
                <li>Solicitar a portabilidade de suas informações pessoais;</li>
                <li>Retirar seu consentimento a qualquer momento;</li>
                <li>Optar por não receber comunicações de marketing.</li>
              </ul>
              
              <p>
                Para exercer esses direitos, entre em contato conosco conforme descrito na seção "Contato" abaixo. Observe que alguns desses direitos podem estar sujeitos a limitações e exceções sob a lei aplicável.
              </p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">8. Transferências Internacionais de Dados</h2>
              
              <p>
                Suas informações pessoais podem ser transferidas para, e processadas em, países diferentes do país em que você reside. Esses países podem ter leis de proteção de dados diferentes das leis de seu país. Se transferirmos suas informações pessoais para outros países, tomaremos medidas para garantir que suas informações pessoais recebam um nível adequado de proteção.
              </p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">9. Privacidade de Crianças</h2>
              
              <p>
                Nossos Serviços não se destinam a crianças menores de 18 anos, e não coletamos intencionalmente informações pessoais de crianças menores de 18 anos. Se tomarmos conhecimento de que coletamos informações pessoais de uma criança menor de 18 anos sem verificação de consentimento parental, tomaremos medidas para remover essas informações de nossos servidores.
              </p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">10. Alterações nesta Política de Privacidade</h2>
              
              <p>
                Podemos atualizar esta Política de Privacidade de tempos em tempos. Se fizermos alterações materiais, notificaremos você por meio de um aviso em nosso site ou por e-mail. Encorajamos você a revisar periodicamente esta Política de Privacidade para obter as informações mais recentes sobre nossas práticas de privacidade.
              </p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">11. Contato</h2>
              
              <p>
                Se você tiver alguma dúvida ou preocupação sobre esta Política de Privacidade ou nossas práticas de privacidade, entre em contato conosco pelo e-mail: privacidade@comandeja.com.br
              </p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">12. Lei Geral de Proteção de Dados (LGPD)</h2>
              
              <p>
                Para residentes no Brasil, processamos seus dados pessoais de acordo com a Lei Geral de Proteção de Dados (LGPD). Além dos direitos descritos acima, você também tem o direito de:
              </p>
              <ul className="list-disc pl-6 my-4 space-y-2">
                <li>Confirmar a existência de processamento de seus dados pessoais;</li>
                <li>Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a LGPD;</li>
                <li>Informações sobre entidades públicas e privadas com as quais compartilhamos seus dados;</li>
                <li>Informações sobre a possibilidade de não fornecer consentimento e sobre as consequências da negativa;</li>
                <li>Revogação do consentimento.</li>
              </ul>
              
              <p>
                O ComandeJá atua como "controlador" de seus dados pessoais sob a LGPD. Para exercer seus direitos sob a LGPD, entre em contato conosco conforme descrito na seção "Contato" acima.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default PoliticaPrivacidade; 
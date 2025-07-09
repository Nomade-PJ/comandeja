import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";

const TermosDeUso = () => {
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
              Termos de Uso
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
                Bem-vindo ao ComandeJá. Estes Termos de Uso ("Termos") regem seu acesso e uso do website, aplicativos móveis, APIs e outros serviços online (coletivamente, os "Serviços") fornecidos pela ComandeJá Tecnologia Ltda. ("ComandeJá", "nós", "nosso" ou "conosco").
              </p>
              
              <p>
                Ao acessar ou utilizar nossos Serviços, você concorda com estes Termos. Se você não concordar com estes Termos, não acesse ou utilize nossos Serviços.
              </p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">1. Uso dos Serviços</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">1.1 Elegibilidade</h3>
              <p>
                Para utilizar nossos Serviços, você deve ter pelo menos 18 anos de idade e possuir capacidade legal para celebrar contratos vinculantes. Se você estiver utilizando os Serviços em nome de uma empresa ou outra entidade legal, você declara que possui autoridade para vincular tal entidade a estes Termos.
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">1.2 Cadastro</h3>
              <p>
                Para acessar determinadas funcionalidades dos Serviços, você precisará criar uma conta. Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades que ocorrerem em sua conta. Você concorda em nos notificar imediatamente sobre qualquer uso não autorizado de sua conta.
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">1.3 Uso Aceitável</h3>
              <p>
                Você concorda em utilizar os Serviços apenas para fins legais e de acordo com estes Termos. Você não deve:
              </p>
              <ul className="list-disc pl-6 my-4 space-y-2">
                <li>Violar leis ou regulamentos aplicáveis;</li>
                <li>Infringir direitos de propriedade intelectual ou outros direitos de terceiros;</li>
                <li>Interferir ou tentar interferir na segurança ou integridade dos Serviços;</li>
                <li>Utilizar os Serviços para enviar spam, conteúdo malicioso ou enganoso;</li>
                <li>Tentar acessar áreas restritas dos Serviços sem autorização;</li>
                <li>Utilizar os Serviços para coletar informações pessoais de outros usuários sem consentimento.</li>
              </ul>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">2. Conteúdo e Propriedade Intelectual</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Conteúdo do Usuário</h3>
              <p>
                Ao enviar, postar ou exibir conteúdo através dos Serviços ("Conteúdo do Usuário"), você concede ao ComandeJá uma licença mundial, não exclusiva, isenta de royalties, transferível e sublicenciável para usar, reproduzir, modificar, adaptar, publicar, transmitir, exibir e distribuir tal Conteúdo do Usuário em qualquer meio ou método de distribuição.
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Propriedade Intelectual</h3>
              <p>
                Os Serviços e todo o conteúdo, recursos e funcionalidades neles contidos (incluindo, mas não se limitando a, textos, gráficos, logotipos, ícones, imagens, clipes de áudio, downloads digitais, compilações de dados e software) são de propriedade do ComandeJá, seus licenciadores ou outros provedores de tal material e são protegidos por leis de direitos autorais, marcas registradas, patentes, segredos comerciais e outras leis de propriedade intelectual.
              </p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">3. Assinaturas e Pagamentos</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Planos de Assinatura</h3>
              <p>
                O ComandeJá oferece diferentes planos de assinatura para acesso aos Serviços. Os detalhes de cada plano, incluindo preços e recursos, estão disponíveis em nosso site. Reservamo-nos o direito de modificar, encerrar ou alterar os preços de nossos planos de assinatura a qualquer momento, mediante aviso prévio.
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Pagamentos</h3>
              <p>
                Você concorda em pagar todas as taxas aplicáveis aos Serviços que você escolher. Os pagamentos são não reembolsáveis, exceto quando exigido por lei ou conforme expressamente previsto nestes Termos. Você é responsável por fornecer informações de pagamento precisas e atualizadas.
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">3.3 Período de Teste</h3>
              <p>
                O ComandeJá pode oferecer períodos de teste gratuito para determinados Serviços. Ao se inscrever para um período de teste gratuito, você pode ser solicitado a fornecer informações de pagamento. Após o término do período de teste gratuito, cobraremos automaticamente a taxa de assinatura aplicável, a menos que você cancele sua assinatura antes do término do período de teste.
              </p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">4. Limitação de Responsabilidade</h2>
              
              <p>
                Em nenhuma circunstância o ComandeJá, seus diretores, funcionários, parceiros, agentes, fornecedores ou afiliados serão responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo, sem limitação, perda de lucros, dados, uso, reputação ou outras perdas intangíveis, resultantes de:
              </p>
              <ul className="list-disc pl-6 my-4 space-y-2">
                <li>Seu acesso ou uso ou incapacidade de acessar ou usar os Serviços;</li>
                <li>Qualquer conduta ou conteúdo de terceiros nos Serviços;</li>
                <li>Conteúdo obtido dos Serviços; e</li>
                <li>Acesso não autorizado, uso ou alteração de suas transmissões ou conteúdo.</li>
              </ul>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">5. Indenização</h2>
              
              <p>
                Você concorda em defender, indenizar e isentar o ComandeJá, seus afiliados, licenciadores e prestadores de serviços, e seus respectivos diretores, funcionários, contratados, agentes, licenciadores, fornecedores, sucessores e cessionários de e contra quaisquer reclamações, responsabilidades, danos, julgamentos, prêmios, perdas, custos, despesas ou taxas (incluindo honorários advocatícios razoáveis) decorrentes de ou relacionados à sua violação destes Termos ou seu uso dos Serviços.
              </p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">6. Modificações dos Termos</h2>
              
              <p>
                Reservamo-nos o direito de modificar estes Termos a qualquer momento. Se fizermos alterações materiais a estes Termos, notificaremos você por meio de um aviso em nosso site ou por e-mail. Seu uso continuado dos Serviços após tais modificações constitui sua aceitação dos Termos modificados.
              </p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">7. Rescisão</h2>
              
              <p>
                Podemos encerrar ou suspender seu acesso aos Serviços imediatamente, sem aviso prévio ou responsabilidade, por qualquer motivo, incluindo, sem limitação, se você violar estes Termos. Mediante rescisão, seu direito de usar os Serviços cessará imediatamente.
              </p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">8. Lei Aplicável</h2>
              
              <p>
                Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, sem consideração aos seus princípios de conflito de leis. Qualquer ação judicial decorrente ou relacionada a estes Termos ou aos Serviços será submetida exclusivamente à jurisdição dos tribunais localizados no Brasil.
              </p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">9. Disposições Gerais</h2>
              
              <p>
                Se qualquer disposição destes Termos for considerada inválida ou inexequível, tal disposição será interpretada de forma a refletir a intenção original das partes, e as disposições restantes permanecerão em pleno vigor e efeito. Nossa falha em fazer valer qualquer direito ou disposição destes Termos não constituirá uma renúncia a tal direito ou disposição.
              </p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">10. Contato</h2>
              
              <p>
                Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco pelo e-mail: juridico@comandeja.com.br
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default TermosDeUso; 
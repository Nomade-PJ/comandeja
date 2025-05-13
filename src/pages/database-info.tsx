import { DbInfo } from "@/components/DbInfo";

export default function DatabaseInfoPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Conexão com Banco de Dados</h1>
        <p className="text-muted-foreground">Verifique o status da conexão com o PostgreSQL.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Status da Conexão</h2>
          <DbInfo />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Informações do Banco de Dados</h2>
          <div className="p-4 bg-muted rounded-lg">
            <p className="mb-4">
              O aplicativo ComandeJá está configurado para se conectar a um banco de dados PostgreSQL.
              O arquivo <code className="bg-muted-foreground/20 px-1 py-0.5 rounded">src/lib/db.ts</code> contém a configuração para a conexão.
            </p>
            
            <h3 className="text-lg font-medium mt-4 mb-2">Estrutura do Banco</h3>
            <p>
              O banco de dados possui tabelas para:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Usuários e Autenticação</li>
              <li>Restaurantes e Configurações</li>
              <li>Produtos e Categorias</li>
              <li>Pedidos e Itens</li>
              <li>Clientes</li>
              <li>Avaliações</li>
              <li>Cupons de Desconto</li>
            </ul>
            
            <h3 className="text-lg font-medium mt-4 mb-2">Migração</h3>
            <p>
              O sistema foi migrado de um armazenamento em localStorage para um banco de dados PostgreSQL completo,
              permitindo persistência de dados e recursos avançados como busca, filtragem e relatórios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
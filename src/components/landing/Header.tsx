
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CJ</span>
            </div>
            <span className="text-xl font-bold gradient-text">ComandeJá</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-brand-600 transition-colors">
              Funcionalidades
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-brand-600 transition-colors">
              Preços
            </a>
            <a href="#contact" className="text-gray-600 hover:text-brand-600 transition-colors">
              Contato
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" className="text-gray-600 hover:text-brand-600">
                Entrar
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-brand hover:from-brand-700 hover:to-brand-600 text-white">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

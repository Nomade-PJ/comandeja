import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="border-b border-gray-100 bg-white/95 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between -my-8">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/logo.png" 
              alt="ComandeJá Logo" 
              className="h-32 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <div className="relative group">
              <button className="flex items-center text-gray-700 hover:text-primary transition-colors">
                Produto
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="py-1">
                  <Link to="/funcionalidades" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Funcionalidades
                  </Link>
                  <Link to="/precos" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Preços
                  </Link>
                  <Link to="/demo" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Demo
                  </Link>
                  <Link to="/api" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    API
                  </Link>
                </div>
              </div>
            </div>
            <div className="relative group">
              <button className="flex items-center text-gray-700 hover:text-primary transition-colors">
                Suporte
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="py-1">
                  <Link to="/central-ajuda" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Central de Ajuda
                  </Link>
                  <Link to="/documentacao" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Documentação
                  </Link>
                  <Link to="/status" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Status
                  </Link>
                </div>
              </div>
            </div>
            <Link to="/contato" className="text-gray-700 hover:text-primary transition-colors">
              Contato
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="text-gray-700 hover:text-primary transition-colors">
              Entrar
            </Link>
            <Link to="/register">
              <Button className="bg-primary hover:bg-primary/90">
                Começar Grátis
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 hover:text-primary"
            onClick={toggleMenu}
            aria-label="Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <nav className="flex flex-col space-y-4">
              <div className="border-b border-gray-100 pb-2">
                <button
                  className="flex items-center justify-between w-full text-left text-gray-700 py-2"
                  onClick={() => document.getElementById("produto-dropdown")?.classList.toggle("hidden")}
                >
                  <span>Produto</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                <div id="produto-dropdown" className="hidden pl-4 mt-2 space-y-2">
                  <Link to="/funcionalidades" className="block py-1 text-gray-600">
                    Funcionalidades
                  </Link>
                  <Link to="/precos" className="block py-1 text-gray-600">
                    Preços
                  </Link>
                  <Link to="/demo" className="block py-1 text-gray-600">
                    Demo
                  </Link>
                  <Link to="/api" className="block py-1 text-gray-600">
                    API
                  </Link>
                </div>
              </div>
              <div className="border-b border-gray-100 pb-2">
                <button
                  className="flex items-center justify-between w-full text-left text-gray-700 py-2"
                  onClick={() => document.getElementById("suporte-dropdown")?.classList.toggle("hidden")}
                >
                  <span>Suporte</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                <div id="suporte-dropdown" className="hidden pl-4 mt-2 space-y-2">
                  <Link to="/central-ajuda" className="block py-1 text-gray-600">
                    Central de Ajuda
                  </Link>
                  <Link to="/documentacao" className="block py-1 text-gray-600">
                    Documentação
                  </Link>
                  <Link to="/status" className="block py-1 text-gray-600">
                    Status
                  </Link>
                </div>
              </div>
              <Link to="/contato" className="text-gray-700 py-2 border-b border-gray-100">
                Contato
              </Link>
              <div className="pt-2 space-y-4">
                <Link to="/login" className="block text-gray-700 py-2">
                  Entrar
                </Link>
                <Link to="/register" className="block">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Começar Grátis
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

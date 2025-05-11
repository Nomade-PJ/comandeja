
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-gray-100">
      <header className="bg-white border-b">
        <div className="container mx-auto py-4 px-6 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-primary">ServeQuick</span>
          </div>
          <nav className="flex items-center space-x-4">
            {user ? (
              <Link to="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      
      <main className="flex-1">
        <div className="container mx-auto px-6 py-16 md:py-24">
          <div className="md:flex items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Simplify your restaurant orders and deliveries
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                An all-in-one platform for restaurants to manage orders, deliveries, and customer relationships. 
                Boost your efficiency and grow your business.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <Button size="lg" className="text-lg px-8">
                    Start for Free
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="text-lg px-6">
                    Login
                  </Button>
                </Link>
              </div>
              <div className="mt-8 text-gray-500">
                <p>No credit card required. Free 10-day trial.</p>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-12">
              <div className="rounded-lg shadow-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1080" 
                  alt="Restaurant food" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
          
          <div className="py-16 md:py-24">
            <h2 className="text-3xl font-bold text-center mb-16">
              Everything your restaurant needs
            </h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="p-6 bg-white rounded-lg shadow-md">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Real-time Ordering</h3>
                <p className="text-gray-600">
                  Get orders from your customers instantly with automatic notifications and tracking.
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-md">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Digital Menu</h3>
                <p className="text-gray-600">
                  Beautiful digital menus that customers can browse from anywhere on any device.
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-md">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Delivery Management</h3>
                <p className="text-gray-600">
                  Track deliveries, assign orders to drivers, and keep customers informed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <h3 className="text-2xl font-bold mb-4">ServeQuick</h3>
              <p className="text-gray-400 max-w-xs">
                Streamlining restaurant operations through innovative technology solutions.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-bold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>About</li>
                  <li>Careers</li>
                  <li>Blog</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Resources</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Help Center</li>
                  <li>Pricing</li>
                  <li>Documentation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Privacy</li>
                  <li>Terms</li>
                  <li>Cookie Policy</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} ServeQuick. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

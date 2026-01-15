
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, User, Briefcase, Cpu, Coins, Home, LayoutDashboard, ShoppingBag, BookOpen } from 'lucide-react';

export const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Business', path: '/category/business', icon: Briefcase },
    { name: 'Tech', path: '/category/tech', icon: Cpu },
    { name: 'Digital Assets', path: '/category/digital-assets', icon: Coins },
    { name: 'Marketplace', path: '/marketplace', icon: ShoppingBag },
    { name: 'Knowledge', path: '/blog', icon: BookOpen },
  ];

  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600 tracking-tight">INCOME<span className="text-gray-900">LAB</span></span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                    location.pathname === link.path 
                    ? 'border-blue-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/search" className="p-2 text-gray-400 hover:text-gray-500">
              <Search className="h-5 w-5" />
            </Link>
            <Link to="/admin" className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Admin
            </Link>
          </div>
          
          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 pb-4">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-3 text-base font-medium ${
                  location.pathname === link.path
                    ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <link.icon className="h-5 w-5 mr-3" />
                {link.name}
              </Link>
            ))}
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800"
            >
              <LayoutDashboard className="h-5 w-5 mr-3" />
              Admin Dashboard
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

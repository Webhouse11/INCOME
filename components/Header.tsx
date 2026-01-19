
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, User, Briefcase, Cpu, Coins, Home, LayoutDashboard, ShoppingBag, BookOpen, Sparkles, Zap, ShieldCheck } from 'lucide-react';

const IntelligenceTicker: React.FC = () => {
  const quotes = [
    "Skills are the new global currency; outdated knowledge is now a liability. 💎",
    "The digital economy waits for no one—upgrade your toolkit at IncomeLab now. 🚀",
    "IncomeLab: Providing the blueprints that traditional education forgot. 📚🚫",
    "AI isn't coming; it's here. Master the tools today or be mastered by them. 🤖",
    "Old knowledge is a map to a world that no longer exists. Stay relevant. 🗺️⏳",
    "Your earning potential is tied directly to your learning speed. Accelerate. 🏁",
    "High-ticket skills turn a worker into a builder. Choose excellence today. 🏗️",
    "Don't just watch the trends, own the digital assets that power them. 📈",
    "IncomeLab is the ultimate plug for battle-tested income systems. 🔌🔥",
    "The best investment you'll make this year is between your ears. 🧠✨"
  ];

  return (
    <div className="w-full bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-2 overflow-hidden border-b border-white/10 relative z-[60]">
      <style>{`
        @keyframes ticker {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-ticker {
          display: flex;
          width: max-content;
          animation: ticker 60s linear infinite;
        }
        .ticker-item {
          display: inline-flex;
          align-items: center;
          padding: 0 40px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          white-space: nowrap;
        }
      `}</style>
      <div className="animate-ticker">
        {/* Double the list for a seamless loop */}
        {[...quotes, ...quotes].map((quote, idx) => (
          <div key={idx} className="ticker-item">
            <span className="text-blue-400 mr-2"><Sparkles className="h-3 w-3" /></span>
            {quote}
          </div>
        ))}
      </div>
    </div>
  );
};

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

  return (
    <header className="sticky top-0 z-50">
      <IntelligenceTicker />
      <nav className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-black text-blue-600 tracking-tighter">INCOME<span className="text-gray-900">LAB</span></span>
              </Link>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`inline-flex items-center px-1 pt-1 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${
                      location.pathname === link.path 
                      ? 'border-blue-500 text-gray-900' 
                      : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-200'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/admin" className="flex items-center px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.1em] text-white bg-gray-900 rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-gray-200">
                <LayoutDashboard className="h-3.5 w-3.5 mr-2" />
                Admin Dashboard
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
                  className={`flex items-center px-4 py-3 text-base font-bold ${
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
                className="flex items-center px-4 py-3 text-base font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              >
                <LayoutDashboard className="h-5 w-5 mr-3" />
                Admin Dashboard
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

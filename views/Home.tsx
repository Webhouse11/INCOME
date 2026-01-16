
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCMSData } from '../services/storage.ts';
import { CheckCircle, ArrowRight, Zap, Star, ShoppingBag, Layers, Box } from 'lucide-react';
import { AISearch } from '../components/AISearch.tsx';
import { ProductCard } from '../App.tsx';

const PurchaseNotification: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [purchase, setPurchase] = useState<{ name: string; location: string; product: string } | null>(null);
  const data = getCMSData();

  const names = [
    "Samuel Thomas", "Sarah Jenkins", "Olawale Bakare", "Chidi Okafor", 
    "Elena Rodriguez", "Fatima Yusuf", "John Doe", "Amina Bello", 
    "Kelechi Iheanacho", "David Miller", "Blessing Okon", "Mustafa Ali",
    "Grace Adeyemi", "Victor Umeh"
  ];
  
  const locations = [
    "Lagos, Nigeria", "Abuja, Nigeria", "London, UK", "New York, USA", 
    "Port Harcourt, Nigeria", "Nairobi, Kenya", "Accra, Ghana", 
    "Johannesburg, SA", "Enugu, Nigeria", "Kano, Nigeria", "Toronto, Canada"
  ];

  useEffect(() => {
    const showRandomPurchase = () => {
      if (data.products.length === 0) return;
      
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      const randomProduct = data.products[Math.floor(Math.random() * data.products.length)].name;

      setPurchase({ name: randomName, location: randomLocation, product: randomProduct });
      setVisible(true);

      setTimeout(() => {
        setVisible(false);
      }, 5000); 
    };

    const interval = setInterval(showRandomPurchase, 12000);
    const initialTimeout = setTimeout(showRandomPurchase, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [data.products]);

  if (!purchase) return null;

  return (
    <div className={`fixed bottom-6 left-6 z-[100] transition-all duration-500 transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
      <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl p-4 flex items-center space-x-4 max-w-xs sm:max-w-sm">
        <div className="bg-blue-100 p-3 rounded-full text-blue-600 flex-shrink-0">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">
            {purchase.name} <span className="font-normal text-gray-500 text-xs">from {purchase.location}</span>
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Just bought <span className="text-blue-600 font-semibold">{purchase.product}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export const Home: React.FC = () => {
  const data = getCMSData();
  // Show 6 featured articles
  const featuredArticles = data.articles.filter(a => a.featured || a.id.startsWith('at-')).slice(0, 6);
  
  const sortedProducts = [...data.products].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Show exactly 8 products in a grid
  const latestProducts = sortedProducts.slice(0, 8); 
  const totalProductsCount = data.products.length;

  const testimonials = [
    { name: "Samuel O.", location: "Lagos, Nigeria", text: "The High-Profit Mini-Importation Blueprint saved me months of trial and error.", role: "Founder", avatar: "https://i.pravatar.cc/150?u=samuel" },
    { name: "Sarah J.", location: "London, UK", text: "As a freelancer, the Prompt Engineering Toolkit doubled my productivity.", role: "Digital Marketer", avatar: "https://i.pravatar.cc/150?u=sarah" },
    { name: "Tunde W.", location: "Abuja, Nigeria", text: "IncomeLab is my go-to hub. The Digital Real Estate guide opened my eyes.", role: "Side Hustler", avatar: "https://i.pravatar.cc/150?u=tunde" },
    { name: "Amara E.", location: "Enugu, Nigeria", text: "The step-by-step approach here is different. No hype, just real value.", role: "Designer", avatar: "https://i.pravatar.cc/150?u=amara" }
  ];

  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      
      <PurchaseNotification />
      
      <section className="relative pt-20 pb-12 overflow-hidden bg-gradient-to-b from-blue-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 mb-6">
            <Zap className="h-4 w-4 mr-2" /> {data.siteSettings.announcement}
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            {data.siteSettings.heroTitle}
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10">
            {data.siteSettings.heroSubtitle}
          </p>

          <div className="mb-12 max-w-3xl mx-auto">
            <AISearch />
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/marketplace" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200">
              Explore {totalProductsCount}+ Income Guides
            </Link>
            <Link to="/blog" className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-200 rounded-xl font-bold text-lg hover:border-gray-300">
              Start Free Learning
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Latest Knowledge Hub</h2>
              <p className="text-gray-500 mt-2">Free educational content to get you started.</p>
            </div>
            <Link to="/blog" className="hidden sm:flex items-center font-semibold text-blue-600">
              View all <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredArticles.map((article) => (
              <Link key={article.id} to={`/blog/${article.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col h-full hover:shadow-xl transition-all">
                <img src={article.image} alt={article.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="p-6 flex-grow">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{article.category}</span>
                  <h3 className="text-xl font-bold text-gray-900 mt-2 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">{article.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3">{article.excerpt}</p>
                </div>
                <div className="px-6 pb-6">
                  <span className="text-blue-600 font-bold text-sm inline-flex items-center">
                    Read Guide <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 text-center md:text-left">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
              <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-black uppercase tracking-widest flex items-center">
                <Layers className="h-3 w-3 mr-1" /> PRO LIBRARY
              </span>
              <span className="text-blue-600 font-bold text-sm">Recently Added</span>
            </div>
            <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tight">Premium Blueprints</h2>
            <p className="text-gray-500 mt-2 text-lg font-medium italic">Accelerator programs to cut your learning curve in half.</p>
          </div>
          
          <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl flex items-center space-x-6 relative group overflow-hidden">
            <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-blue-600/20 transition-colors pointer-events-none"></div>
            <div className="text-center">
              <p className="text-4xl font-black text-blue-500">{totalProductsCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Systems</p>
            </div>
            <div className="h-10 w-px bg-gray-700"></div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-bold mb-1">DATA VAULT ACTIVE</span>
              <Link to="/marketplace" className="group flex items-center text-sm font-bold hover:text-blue-400 transition-colors">
                Browse Full Repository <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {latestProducts.map((product) => (
            <ProductCard key={product.id} p={product} />
          ))}
        </div>

        <div className="mt-12 text-center">
           <Link to="/marketplace" className="inline-flex items-center px-10 py-6 bg-gray-900 text-white hover:bg-blue-700 rounded-[2rem] font-bold transition-all group shadow-2xl">
              <Box className="h-5 w-5 mr-3 text-blue-400" />
              Discover {Math.max(0, totalProductsCount - 8)} More Strategies in the Premium Vault
              <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform" />
           </Link>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Trusted by Builders Worldwide</h2>
        </div>
        <div className="relative overflow-hidden w-full">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...testimonials, ...testimonials].map((t, i) => (
              <div key={i} className="inline-block w-[350px] mx-4 flex-shrink-0 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm whitespace-normal">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, idx) => <Star key={idx} className="h-3 w-3 text-yellow-400 fill-current" />)}
                </div>
                <p className="text-gray-700 text-sm italic mb-6 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center">
                  <img src={t.avatar} className="h-10 w-10 rounded-full mr-3 object-cover" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{t.name}</h4>
                    <p className="text-[10px] text-blue-600 font-semibold uppercase">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

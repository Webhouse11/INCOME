import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useParams, Link, useLocation } from 'react-router-dom';
import { Header } from './components/Header.tsx';
import { Home } from './views/Home.tsx';
import { AdminDashboard } from './views/AdminDashboard.tsx';
import { getCMSData } from './services/storage.ts';
import { fetchLiveTrends, GroundedTrend } from './services/gemini.ts';
import { 
  Download, 
  ShoppingCart, 
  CheckCircle, 
  ArrowLeft, 
  Clock, 
  User, 
  ChevronRight, 
  ShieldCheck, 
  Target, 
  Zap, 
  ArrowRight,
  Share2,
  Gift,
  HelpCircle,
  ChevronDown,
  BookOpen,
  ArrowDownCircle,
  Award,
  ChevronLeft,
  Search,
  Loader2,
  Globe,
  Youtube,
  ExternalLink
} from 'lucide-react';
import { Article, Product, CategoryType } from './types.ts';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const ArticleDetailView = () => {
  const { slug } = useParams<{ slug: string }>();
  const data = getCMSData();
  const article = data.articles.find(a => a.slug === slug || a.id === slug);

  if (!article) return <div className="max-w-7xl mx-auto px-4 py-32 text-center"><h2 className="text-3xl font-bold mb-4">Article Not Found</h2><Link to="/blog" className="text-blue-600 font-bold hover:underline">Back to Knowledge Hub</Link></div>;

  const relatedArticles = data.articles.filter(a => a.category === article.category && a.id !== article.id).slice(0, 3);
  const relatedProducts = data.products.filter(p => p.category === article.category).slice(0, 2);

  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/blog" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-8 transition-colors group">
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Knowledge Hub
        </Link>

        <header className="mb-12">
          <div className="flex items-center space-x-2 text-sm text-blue-600 font-bold uppercase tracking-widest mb-4"><span>{article.category}</span></div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">{article.title}</h1>
          <div className="flex items-center space-x-6 text-gray-500 text-sm">
            <div className="flex items-center"><User className="h-4 w-4 mr-2" /> By {article.author}</div>
            <div className="flex items-center"><Clock className="h-4 w-4 mr-2" /> {new Date(article.createdAt).toLocaleDateString()}</div>
          </div>
        </header>

        <img src={article.image} alt={article.title} className="w-full h-auto object-cover max-h-[500px] rounded-3xl shadow-2xl mb-12" />

        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-12">
          <p className="text-xl text-gray-500 italic mb-8 border-l-4 border-blue-500 pl-6">{article.excerpt}</p>
          <div dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br/>') }} />
        </div>

        {relatedProducts.length > 0 && (
          <div className="bg-blue-600 rounded-3xl p-8 mb-20 text-white">
            <h3 className="text-2xl font-bold mb-4">Recommended for You</h3>
            <p className="mb-8 opacity-90">Deepen your results with this category-specific blueprint.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedProducts.map(p => (
                <Link key={p.id} to={`/marketplace/${p.id}`} className="bg-white/10 hover:bg-white/20 p-6 rounded-2xl flex items-center justify-between transition-colors">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{p.type}</span>
                    <h4 className="font-bold text-lg">{p.name}</h4>
                  </div>
                  <ChevronRight className="h-6 w-6" />
                </Link>
              ))}
            </div>
          </div>
        )}

        <section className="pt-12 border-t border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Related Income Blueprints</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedArticles.map(a => (
              <Link key={a.id} to={`/blog/${a.slug}`} className="group flex flex-col h-full bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                <img src={a.image} className="h-40 w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="p-5 flex-grow"><h4 className="font-bold text-gray-900 leading-tight group-hover:text-blue-600 line-clamp-2">{a.title}</h4></div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const ProductDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const data = getCMSData();
  const product = data.products.find(p => p.id === id || p.slug === id);
  const [isPurchased, setIsPurchased] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  if (!product) return <div className="max-w-7xl mx-auto px-4 py-32 text-center"><h2 className="text-3xl font-bold mb-4">Product Not Found</h2><Link to="/marketplace" className="text-blue-600 font-bold hover:underline">Back to Marketplace</Link></div>;

  const handleBuy = () => {
    setLoading(true);
    setTimeout(() => { setIsPurchased(true); setLoading(false); }, 2000);
  };

  return (
    <div className="bg-white min-h-screen">
      <section className="relative bg-gray-900 text-white pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-3/5 text-center lg:text-left">
              <span className="inline-block px-4 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-blue-500/30">
                {product.type} Access
              </span>
              <h1 className="text-4xl md:text-6xl font-black mb-8 leading-[1.1]">
                {product.name}
              </h1>
              <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl">
                {product.fullSalesCopy || product.description}
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <button 
                  onClick={handleBuy}
                  className="px-8 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xl transition-all shadow-xl shadow-blue-900/40 flex items-center"
                >
                  <ShoppingCart className="h-6 w-6 mr-3" /> Get it Now for ₦{product.price.toLocaleString()}
                </button>
              </div>
            </div>
            <div className="lg:w-2/5 w-full max-w-md">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <img src={product.image} className="relative rounded-[2.5rem] w-full h-[500px] object-cover shadow-2xl border border-white/10" alt={product.name} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-gray-50 border-y border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center justify-center md:justify-start">
            <ShieldCheck className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <p className="font-bold text-gray-900">Secure Checkout</p>
              <p className="text-xs text-gray-500 uppercase font-medium">Encrypted & Private</p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Award className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <p className="font-bold text-gray-900">Expert Content</p>
              <p className="text-xs text-gray-500 uppercase font-medium">Tested & Proven Strategies</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-end">
            <Zap className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <p className="font-bold text-gray-900">Instant Delivery</p>
              <p className="text-xs text-gray-500 uppercase font-medium">Direct Access After Payment</p>
            </div>
          </div>
        </div>
      </div>

      {product.modules && (
        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tight">What's Inside The Blueprint?</h2>
              <div className="h-1.5 w-20 bg-blue-600 mx-auto rounded-full"></div>
            </div>
            <div className="space-y-6">
              {product.modules.map((mod, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-100 rounded-3xl p-8 hover:bg-blue-50/30 transition-colors">
                  <div className="flex items-center mb-6">
                    <span className="h-10 w-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold mr-4">
                      {idx + 1}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">{mod.title}</h3>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {mod.items.map((item, i) => (
                      <li key={i} className="flex items-start text-gray-600">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-sm font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {product.bonuses && (
        <section className="py-24 bg-blue-50">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-blue-600 text-white rounded-full text-xs font-black uppercase tracking-widest mb-4">Limited Time Offer</span>
              <h2 className="text-4xl font-black text-gray-900">Exclusive Bonuses (Value ₦25k+)</h2>
              <p className="mt-4 text-gray-600 font-medium">You get these for FREE when you purchase today.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {product.bonuses.map((bonus, i) => (
                <div key={i} className="bg-white p-8 rounded-[2rem] border border-blue-100 shadow-xl shadow-blue-200/50 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <Gift className="h-12 w-12 text-blue-600" />
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold">VALUED AT ₦{bonus.value.toLocaleString()}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{bonus.title}</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">{bonus.description}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-50 text-blue-600 font-bold text-sm">Included in your purchase</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {product.faqs && (
        <section className="py-24 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-black text-gray-900 mb-12 text-center uppercase tracking-tight">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {product.faqs.map((faq, idx) => (
                <div key={idx} className="border border-gray-100 rounded-2xl overflow-hidden">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-6 text-left font-bold text-gray-900 bg-white hover:bg-gray-50 transition-colors"
                  >
                    {faq.question}
                    <ChevronDown className={`h-5 w-5 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {activeFaq === idx && (
                    <div className="p-6 pt-0 bg-white text-gray-600 text-sm leading-relaxed border-t border-gray-50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="sticky bottom-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 py-6 px-4 z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Get access to</p>
            <p className="text-lg font-black text-gray-900">{product.name}</p>
          </div>
          {isPurchased ? (
            <a href={product.downloadUrl} target="_blank" className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white font-bold rounded-xl flex items-center justify-center">
              <Download className="h-5 w-5 mr-3" /> Download Material
            </a>
          ) : (
            <button 
              onClick={handleBuy}
              className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-xl shadow-blue-200 flex items-center justify-center hover:bg-blue-700 transition-all"
            >
              {loading ? "Processing..." : `Enroll for ₦${product.price.toLocaleString()}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const CategoryView = ({ name }: { name: string }) => {
  const data = getCMSData();
  const articles = data.articles.filter(a => a.category.toLowerCase().includes(name.toLowerCase().split(' ')[0]));
  const products = data.products.filter(p => p.category.toLowerCase().includes(name.toLowerCase().split(' ')[0]));
  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="mb-16"><h1 className="text-5xl font-extrabold text-gray-900 mb-6">{name} Hub</h1><p className="text-xl text-gray-600 max-w-3xl">Expert blueprints specifically designed for the {name.toLowerCase()} landscape.</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-12">
          <h2 className="text-2xl font-bold text-gray-900 pb-4 border-b-2 border-blue-600 inline-block mb-8 uppercase">Latest Knowledge</h2>
          {articles.map(a => (
            <Link key={a.id} to={`/blog/${a.slug}`} className="flex flex-col md:flex-row gap-8 group">
              <div className="md:w-64 h-44 flex-shrink-0 overflow-hidden rounded-3xl"><img src={a.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /></div>
              <div><h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 mb-3">{a.title}</h3><p className="text-gray-500 line-clamp-2">{a.excerpt}</p></div>
            </Link>
          ))}
        </div>
        <div className="space-y-10">
          <h2 className="text-2xl font-bold text-gray-900 pb-4 border-b-2 border-purple-600 inline-block mb-4 uppercase">Premium Tools</h2>
          <div className="space-y-6">
            {products.map(p => (
              <Link key={p.id} to={`/marketplace/${p.id}`} className="block p-6 bg-white border border-gray-100 rounded-3xl hover:shadow-lg transition-all group">
                <div className="flex justify-between mb-4"><span className="text-[10px] font-black text-purple-600 uppercase">{p.type}</span><span className="font-bold text-gray-900">₦{p.price.toLocaleString()}</span></div>
                <h4 className="font-bold text-gray-900 group-hover:text-blue-600 mb-2">{p.name}</h4>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MarketplaceView = () => {
  const data = getCMSData();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  const totalProducts = data.products.length;
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
  
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = data.products.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6">Premium Market</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">Get exclusive blueprints that go beyond the blog. Designed for ROI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {paginatedProducts.map(p => (
          <Link key={p.id} to={`/marketplace/${p.id}`} className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden flex flex-col hover:shadow-2xl transition-all group">
            <div className="relative h-64 overflow-hidden">
              <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-4 left-4">
                <span className="px-4 py-2 bg-white/90 rounded-2xl text-[10px] font-black text-blue-600 uppercase">
                  {p.type}
                </span>
              </div>
            </div>
            <div className="p-8 flex-grow flex flex-col">
              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 mb-4">{p.name}</h3>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-2xl font-black text-gray-900">₦{p.price.toLocaleString()}</span>
                <span className="flex items-center text-blue-600 font-bold text-sm">
                  View Details <ChevronRight className="h-4 w-4 ml-1" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-20 flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => {
                setCurrentPage(prev => Math.max(prev - 1, 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === 1}
              className="p-4 rounded-full border border-gray-100 bg-white shadow-sm hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-6 w-6 text-gray-900" />
            </button>
            
            <div className="flex items-center space-x-2 px-6">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentPage(i + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`h-10 w-10 rounded-xl font-bold transition-all ${
                    currentPage === i + 1 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                    : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button 
              onClick={() => {
                setCurrentPage(prev => Math.min(prev + 1, totalPages));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === totalPages}
              className="p-4 rounded-full border border-gray-100 bg-white shadow-sm hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="h-6 w-6 text-gray-900" />
            </button>
          </div>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">
            Showing Page {currentPage} of {totalPages}
          </p>
        </div>
      )}
    </div>
  );
};

const BlogView = () => {
  const data = getCMSData();
  const [trends, setTrends] = useState<GroundedTrend[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(CategoryType.BUSINESS);

  const handleScanTrends = async () => {
    setLoadingTrends(true);
    const liveData = await fetchLiveTrends(selectedCategory);
    setTrends(liveData);
    setLoadingTrends(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
        <h1 className="text-5xl font-extrabold text-gray-900">Knowledge Hub</h1>
        
        <div className="w-full md:max-w-md bg-gray-900 rounded-[2rem] p-6 text-white shadow-2xl">
          <div className="flex items-center space-x-2 mb-4">
            <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Live Trend Researcher</span>
          </div>
          <p className="text-sm text-gray-400 mb-4">Scanner searching Google & YouTube for real-time income opportunities.</p>
          <div className="flex gap-2">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as CategoryType)}
              className="flex-grow bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={CategoryType.BUSINESS} className="text-black">Business Trends</option>
              <option value={CategoryType.TECH} className="text-black">Tech Trends</option>
              <option value={CategoryType.DIGITAL_ASSETS} className="text-black">Asset Trends</option>
            </select>
            <button 
              onClick={handleScanTrends}
              disabled={loadingTrends}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center disabled:opacity-50"
            >
              {loadingTrends ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {trends.length > 0 && (
        <section className="mb-20 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-blue-50 border-2 border-blue-100 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Globe className="h-40 w-40 text-blue-600" />
             </div>
             <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
                <Zap className="h-6 w-6 text-blue-600 mr-3" /> Live Discovery: {selectedCategory}
             </h2>
             {trends.map((t, i) => (
               <div key={i} className="space-y-6">
                 <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                   {t.description}
                 </div>
                 <div className="pt-6 border-t border-blue-200">
                    <p className="text-xs font-black text-blue-600 uppercase mb-4 tracking-widest">Data Sources (Grounded Citations)</p>
                    <div className="flex flex-wrap gap-3">
                      {t.sources.map((src, idx) => (
                        <a 
                          key={idx} 
                          href={src.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-white border border-blue-100 rounded-xl text-xs font-bold text-gray-700 hover:shadow-lg transition-all"
                        >
                          {src.uri.includes('youtube') ? <Youtube className="h-3 w-3 mr-2 text-red-600" /> : <Globe className="h-3 w-3 mr-2 text-blue-600" />}
                          {src.title}
                          <ExternalLink className="h-3 w-3 ml-2 opacity-30" />
                        </a>
                      ))}
                    </div>
                 </div>
               </div>
             ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {data.articles.map(a => (
          <Link key={a.id} to={`/blog/${a.slug}`} className="flex flex-col bg-white rounded-[2rem] border border-gray-100 overflow-hidden group hover:shadow-xl transition-all">
            <div className="relative h-72 overflow-hidden"><img src={a.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /></div>
            <div className="p-8"><span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-2">{a.category}</span><h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 mb-4">{a.title}</h3><p className="text-gray-500 line-clamp-3 mb-6">{a.excerpt}</p><span className="text-gray-900 font-bold text-sm inline-flex items-center">Read Blueprint <ArrowRight className="ml-2 h-4 w-4" /></span></div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const Footer = () => (
  <footer className="bg-gray-900 text-white py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
        <div className="lg:col-span-2">
          <Link to="/" className="text-3xl font-black text-blue-500 tracking-tighter uppercase">INCOME<span className="text-white">LAB</span></Link>
          <p className="mt-6 text-gray-400 text-lg leading-relaxed">The authoritative hub for builders mastering modern income systems.</p>
        </div>
        <div>
          <h4 className="text-lg font-bold mb-8 uppercase tracking-widest">Navigation</h4>
          <ul className="space-y-4 text-gray-400 font-medium">
            <li><Link to="/category/business" className="hover:text-blue-400">Business Income</Link></li>
            <li><Link to="/category/tech" className="hover:text-blue-400">Tech Income</Link></li>
            <li><Link to="/category/digital-assets" className="hover:text-blue-400">Digital Assets</Link></li>
            <li><Link to="/marketplace" className="hover:text-blue-400">Premium Market</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-bold mb-8 uppercase tracking-widest">Support</h4>
          <ul className="space-y-4 text-gray-400 font-medium">
            <li><a href="#" className="hover:text-blue-400">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-blue-400">Earnings Disclaimer</a></li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
);

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white selection:bg-blue-100">
        <Header />
        <main><Routes><Route path="/" element={<Home />} /><Route path="/admin" element={<AdminDashboard />} /><Route path="/category/business" element={<CategoryView name="Business" />} /><Route path="/category/tech" element={<CategoryView name="Tech" />} /><Route path="/category/digital-assets" element={<CategoryView name="Digital Assets" />} /><Route path="/marketplace" element={<MarketplaceView />} /><Route path="/marketplace/:id" element={<ProductDetailView />} /><Route path="/blog" element={<BlogView />} /><Route path="/blog/:slug" element={<ArticleDetailView />} /></Routes></main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
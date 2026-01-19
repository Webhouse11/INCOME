
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useParams, Link, useLocation } from 'react-router-dom';
import { Header } from './components/Header.tsx';
import { Home } from './views/Home.tsx';
import { AdminDashboard } from './views/AdminDashboard.tsx';
import { getCMSData, initializeCMSData, getIntegrityReport } from './services/storage.ts';
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
  ExternalLink,
  Cpu,
  Filter,
  XCircle,
  Shield,
  Plus,
  Sparkles,
  Briefcase,
  Coins,
  TrendingUp,
  Layout,
  Star,
  ShoppingBag
} from 'lucide-react';
import { Article, Product, CategoryType, CMSData } from './types.ts';

/**
 * Global sorting utility for Knowledge Nodes
 */
const sortArticlesLatest = (a: Article, b: Article) => {
  const timeA = new Date(a.createdAt).getTime();
  const timeB = new Date(b.createdAt).getTime();
  if (timeB !== timeA) return timeB - timeA;
  return b.id.localeCompare(a.id);
};

/**
 * Utility to sort products by date (descending), falling back to ID if dates are identical.
 */
const sortProductsLatest = (a: Product, b: Product) => {
  const timeA = new Date(a.createdAt).getTime();
  const timeB = new Date(b.createdAt).getTime();
  if (timeB !== timeA) return timeB - timeA;
  return b.id.localeCompare(a.id, undefined, { numeric: true });
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const ArticleDetailView = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [cms, setCms] = useState<CMSData>(getCMSData());

  useEffect(() => {
    const data = getCMSData();
    const found = data.articles.find(a => a.slug === slug || a.id === slug);
    setArticle(found || null);
    setCms(data);
  }, [slug]);

  if (!article) return <div className="max-w-4xl mx-auto px-4 py-32 text-center"><h2 className="text-3xl font-bold mb-4">Article Not Found</h2><Link to="/blog" className="text-blue-600 font-bold hover:underline">Back to Knowledge Hub</Link></div>;

  const relatedArticles = cms.articles
    .filter(a => a.category === article.category && a.id !== article.id)
    .sort(sortArticlesLatest)
    .slice(0, 3);

  const relatedProducts = cms.products
    .filter(p => p.category === article.category)
    .sort(sortProductsLatest)
    .slice(0, 2);

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
                <img src={a.image} className="h-40 w-full object-cover group-hover:scale-110 transition-transform duration-500" />
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
  const [product, setProduct] = useState<Product | null>(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const data = getCMSData();
    const found = data.products.find(p => p.id === id || p.slug === id);
    setProduct(found || null);
  }, [id]);

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
              {loading ? "Processing..." : `Download it for ₦${product.price.toLocaleString()}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<CMSData | null>(null);
  const [initStage, setInitStage] = useState('Initiating Engine...');

  useEffect(() => {
    const init = async () => {
      setInitStage('Scanning Baseline...');
      await new Promise(r => setTimeout(r, 600));
      setInitStage('Verifying Workspace Integrity...');
      const loadedData = await initializeCMSData();
      setInitStage('Recovery Sync Complete.');
      await new Promise(r => setTimeout(r, 400));
      setData(loadedData);
      setIsLoading(false);
    };
    init();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-900 text-white">
        <div className="relative mb-8">
           <div className="h-20 w-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
           <Shield className="h-10 w-10 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h1 className="text-3xl font-black tracking-widest uppercase mb-2">Income<span className="text-blue-500">Lab</span></h1>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">{initStage}</p>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white selection:bg-blue-100">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/category/business" element={<CategoryView name="Business" />} />
            <Route path="/category/tech" element={<CategoryView name="Tech" />} />
            <Route path="/category/digital-assets" element={<CategoryView name="Digital Assets" />} />
            <Route path="/marketplace" element={<MarketplaceView />} />
            <Route path="/marketplace/:id" element={<ProductDetailView />} />
            <Route path="/blog" element={<BlogView />} />
            <Route path="/blog/:slug" element={<ArticleDetailView />} />
          </Routes>
        </main>
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
      </div>
    </Router>
  );
}

const CategoryView = ({ name }: { name: string }) => {
  const data = getCMSData();
  const [searchQuery, setSearchQuery] = useState('');

  // Initial filtering by category and chronological sort
  const catPrefix = name.toLowerCase().split(' ')[0];
  const articlesInCat = data.articles
    .filter(a => a.category.toLowerCase().includes(catPrefix))
    .sort(sortArticlesLatest);
  
  const productsInCat = data.products
    .filter(p => p.category.toLowerCase().includes(catPrefix))
    .sort(sortProductsLatest);

  // Secondary search filtering
  const filteredArticles = articlesInCat.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const featuredOffer = productsInCat[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
        <div className="max-w-3xl">
          <div className="flex items-center space-x-2 mb-4">
             {name === 'Business' && <Briefcase className="h-6 w-6 text-blue-600" />}
             {name === 'Tech' && <Cpu className="h-6 w-6 text-blue-600" />}
             {name === 'Digital Assets' && <Coins className="h-6 w-6 text-blue-600" />}
             <span className="text-blue-600 font-black text-xs uppercase tracking-widest">Knowledge Cluster</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">{name} Hub</h1>
          <p className="text-xl text-gray-600 font-medium">Expert blueprints specifically designed for the {name.toLowerCase()} landscape.</p>
        </div>
        
        <div className="w-full md:w-96 relative group">
          <div className="absolute -inset-1 bg-blue-600 rounded-2xl blur opacity-10 group-focus-within:opacity-25 transition-all"></div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${name} Knowledge...`}
            className="relative w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-0 transition-all outline-none font-bold text-sm shadow-sm"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
        </div>
      </div>

      <div className="mb-24">
        <div className="flex items-center justify-between pb-4 border-b-2 border-blue-600 mb-8">
          <h2 className="text-2xl font-black text-gray-900 uppercase">Knowledge Base</h2>
          <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-black">{filteredArticles.length} Articles</span>
        </div>
        
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {filteredArticles.map(a => (
              <Link key={a.id} to={`/blog/${a.slug}`} className="flex flex-col gap-6 group">
                <div className="w-full h-64 overflow-hidden rounded-[2.5rem] border border-gray-100">
                  <img src={a.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 mb-3 transition-colors">{a.title}</h3>
                  <p className="text-gray-500 font-medium line-clamp-2 leading-relaxed">{a.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
             <XCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
             <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No matching articles in this cluster</p>
          </div>
        )}
      </div>

      {featuredOffer && (
        <section className="relative mt-32">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
            <span className="bg-gray-900 text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-2xl flex items-center">
              <Star className="h-4 w-4 mr-2 text-blue-400 fill-current" /> Category Premium Pick
            </span>
          </div>
          <div className="bg-blue-600 rounded-[3.5rem] p-1 shadow-2xl overflow-hidden group">
            <div className="bg-white rounded-[3.2rem] p-8 md:p-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-24 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-20 opacity-[0.03] pointer-events-none -rotate-12 translate-x-12 -translate-y-12">
                <ShoppingBag className="h-96 w-96" />
              </div>
              
              <div className="lg:w-1/2 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-6">
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {featuredOffer.type}
                  </span>
                  <span className="text-gray-400 text-xs font-bold">• Full System Access</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 leading-tight">
                  {featuredOffer.name}
                </h2>
                <p className="text-gray-500 text-xl font-medium mb-10 leading-relaxed">
                  {featuredOffer.description}
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                  <Link 
                    to={`/marketplace/${featuredOffer.id}`} 
                    className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-200 hover:bg-gray-900 transition-all flex items-center"
                  >
                    Download Blueprint <ArrowRight className="ml-3 h-5 w-5" />
                  </Link>
                  <div className="flex flex-col text-center lg:text-left">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em]">Instant Entry</span>
                    <span className="text-2xl font-black text-gray-900">₦{featuredOffer.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-1/2 w-full max-w-lg">
                <div className="relative group/img">
                  <div className="absolute -inset-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-[3rem] blur opacity-10 group-hover/img:opacity-30 transition-all duration-700"></div>
                  <img 
                    src={featuredOffer.image} 
                    className="relative w-full aspect-[4/3] object-cover rounded-[2.8rem] shadow-2xl group-hover/img:scale-[1.02] transition-transform duration-700" 
                    alt={featuredOffer.name} 
                  />
                  <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-[2rem] shadow-2xl border border-gray-50 flex items-center gap-4 animate-bounce duration-[3000ms]">
                    <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                      <Zap className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase text-gray-400">Restored</p>
                      <p className="font-bold text-gray-900">90+ Niches</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 text-center">
            <Link to="/marketplace" className="text-gray-400 hover:text-blue-600 font-bold flex items-center justify-center gap-2 group transition-colors">
              Explore the rest of the Marketplace <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export const ProductCard: React.FC<{ p: Product }> = ({ p }) => {
  return (
    <Link to={`/marketplace/${p.id}`} className="group bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={p.image} 
          alt={p.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
        />
        <div className="absolute top-4 left-4">
          <span className="px-4 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-[9px] font-black text-blue-600 uppercase tracking-widest shadow-sm">
            {p.type}
          </span>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
          {p.name}
        </h3>
        <p className="text-gray-500 text-sm mt-3 line-clamp-2 flex-grow">
          {p.description}
        </p>
        <div className="mt-6 pt-5 border-t border-gray-50 flex items-center justify-between">
          <span className="text-2xl font-black text-gray-900">
            ₦{p.price.toLocaleString()}
          </span>
          <span className="text-blue-600 font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            View Details <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
};

const MarketplaceView = () => {
  const data = getCMSData();
  const [searchQuery, setSearchQuery] = useState('');
  const sortedProducts = [...data.products].sort(sortProductsLatest);

  const filteredProducts = sortedProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-20">
      <div className="text-center mb-16 max-w-4xl mx-auto">
        <div className="flex items-center justify-center space-x-2 mb-6">
           <span className="h-px w-12 bg-gray-200"></span>
           <span className="text-blue-600 font-black text-xs uppercase tracking-[0.2em]">Global Opportunity Repository</span>
           <span className="h-px w-12 bg-gray-200"></span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 uppercase tracking-tighter leading-[0.9]">
          Premium <span className="text-blue-600">Niche</span> Depository
        </h1>
        <p className="text-gray-500 mb-10 text-xl font-medium leading-relaxed">
          Access {data.products.length} battle-tested income architectures across all major sectors. 
        </p>
        <div className="relative max-w-2xl mx-auto group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across all blueprints..."
            className="relative block w-full pl-14 pr-6 py-6 bg-white border-2 border-gray-100 rounded-3xl text-lg focus:border-blue-500 transition-all outline-none shadow-xl"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 h-6 w-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map(p => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-32 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
           <Search className="h-16 w-16 mx-auto mb-6 text-gray-300" />
           <p className="text-xl font-bold text-gray-900 uppercase tracking-widest">Zero matching blueprints detected</p>
           <button onClick={() => setSearchQuery('')} className="mt-6 text-blue-600 font-bold hover:underline">Reset Depository Scanners</button>
        </div>
      )}
    </div>
  );
};

const BlogView = () => {
  const data = getCMSData();
  const [trends, setTrends] = useState<GroundedTrend[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(false);

  const sortedArticles = [...data.articles].sort(sortArticlesLatest);

  const handleScanTrends = async () => {
    setLoadingTrends(true);
    const liveData = await fetchLiveTrends('Business');
    setTrends(liveData);
    setLoadingTrends(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
        <div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 uppercase tracking-tight">Knowledge Hub</h1>
          <p className="text-gray-500 text-xl font-medium">Free deep-dives into the latest income trends.</p>
        </div>
        <button onClick={handleScanTrends} disabled={loadingTrends} className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest flex items-center hover:bg-blue-600 transition-colors shadow-xl">
          {loadingTrends ? <Loader2 className="animate-spin mr-3 h-5 w-5" /> : <Zap className="mr-3 h-5 w-5 text-blue-400" />} Trend Scan
        </button>
      </div>

      {trends.length > 0 && (
        <section className="mb-20 bg-blue-50 p-10 rounded-[3rem] border-2 border-blue-100 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Globe className="h-32 w-32" /></div>
           <h2 className="text-2xl font-black mb-6 uppercase tracking-tight flex items-center">
             <Sparkles className="h-6 w-6 mr-3 text-blue-600" /> Real-Time Trend Insights
           </h2>
           <div className="bg-white p-8 rounded-2xl border border-blue-100 shadow-sm">
             <p className="text-gray-700 whitespace-pre-wrap leading-relaxed font-medium">{trends[0].description}</p>
           </div>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {sortedArticles.map(a => (
          <Link key={a.id} to={`/blog/${a.slug}`} className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all flex flex-col">
            <div className="h-72 overflow-hidden relative">
              <img src={a.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute bottom-4 left-4">
                <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                  {a.category}
                </span>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold group-hover:text-blue-600 transition-colors mb-4 leading-tight">{a.title}</h3>
              <p className="text-gray-500 text-sm line-clamp-2">{a.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default App;

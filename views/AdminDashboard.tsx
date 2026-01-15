
import React, { useState, useRef, useEffect } from 'react';
import { getCMSData, saveCMSData, clearAllData } from '../services/storage';
import { CategoryType, Article, Product } from '../types';
import { LayoutDashboard, FileText, ShoppingBag, Settings, Plus, Trash2, Edit2, BarChart, X, Upload, Image as ImageIcon, Link as LinkIcon, RefreshCw, CheckCircle2 } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState(getCMSData());
  const [activeTab, setActiveTab] = useState<'overview' | 'articles' | 'products' | 'settings'>('overview');
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const articleFileRef = useRef<HTMLInputElement>(null);
  const productFileRef = useRef<HTMLInputElement>(null);

  // Form States
  const [newArticle, setNewArticle] = useState<Partial<Article>>({
    title: '', slug: '', excerpt: '', content: '', category: CategoryType.BUSINESS,
    image: '', author: 'Admin', featured: false
  });

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '', slug: '', description: '', price: 0, currency: 'NGN', category: CategoryType.BUSINESS,
    type: 'Guide', image: '', features: [], targetAudience: '', problemSolved: '', downloadUrl: ''
  });

  const refreshLocalData = () => {
    setData(getCMSData());
  };

  const showSaveSuccess = () => {
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'article' | 'product') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB Limit for safety in LocalStorage
        alert("Image too large. Please use an image under 1MB for best performance.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (type === 'article') {
          setNewArticle(prev => ({ ...prev, image: base64String }));
        } else {
          setNewProduct(prev => ({ ...prev, image: base64String }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteArticle = (id: string) => {
    if (window.confirm('Delete this article permanently?')) {
      const currentData = getCMSData();
      const newData = { ...currentData, articles: currentData.articles.filter(a => a.id !== id) };
      if (saveCMSData(newData)) {
        setData(newData);
        showSaveSuccess();
      }
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Delete this product permanently?')) {
      const currentData = getCMSData();
      const newData = { ...currentData, products: currentData.products.filter(p => p.id !== id) };
      if (saveCMSData(newData)) {
        setData(newData);
        showSaveSuccess();
      }
    }
  };

  const openEditArticle = (article: Article) => {
    setEditingArticleId(article.id);
    setNewArticle(article);
    setIsArticleModalOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setNewProduct(product);
    setIsProductModalOpen(true);
  };

  const resetArticleForm = () => {
    setEditingArticleId(null);
    setNewArticle({
      title: '', slug: '', excerpt: '', content: '', category: CategoryType.BUSINESS,
      image: '', author: 'Admin', featured: false
    });
    setIsArticleModalOpen(false);
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setNewProduct({
      name: '', slug: '', description: '', price: 0, currency: 'NGN', category: CategoryType.BUSINESS,
      type: 'Guide', image: '', features: [], targetAudience: '', problemSolved: '', downloadUrl: ''
    });
    setIsProductModalOpen(false);
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    const currentData = getCMSData();
    let updatedArticles = [...currentData.articles];

    if (editingArticleId) {
      updatedArticles = updatedArticles.map(a => a.id === editingArticleId ? { ...a, ...newArticle as Article } : a);
    } else {
      updatedArticles.unshift({ ...newArticle as Article, id: Date.now().toString(), createdAt: new Date().toISOString() });
    }

    const newData = { ...currentData, articles: updatedArticles };
    if (saveCMSData(newData)) {
      setData(newData);
      showSaveSuccess();
      resetArticleForm();
    } else {
      setSaveStatus('idle');
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    const currentData = getCMSData();
    let updatedProducts = [...currentData.products];

    if (editingProductId) {
      updatedProducts = updatedProducts.map(p => p.id === editingProductId ? { ...p, ...newProduct as Product } : p);
    } else {
      updatedProducts.unshift({ ...newProduct as Product, id: Date.now().toString() });
    }

    const newData = { ...currentData, products: updatedProducts };
    if (saveCMSData(newData)) {
      setData(newData);
      showSaveSuccess();
      resetProductForm();
    } else {
      setSaveStatus('idle');
    }
  };

  const handleSettingsChange = (field: keyof typeof data.siteSettings, value: string) => {
    const currentData = getCMSData();
    const newData = {
      ...currentData,
      siteSettings: { ...currentData.siteSettings, [field]: value }
    };
    if (saveCMSData(newData)) {
      setData(newData);
      showSaveSuccess();
    }
  };

  const totalRevenue = data.products.reduce((acc, p) => acc + (p.price * 2), 0); // Mocking some sales

  const stats = [
    { label: 'Total Articles', value: data.articles.length, icon: FileText, color: 'text-blue-600' },
    { label: 'Total Products', value: data.products.length, icon: ShoppingBag, color: 'text-purple-600' },
    { label: 'Revenue (Mock)', value: `₦${totalRevenue.toLocaleString()}`, icon: BarChart, color: 'text-green-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      {/* Global Status Bar */}
      {saveStatus !== 'idle' && (
        <div className={`fixed top-20 right-8 z-[100] flex items-center px-4 py-2 rounded-full shadow-lg border transition-all ${
          saveStatus === 'saving' ? 'bg-white border-blue-100 text-blue-600' : 'bg-green-600 border-green-700 text-white'
        }`}>
          {saveStatus === 'saving' ? (
            <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Saving Changes...</>
          ) : (
            <><CheckCircle2 className="h-4 w-4 mr-2" /> Changes Saved Permanently</>
          )}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 px-4">Menu</h2>
            <nav className="space-y-1">
              {[
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'articles', label: 'Manage Content', icon: FileText },
                { id: 'products', label: 'Marketplace', icon: ShoppingBag },
                { id: 'settings', label: 'Site Settings', icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-3" />
                  {tab.label}
                </button>
              ))}
            </nav>
            <div className="mt-8 pt-4 border-t border-gray-100 px-4">
              <button 
                onClick={clearAllData}
                className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
              >
                Reset Site Data
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gray-50 ${stat.color}`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                ))}
              </div>
              
              <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Welcome back, Admin</h3>
                <p className="text-gray-500">You are managing <b>INCOMELAB</b>. Every change you make here is automatically saved to your browser and will persist across sessions.</p>
              </div>
            </div>
          )}

          {activeTab === 'articles' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Articles</h3>
                <button 
                  onClick={() => { resetArticleForm(); setIsArticleModalOpen(true); }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" /> New Article
                </button>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Title</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.articles.map((article) => (
                      <tr key={article.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-900 line-clamp-1">{article.title}</p>
                          <p className="text-xs text-gray-500">/{article.slug}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{article.category}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(article.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <button onClick={() => openEditArticle(article)} className="p-2 text-gray-400 hover:text-blue-600"><Edit2 className="h-4 w-4" /></button>
                            <button onClick={() => handleDeleteArticle(article.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Products</h3>
                <button 
                  onClick={() => { resetProductForm(); setIsProductModalOpen(true); }}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" /> New Product
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.products.map((product) => (
                  <div key={product.id} className="bg-white border border-gray-100 p-4 rounded-xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center space-x-4">
                      <img src={product.image || 'https://via.placeholder.com/150'} className="h-12 w-12 rounded-lg object-cover" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">{product.name}</p>
                        <p className="text-xs text-blue-600 font-bold">₦{product.price.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => openEditProduct(product)} className="p-2 text-gray-400 hover:text-blue-600"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h3 className="text-2xl font-bold text-gray-900">Site Settings</h3>
              <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Hero Headline</label>
                  <input 
                    type="text" 
                    value={data.siteSettings.heroTitle} 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) => handleSettingsChange('heroTitle', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Hero Sub-headline</label>
                  <textarea 
                    rows={3}
                    value={data.siteSettings.heroSubtitle} 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) => handleSettingsChange('heroSubtitle', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Banner Announcement</label>
                  <input 
                    type="text" 
                    value={data.siteSettings.announcement} 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) => handleSettingsChange('announcement', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Article Modal */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingArticleId ? 'Edit Income Guide' : 'New Income Guide'}</h2>
              <button onClick={resetArticleForm} className="p-2 hover:bg-gray-100 rounded-full"><X className="h-6 w-6"/></button>
            </div>
            <form onSubmit={handleSaveArticle} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                  <input required type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl" value={newArticle.title} onChange={e => setNewArticle({...newArticle, title: e.target.value})} placeholder="e.g., How to monetize tech skills" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Slug</label>
                  <input required type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl" value={newArticle.slug} onChange={e => setNewArticle({...newArticle, slug: e.target.value})} placeholder="monetize-tech-skills" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white" value={newArticle.category} onChange={e => setNewArticle({...newArticle, category: e.target.value as CategoryType})}>
                    <option value={CategoryType.BUSINESS}>Business</option>
                    <option value={CategoryType.TECH}>Tech</option>
                    <option value={CategoryType.DIGITAL_ASSETS}>Digital Assets</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Article Cover Image</label>
                  <div className="flex items-center space-x-4">
                    {newArticle.image ? (
                      <div className="relative group">
                        <img src={newArticle.image} className="w-20 h-20 object-cover rounded-xl border border-gray-200" />
                        <button type="button" onClick={() => setNewArticle({...newArticle, image: ''})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3"/></button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                    <button 
                      type="button" 
                      onClick={() => articleFileRef.current?.click()}
                      className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    >
                      <Upload className="h-4 w-4 mr-2" /> {newArticle.image ? 'Change Image' : 'Upload Image'}
                    </button>
                    <input ref={articleFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'article')} />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Excerpt</label>
                  <textarea required className="w-full px-4 py-2 border border-gray-200 rounded-xl" rows={2} value={newArticle.excerpt} onChange={e => setNewArticle({...newArticle, excerpt: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Content (HTML/Text)</label>
                  <textarea required className="w-full px-4 py-2 border border-gray-200 rounded-xl" rows={6} value={newArticle.content} onChange={e => setNewArticle({...newArticle, content: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={resetArticleForm} className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={saveStatus === 'saving'} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center">
                  {saveStatus === 'saving' ? <RefreshCw className="h-5 w-5 animate-spin mr-2"/> : null}
                  {editingArticleId ? 'Update Guide Permanently' : 'Publish Guide Permanently'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingProductId ? 'Edit Info Product' : 'New Info Product'}</h2>
              <button onClick={resetProductForm} className="p-2 hover:bg-gray-100 rounded-full"><X className="h-6 w-6"/></button>
            </div>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Name</label>
                  <input required type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="The Digital Asset Blueprint" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (₦)</label>
                  <input required type="number" className="w-full px-4 py-2 border border-gray-200 rounded-xl" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white" value={newProduct.type} onChange={e => setNewProduct({...newProduct, type: e.target.value as any})}>
                    <option value="Guide">Guide</option>
                    <option value="Course">Course</option>
                    <option value="Toolkit">Toolkit</option>
                    <option value="Roadmap">Roadmap</option>
                    <option value="Ebook">Ebook</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Image</label>
                  <div className="flex items-center space-x-4">
                    {newProduct.image ? (
                      <div className="relative group">
                        <img src={newProduct.image} className="w-20 h-20 object-cover rounded-xl border border-gray-200" />
                        <button type="button" onClick={() => setNewProduct({...newProduct, image: ''})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3"/></button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                    <button 
                      type="button" 
                      onClick={() => productFileRef.current?.click()}
                      className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    >
                      <Upload className="h-4 w-4 mr-2" /> {newProduct.image ? 'Change Image' : 'Upload Image'}
                    </button>
                    <input ref={productFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'product')} />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                  <textarea required className="w-full px-4 py-2 border border-gray-200 rounded-xl" rows={3} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Download Material URL (After Payment)</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input required type="url" className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl" value={newProduct.downloadUrl} onChange={e => setNewProduct({...newProduct, downloadUrl: e.target.value})} placeholder="https://example.com/files/product.pdf" />
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={resetProductForm} className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={saveStatus === 'saving'} className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center">
                  {saveStatus === 'saving' ? <RefreshCw className="h-5 w-5 animate-spin mr-2"/> : null}
                  {editingProductId ? 'Update Product Permanently' : 'Create Product Permanently'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

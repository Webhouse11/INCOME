
import React, { useState, useEffect, useRef } from 'react';
import { 
  getCMSData, 
  clearAllData, 
  getIntegrityReport, 
  restoreAllData, 
  toggleItemLock, 
  updateItemWithSnapshot,
  rollbackToVersion,
  deleteItemWithGuard
} from '../services/storage.ts';
import { CategoryType, Article, Product, CMSData, LogEntry } from '../types.ts';
import { 
  LayoutDashboard, FileText, ShoppingBag, Plus, Trash2, Edit2, 
  X, RefreshCw, CheckCircle2, Shield, History, Terminal,
  Lock, Unlock, ShieldAlert, SearchCode, ShieldQuestion,
  User, Activity as Heartbeat, Download, Eye, Image as ImageIcon,
  DollarSign, Tag, Layers, ShieldCheck, Save, ShoppingCart, Upload, Loader2, Link as LinkIcon
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<CMSData>(getCMSData());
  const [activeTab, setActiveTab] = useState<'overview' | 'articles' | 'products' | 'audit'>('overview');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [report, setReport] = useState(getIntegrityReport());
  const [historyDrawer, setHistoryDrawer] = useState<{ id: string; type: string } | null>(null);

  // Modals state
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formArticle, setFormArticle] = useState<Partial<Article>>({});
  const [formProduct, setFormProduct] = useState<Partial<Product>>({});

  const articleFileRef = useRef<HTMLInputElement>(null);
  const productFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      const d = await getCMSData();
      setData({ ...d });
      setReport(getIntegrityReport());
    };
    load();
    
    const interval = setInterval(() => {
      if (activeTab === 'audit' || activeTab === 'overview') {
        const d = getCMSData();
        setData({ ...d });
        setReport(getIntegrityReport());
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [saveStatus, activeTab]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'article' | 'product') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Please select a file smaller than 2MB.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (target === 'article') {
        setFormArticle(prev => ({ ...prev, image: base64String }));
      } else {
        setFormProduct(prev => ({ ...prev, image: base64String }));
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert("Failed to read file.");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleToggleLock = async (type: 'article' | 'product', id: string) => {
    setSaveStatus('saving');
    await toggleItemLock(type, id);
    setData({ ...getCMSData() });
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleDelete = async (type: 'article' | 'product', id: string) => {
    if (window.confirm("Move to archive? You can restore this from history later.")) {
      setSaveStatus('saving');
      const success = await deleteItemWithGuard(type, id);
      if (success) {
        setData({ ...getCMSData() });
        setSaveStatus('saved');
      } else {
        setSaveStatus('idle');
      }
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    const id = editingId || `art-${Date.now()}`;
    const slug = formArticle.title?.toLowerCase().replace(/ /g, '-') || `art-${Date.now()}`;
    const success = await updateItemWithSnapshot('article', id, { ...formArticle, slug });
    if (success) {
      setData({ ...getCMSData() });
      setSaveStatus('saved');
      setIsArticleModalOpen(false);
    }
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    const id = editingId || `prod-${Date.now()}`;
    const slug = formProduct.name?.toLowerCase().replace(/ /g, '-') || `prod-${Date.now()}`;
    const success = await updateItemWithSnapshot('product', id, { ...formProduct, slug, currency: 'NGN' });
    if (success) {
      setData({ ...getCMSData() });
      setSaveStatus('saved');
      setIsProductModalOpen(false);
    }
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleRollback = async (id: string, index: number) => {
    if (window.confirm("Rollback to this specific version?")) {
      setSaveStatus('saving');
      await rollbackToVersion(id, index);
      setData({ ...getCMSData() });
      setSaveStatus('saved');
      setHistoryDrawer(null);
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const getLogLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'SUCCESS': return 'text-green-400';
      case 'WARNING': return 'text-orange-400';
      case 'ERROR': return 'text-red-400';
      case 'RECOVERY': return 'text-blue-400 font-bold';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative bg-white min-h-screen">
      {/* Persistence Toast */}
      {saveStatus !== 'idle' && (
        <div className={`fixed top-24 right-8 z-[100] flex items-center px-6 py-3 rounded-2xl shadow-2xl border animate-in slide-in-from-right-10 duration-300 ${
          saveStatus === 'saving' ? 'bg-white border-blue-100 text-blue-600' : 'bg-gray-900 border-gray-800 text-white'
        }`}>
          {saveStatus === 'saving' ? <RefreshCw className="h-4 w-4 mr-3 animate-spin" /> : <ShieldCheck className="h-4 w-4 mr-3 text-blue-400" />}
          <span className="text-xs font-black uppercase tracking-widest">{saveStatus === 'saving' ? 'Writing Snapshot' : 'Persistence Confirmed'}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-10">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-72 flex-shrink-0">
          <div className="bg-gray-50 border border-gray-100 rounded-[2.5rem] p-6 sticky top-24 shadow-sm">
            <div className="flex items-center gap-3 px-2 mb-10">
              <div className="h-12 w-12 bg-gray-900 rounded-[1rem] flex items-center justify-center text-white">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-tighter leading-tight">Workspace<br/>Guard</h2>
                <p className="text-[9px] text-green-600 font-black uppercase mt-0.5 flex items-center gap-1">
                  <span className="h-1 w-1 bg-green-500 rounded-full animate-pulse"></span> Active
                </p>
              </div>
            </div>
            
            <nav className="space-y-1">
              {[
                { id: 'overview', label: 'System Health', icon: LayoutDashboard },
                { id: 'articles', label: 'Knowledge Vault', icon: FileText },
                { id: 'products', label: 'Market Inventory', icon: ShoppingBag },
                { id: 'audit', label: 'Diagnostic Log', icon: Terminal },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center px-4 py-4 text-sm font-bold rounded-2xl transition-all ${
                    activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-gray-500 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-3" />
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="mt-10 p-6 bg-white rounded-3xl border border-gray-100">
               <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Integrity</span>
                  <span className={`text-[10px] font-black uppercase ${report.healthScore > 80 ? 'text-green-600' : 'text-orange-600'}`}>{report.healthScore}%</span>
               </div>
               <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${report.healthScore > 80 ? 'bg-blue-600' : 'bg-orange-500'}`} style={{ width: `${report.healthScore}%` }}></div>
               </div>
               <p className="text-[9px] text-gray-400 font-medium mt-3 text-center">Last Scan: {new Date(report.lastVerified || '').toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white p-8 border border-gray-100 rounded-[2.5rem] shadow-sm">
                    <Heartbeat className="h-8 w-8 text-blue-600 mb-6" />
                    <p className="text-4xl font-black text-gray-900">{report.healthScore}%</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Stability Matrix</p>
                 </div>
                 <div className="bg-white p-8 border border-gray-100 rounded-[2.5rem] shadow-sm">
                    <History className="h-8 w-8 text-purple-600 mb-6" />
                    <p className="text-4xl font-black text-gray-900">{report.totalBackups}</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Historical Nodes</p>
                 </div>
                 <div className="bg-white p-8 border border-gray-100 rounded-[2.5rem] shadow-sm">
                    <Lock className="h-8 w-8 text-red-600 mb-6" />
                    <p className="text-4xl font-black text-gray-900">
                      {data.articles.filter(a => a.isLocked).length + data.products.filter(p => p.isLocked).length}
                    </p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Protected Files</p>
                 </div>
              </div>

              {report.riskCount > 0 && (
                <div className="bg-orange-50 border border-orange-100 rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-10">
                   <div className="h-20 w-20 bg-orange-600 text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-orange-200 shrink-0">
                      <ShieldAlert className="h-10 w-10" />
                   </div>
                   <div className="grow">
                      <h3 className="text-2xl font-black text-orange-900 uppercase tracking-tighter">System Stability Alert</h3>
                      <p className="text-orange-700 font-medium mt-1 leading-relaxed">Workspace drift detected: {report.riskCount} Core Baseline files are currently UNLOCKED. Stabilization recommended.</p>
                      <button onClick={() => restoreAllData()} className="mt-6 px-8 py-3 bg-orange-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-orange-700 shadow-lg shadow-orange-200">Global Stabilization</button>
                   </div>
                </div>
              )}

              <div className="bg-gray-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Terminal className="h-64 w-64" /></div>
                 <div className="flex items-center gap-4 mb-8">
                    <SearchCode className="h-8 w-8 text-blue-400" />
                    <h3 className="text-3xl font-black uppercase tracking-tighter">Diagnostic Summary</h3>
                 </div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <p className="text-gray-400 leading-relaxed text-lg">Synced with system baseline. Persistence layer active.</p>
                       <ul className="space-y-4">
                          <li className="flex items-center text-sm font-bold text-gray-300">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" /> Baseline Verification: OK
                          </li>
                          <li className="flex items-center text-sm font-bold text-gray-300">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" /> Snapshot Pruning Engine: ACTIVE
                          </li>
                       </ul>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 font-mono text-[10px] text-gray-400 space-y-2 max-h-[250px] overflow-hidden">
                       <div className="flex justify-between border-b border-white/10 pb-2 mb-4">
                          <span className="text-blue-400 uppercase font-black">Event Feed</span>
                          <span className="opacity-50">STABLE</span>
                       </div>
                       {report.logs.slice(0, 8).map((log, i) => (
                         <div key={i} className="flex gap-4">
                            <span className="opacity-30">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                            <span className={getLogLevelColor(log.level)}>{log.level}</span>
                            <span className="truncate">{log.message}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'articles' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div className="flex justify-between items-center px-4">
                 <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Knowledge Vault</h3>
                 <button onClick={() => { setEditingId(null); setFormArticle({ category: CategoryType.BUSINESS, author: 'Admin' }); setIsArticleModalOpen(true); }} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center shadow-xl shadow-blue-100"><Plus className="h-5 w-5 mr-2" /> Register Article</button>
               </div>
               <div className="bg-gray-50 border border-gray-100 rounded-[3rem] p-4 overflow-hidden">
                 <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <tr>
                          <th className="px-8 py-8">Title & Source</th>
                          <th className="px-8 py-8">Category</th>
                          <th className="px-8 py-8">Security</th>
                          <th className="px-8 py-8 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {data.articles.map(a => (
                          <tr key={a.id} className="group hover:bg-white transition-all">
                            <td className="px-8 py-8">
                              <p className="text-sm font-black text-gray-900">{a.title}</p>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${a.source === 'system' ? 'bg-blue-50 text-blue-500' : 'bg-purple-50 text-purple-500'}`}>{a.source || 'user'}</span>
                            </td>
                            <td className="px-8 py-8">
                              <span className="text-xs font-bold text-gray-500">{a.category}</span>
                            </td>
                            <td className="px-8 py-8">
                              <button onClick={() => handleToggleLock('article', a.id)} className={`p-2 rounded-xl transition-all ${a.isLocked ? 'text-red-600 bg-red-50' : 'text-gray-300 bg-gray-100'}`}>
                                {a.isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                              </button>
                            </td>
                            <td className="px-8 py-8 text-right space-x-2">
                              <button onClick={() => setHistoryDrawer({ id: a.id, type: 'article' })} className="p-3 text-gray-400 hover:text-blue-600"><History className="h-5 w-5"/></button>
                              <button disabled={a.isLocked} onClick={() => { setEditingId(a.id); setFormArticle(a); setIsArticleModalOpen(true); }} className="p-3 text-gray-400 hover:text-gray-900 disabled:opacity-20"><Edit2 className="h-5 w-5"/></button>
                              <button disabled={a.isLocked} onClick={() => handleDelete('article', a.id)} className="p-3 text-gray-400 hover:text-red-600 disabled:opacity-20"><Trash2 className="h-5 w-5"/></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                  </table>
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div className="flex justify-between items-center px-4">
                 <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Market Inventory</h3>
                 <button onClick={() => { setEditingId(null); setFormProduct({ category: CategoryType.BUSINESS, type: 'Blueprint', price: 0 }); setIsProductModalOpen(true); }} className="px-8 py-4 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center shadow-xl shadow-purple-100"><Plus className="h-5 w-5 mr-2" /> Register Product</button>
               </div>
               <div className="bg-gray-50 border border-gray-100 rounded-[3rem] p-4 overflow-hidden">
                 <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <tr>
                          <th className="px-8 py-8">Name & Type</th>
                          <th className="px-8 py-8">Price</th>
                          <th className="px-8 py-8">Security</th>
                          <th className="px-8 py-8 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {data.products.map(p => (
                          <tr key={p.id} className="group hover:bg-white transition-all">
                            <td className="px-8 py-8">
                              <p className="text-sm font-black text-gray-900">{p.name}</p>
                              <span className="text-[9px] font-black uppercase text-gray-400">{p.type}</span>
                            </td>
                            <td className="px-8 py-8">
                              <span className="text-sm font-black text-green-600">₦{p.price.toLocaleString()}</span>
                            </td>
                            <td className="px-8 py-8">
                              <button onClick={() => handleToggleLock('product', p.id)} className={`p-2 rounded-xl transition-all ${p.isLocked ? 'text-red-600 bg-red-50' : 'text-gray-300 bg-gray-100'}`}>
                                {p.isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                              </button>
                            </td>
                            <td className="px-8 py-8 text-right space-x-2">
                              <button onClick={() => setHistoryDrawer({ id: p.id, type: 'product' })} className="p-3 text-gray-400 hover:text-blue-600"><History className="h-5 w-5"/></button>
                              <button disabled={p.isLocked} onClick={() => { setEditingId(p.id); setFormProduct(p); setIsProductModalOpen(true); }} className="p-3 text-gray-400 hover:text-gray-900 disabled:opacity-20"><Edit2 className="h-5 w-5"/></button>
                              <button disabled={p.isLocked} onClick={() => handleDelete('product', p.id)} className="p-3 text-gray-400 hover:text-red-600 disabled:opacity-20"><Trash2 className="h-5 w-5"/></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                  </table>
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-6 animate-in fade-in duration-500 h-full">
               <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Diagnostic Log</h3>
               <div className="bg-gray-950 rounded-[3rem] p-10 border border-gray-800 shadow-2xl h-[600px] font-mono overflow-y-auto">
                  {report.logs.length === 0 ? (
                    <div className="text-center py-32 opacity-20"><ShieldQuestion className="h-16 w-16 mx-auto mb-6" /><p className="text-2xl font-black uppercase tracking-widest">Empty Feed</p></div>
                  ) : (
                    report.logs.map((log, i) => (
                      <div key={i} className="flex flex-col md:flex-row md:items-start gap-4 p-4 hover:bg-white/5 rounded-2xl transition-all border-l-2 border-transparent hover:border-blue-500 mb-2">
                        <span className="text-[10px] text-gray-600 font-bold uppercase w-32">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className={`text-[10px] font-black uppercase w-24 ${getLogLevelColor(log.level)}`}>{log.level}</span>
                        <span className="grow text-sm text-gray-300">[{log.source}] {log.message}</span>
                      </div>
                    ))
                  )}
               </div>
            </div>
          )}
        </div>
      </div>

      {/* History Drawer */}
      {historyDrawer && (
        <div className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm flex justify-end">
           <div className="w-full max-w-xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 p-12 overflow-y-auto">
              <div className="flex justify-between items-center mb-12">
                 <h3 className="text-3xl font-black uppercase tracking-tighter">Snapshots</h3>
                 <button onClick={() => setHistoryDrawer(null)} className="p-4 hover:bg-gray-100 rounded-[1.5rem]"><X className="h-8 w-8 text-gray-400" /></button>
              </div>
              <div className="space-y-6">
                 {!(data.backups?.[historyDrawer.id]) ? (
                   <div className="text-center py-32"><History className="h-16 w-16 text-gray-100 mx-auto mb-4" /><p className="text-gray-400 text-sm font-bold uppercase">No Snapshots</p></div>
                 ) : (
                   data.backups[historyDrawer.id].map((snap, i) => (
                     <div key={i} className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                           <span className="text-[10px] font-black text-gray-900 uppercase">Version {snap.version || 1}</span>
                           <span className="text-[9px] text-gray-400 font-bold">{new Date(snap.snapshotAt).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-6 italic leading-relaxed line-clamp-3">"{snap.excerpt || snap.description || snap.title}"</p>
                        <button onClick={() => handleRollback(historyDrawer.id, i)} className="w-full py-4 bg-white border-2 border-gray-100 text-[10px] font-black uppercase text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">Rollback to this state</button>
                     </div>
                   )).reverse()
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Article Modal */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 z-[200] bg-gray-900/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-3xl rounded-[3rem] p-12 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black uppercase tracking-tighter">{editingId ? 'Edit Article' : 'New Article'}</h2>
                <button onClick={() => setIsArticleModalOpen(false)}><X className="h-8 w-8 text-gray-400" /></button>
              </div>
              <form onSubmit={handleSaveArticle} className="space-y-8">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Title</label>
                       <input required className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold" value={formArticle.title || ''} onChange={e => setFormArticle({...formArticle, title: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Category</label>
                       <select className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold" value={formArticle.category} onChange={e => setFormArticle({...formArticle, category: e.target.value as CategoryType})}>
                          {Object.values(CategoryType).map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Excerpt</label>
                    <textarea required className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-medium h-24" value={formArticle.excerpt || ''} onChange={e => setFormArticle({...formArticle, excerpt: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Content (Markdown/HTML Support)</label>
                    <textarea required className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-mono text-sm h-64" value={formArticle.content || ''} onChange={e => setFormArticle({...formArticle, content: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Visual Asset (URL or Upload)</label>
                    <div className="flex flex-col gap-4">
                       <div className="flex gap-4">
                          <input className="grow px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold" value={formArticle.image || ''} placeholder="https://..." onChange={e => setFormArticle({...formArticle, image: e.target.value})} />
                          <button type="button" onClick={() => articleFileRef.current?.click()} className="px-6 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-blue-600 transition-colors">
                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload
                          </button>
                          <input type="file" ref={articleFileRef} hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'article')} />
                       </div>
                       {formArticle.image && (
                         <div className="relative w-full h-40 rounded-3xl overflow-hidden border border-gray-100">
                           <img src={formArticle.image} className="w-full h-full object-cover" />
                           <button type="button" onClick={() => setFormArticle({...formArticle, image: ''})} className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full shadow-xl"><X className="h-4 w-4" /></button>
                         </div>
                       )}
                    </div>
                 </div>
                 <button type="submit" className="w-full py-6 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl hover:bg-blue-700 transition-all text-lg flex items-center justify-center gap-3">
                    <Save className="h-6 w-6" /> Commit to Vault
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[200] bg-gray-900/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-3xl rounded-[3rem] p-12 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black uppercase tracking-tighter">{editingId ? 'Edit Product' : 'New Product'}</h2>
                <button onClick={() => setIsProductModalOpen(false)}><X className="h-8 w-8 text-gray-400" /></button>
              </div>
              <form onSubmit={handleSaveProduct} className="space-y-8">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Name</label>
                       <input required className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold" value={formProduct.name || ''} onChange={e => setFormProduct({...formProduct, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Category</label>
                       <select className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold" value={formProduct.category} onChange={e => setFormProduct({...formProduct, category: e.target.value as CategoryType})}>
                          {Object.values(CategoryType).map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Price (NGN)</label>
                       <div className="relative">
                          <input type="number" required className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold" value={formProduct.price || 0} onChange={e => setFormProduct({...formProduct, price: parseInt(e.target.value)})} />
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Type</label>
                       <select className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold" value={formProduct.type} onChange={e => setFormProduct({...formProduct, type: e.target.value as any})}>
                          {['Ebook', 'Course', 'Template', 'Guide', 'Toolkit', 'Roadmap', 'Blueprint'].map(t => <option key={t} value={t}>{t}</option>)}
                       </select>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Short Description</label>
                    <textarea required className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-medium h-24" value={formProduct.description || ''} onChange={e => setFormProduct({...formProduct, description: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Material Download URL (Secure Link)</label>
                    <div className="relative">
                       <input className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-blue-600" value={formProduct.downloadUrl || ''} placeholder="https://example.com/secure-download" onChange={e => setFormProduct({...formProduct, downloadUrl: e.target.value})} />
                       <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Users will receive this link instantly upon payment confirmation.</p>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Product Image (URL or Upload)</label>
                    <div className="flex flex-col gap-4">
                       <div className="flex gap-4">
                          <div className="grow relative">
                             <input className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold" value={formProduct.image || ''} placeholder="https://..." onChange={e => setFormProduct({...formProduct, image: e.target.value})} />
                             <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          </div>
                          <button type="button" onClick={() => productFileRef.current?.click()} className="px-6 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-purple-600 transition-colors">
                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload
                          </button>
                          <input type="file" ref={productFileRef} hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'product')} />
                       </div>
                       {formProduct.image && (
                         <div className="relative w-full h-40 rounded-3xl overflow-hidden border-2 border-purple-100">
                           <img src={formProduct.image} className="w-full h-full object-cover" />
                           <button type="button" onClick={() => setFormProduct({...formProduct, image: ''})} className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full shadow-xl"><X className="h-4 w-4" /></button>
                         </div>
                       )}
                    </div>
                 </div>
                 <button type="submit" className="w-full py-6 bg-purple-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl hover:bg-purple-700 transition-all text-lg flex items-center justify-center gap-3">
                    <ShoppingCart className="h-6 w-6" /> Save Product Node
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

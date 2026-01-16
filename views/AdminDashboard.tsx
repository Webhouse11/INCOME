
import React, { useState, useEffect } from 'react';
import { 
  getCMSData, 
  saveCMSData, 
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
  LayoutDashboard, FileText, ShoppingBag, Settings, Plus, Trash2, Edit2, 
  X, RefreshCw, CheckCircle2, Shield, AlertTriangle, Database, Activity, 
  History, RotateCcw, FileWarning, Search, Cpu, Lock, Unlock, ShieldAlert,
  ChevronRight, ArrowRight, Save, Info, AlertCircle, ShieldCheck, Terminal,
  HardDrive, Download, Eye, ArrowUpCircle, User, Activity as Heartbeat,
  SearchCode, ShieldQuestion
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<CMSData>(getCMSData());
  const [activeTab, setActiveTab] = useState<'overview' | 'articles' | 'products' | 'persistence' | 'audit'>('overview');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [report, setReport] = useState(getIntegrityReport());
  const [historyDrawer, setHistoryDrawer] = useState<{ id: string; type: string } | null>(null);

  // Modals state
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formArticle, setFormArticle] = useState<Partial<Article>>({});
  const [formProduct, setFormProduct] = useState<Partial<Product>>({});

  useEffect(() => {
    const load = async () => {
      const d = await getCMSData();
      setData({ ...d });
      setReport(getIntegrityReport());
    };
    load();
    
    // Auto-refresh logs if audit is open
    const interval = setInterval(() => {
      if (activeTab === 'audit' || activeTab === 'overview') {
        const d = getCMSData();
        setData({ ...d });
        setReport(getIntegrityReport());
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [saveStatus, activeTab]);

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
    const success = await updateItemWithSnapshot('article', id, formArticle);
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
    const success = await updateItemWithSnapshot('product', id, formProduct);
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
      {/* Toast */}
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
                  <span className="h-1 w-1 bg-green-500 rounded-full animate-pulse"></span> Protected
                </p>
              </div>
            </div>
            
            <nav className="space-y-1">
              {[
                { id: 'overview', label: 'System Health', icon: LayoutDashboard },
                { id: 'articles', label: 'Knowledge Vault', icon: FileText },
                { id: 'products', label: 'Market Inventory', icon: ShoppingBag },
                { id: 'persistence', label: 'Storage Guard', icon: Database },
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
                  <div 
                    className={`h-full transition-all duration-1000 ${report.healthScore > 80 ? 'bg-blue-600' : 'bg-orange-500'}`} 
                    style={{ width: `${report.healthScore}%` }}
                  ></div>
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
                      <p className="text-orange-700 font-medium mt-1 leading-relaxed">Workspace drift detected: {report.riskCount} Core Baseline files are currently UNLOCKED and at risk of accidental modification. Stabilization recommended.</p>
                      <button 
                        onClick={() => restoreAllData()}
                        className="mt-6 px-8 py-3 bg-orange-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-orange-700 shadow-lg shadow-orange-200"
                      >
                        Global Workspace Stabilization
                      </button>
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
                       <p className="text-gray-400 leading-relaxed text-lg">Your IncomeLab Workspace is currently synced with the system-level baseline. No unauthorized deletion attempts detected since last audit.</p>
                       <ul className="space-y-4">
                          <li className="flex items-center text-sm font-bold text-gray-300">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" /> Baseline Verification: OK
                          </li>
                          <li className="flex items-center text-sm font-bold text-gray-300">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" /> Snapshot Pruning Engine: ACTIVE
                          </li>
                          <li className="flex items-center text-sm font-bold text-gray-300">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" /> hardware Persistence Lock: ENABLED
                          </li>
                       </ul>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 font-mono text-[10px] text-gray-400 space-y-2 max-h-[250px] overflow-hidden">
                       <div className="flex justify-between border-b border-white/10 pb-2 mb-4">
                          <span className="text-blue-400 uppercase font-black">Live Event Feed</span>
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

          {activeTab === 'audit' && (
            <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">System Diagnostic Log</h3>
                  <button onClick={() => window.print()} className="px-6 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase hover:bg-gray-200 transition-all flex items-center">
                    <Download className="h-4 w-4 mr-2" /> Export Audit Report
                  </button>
               </div>
               
               <div className="bg-gray-950 rounded-[3rem] p-10 border border-gray-800 shadow-2xl grow font-mono overflow-y-auto max-h-[700px]">
                  <div className="space-y-3">
                     {report.logs.length === 0 ? (
                       <div className="text-center py-32 opacity-20">
                          <ShieldQuestion className="h-16 w-16 mx-auto mb-6" />
                          <p className="text-2xl font-black uppercase tracking-widest">No Log Data Recorded</p>
                       </div>
                     ) : (
                       report.logs.map((log, i) => (
                        <div key={i} className="flex flex-col md:flex-row md:items-start gap-2 md:gap-10 p-4 hover:bg-white/5 rounded-2xl transition-colors border-l-2 border-transparent hover:border-blue-500">
                           <div className="md:w-32 flex-shrink-0 text-[10px] text-gray-600 font-bold uppercase">
                              {new Date(log.timestamp).toLocaleString().split(',')[1]}
                           </div>
                           <div className={`md:w-24 flex-shrink-0 text-[10px] font-black uppercase tracking-widest ${getLogLevelColor(log.level)}`}>
                              {log.level}
                           </div>
                           <div className="grow text-sm text-gray-300">
                              <span className="text-blue-600 mr-2">[{log.source}]</span> {log.message}
                           </div>
                        </div>
                       ))
                     )}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'articles' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div className="flex justify-between items-center px-4">
                 <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Knowledge Repository</h3>
                 <button onClick={() => { setEditingId(null); setFormArticle({}); setIsArticleModalOpen(true); }} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center shadow-xl shadow-blue-100"><Plus className="h-5 w-5 mr-2" /> Register Entry</button>
               </div>
               <div className="bg-gray-50 border border-gray-100 rounded-[3rem] p-4">
                 <table className="w-full text-left">
                    <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <tr>
                        <th className="px-8 py-8">Reference ID & Title</th>
                        <th className="px-8 py-8">Security Layer</th>
                        <th className="px-8 py-8 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.articles.map(a => (
                        <tr key={a.id} className="group hover:bg-white rounded-3xl transition-all">
                          <td className="px-8 py-8">
                            <p className="text-sm font-black text-gray-900">{a.title}</p>
                            <div className="flex items-center gap-3 mt-2">
                               <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">VER {a.version || 1}</span>
                               <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${a.source === 'system' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>{a.source || 'user'} Node</span>
                            </div>
                          </td>
                          <td className="px-8 py-8">
                             <button 
                              onClick={() => handleToggleLock('article', a.id)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                a.isLocked ? 'bg-red-50 text-red-600 border-red-100 shadow-sm' : 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-white hover:text-gray-900'
                              }`}
                             >
                               {a.isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                               {a.isLocked ? 'Protected' : 'Unlocked'}
                             </button>
                          </td>
                          <td className="px-8 py-8 text-right space-x-2">
                             <button onClick={() => setHistoryDrawer({ id: a.id, type: 'article' })} className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><History className="h-5 w-5"/></button>
                             <button disabled={a.isLocked} onClick={() => { setEditingId(a.id); setFormArticle(a); setIsArticleModalOpen(true); }} className="p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all disabled:opacity-20"><Edit2 className="h-5 w-5"/></button>
                             <button disabled={a.isLocked} onClick={() => handleDelete('article', a.id)} className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-20"><Trash2 className="h-5 w-5"/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
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
                 <div>
                   <h3 className="text-3xl font-black uppercase tracking-tighter">Snapshot Explorer</h3>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Timeline for Data Node: {historyDrawer.id}</p>
                 </div>
                 <button onClick={() => setHistoryDrawer(null)} className="p-4 hover:bg-gray-100 rounded-[1.5rem] transition-all"><X className="h-8 w-8 text-gray-400" /></button>
              </div>
              
              <div className="space-y-8">
                 {!(data.backups?.[historyDrawer.id]) ? (
                   <div className="text-center py-32 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                      <History className="h-20 w-20 text-gray-200 mx-auto mb-6" />
                      <p className="text-gray-400 text-sm font-black uppercase tracking-widest">No historical states detected.</p>
                   </div>
                 ) : (
                   data.backups[historyDrawer.id].map((snap, i) => (
                     <div key={i} className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 relative group hover:border-blue-200 transition-all hover:bg-white hover:shadow-2xl">
                        <div className="flex justify-between items-start mb-6">
                           <div className="flex items-center gap-3">
                             <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                             <p className="text-xs font-black text-gray-900 uppercase">Snapshot #{i + 1}</p>
                           </div>
                           <p className="text-[10px] text-gray-400 font-bold bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">{new Date(snap.snapshotAt || snap.snapshotAt).toLocaleString()}</p>
                        </div>
                        <div className="space-y-4 mb-8">
                           <p className="text-sm font-bold text-gray-700 line-clamp-3 italic opacity-60 leading-relaxed">"{snap.excerpt || snap.description || snap.title}"</p>
                           <div className="flex items-center gap-6 text-[9px] font-black uppercase text-gray-400">
                             <span className="flex items-center gap-2"><User className="h-4 w-4" /> {snap.author || 'System Operator'}</span>
                             <span className="flex items-center gap-2"><ArrowUpCircle className="h-4 w-4" /> Version {snap.version || 1}</span>
                           </div>
                        </div>
                        <button 
                          onClick={() => handleRollback(historyDrawer.id, i)}
                          className="w-full py-4 bg-white border-2 border-gray-100 text-[10px] font-black uppercase tracking-widest text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                        >
                          Perform Snapshot Rollback
                        </button>
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
                <h2 className="text-3xl font-black uppercase tracking-tighter">{editingId ? 'Modify Strategy Node' : 'Register New Knowledge'}</h2>
                <button onClick={() => setIsArticleModalOpen(false)}><X className="h-8 w-8 text-gray-400" /></button>
              </div>
              <form onSubmit={handleSaveArticle} className="space-y-8">
                 <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Node Title</label>
                   <input required className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-[1.5rem] outline-none transition-all font-bold text-lg" value={formArticle.title || ''} onChange={e => setFormArticle({...formArticle, title: e.target.value})} />
                 </div>
                 <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Primary Content Buffer (HTML Enabled)</label>
                   <textarea rows={10} required className="w-full px-8 py-6 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-[1.5rem] outline-none transition-all text-sm leading-relaxed font-medium" value={formArticle.content || ''} onChange={e => setFormArticle({...formArticle, content: e.target.value})} />
                 </div>
                 <button type="submit" className="w-full py-6 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all text-lg">Commit To Vault & Snapshot</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { 
  getCMSData, 
  initializeCMSData,
  updateItem,
  hardDeleteItems,
  restoreAllData
} from '../services/storage.ts';
import { Article, Product, CMSData, LogEntry, CategoryType } from '../types.ts';
import { 
  FileText, ShoppingBag, Plus, Trash2, Edit2, 
  Shield, Terminal, ShieldCheck, Loader2, 
  CheckSquare, Square, RefreshCw, X, Save, AlertOctagon
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<CMSData>(getCMSData());
  const [activeTab, setActiveTab] = useState<'articles' | 'products' | 'audit'>('articles');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'article' | 'product'>('article');
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    // Force direct refresh from authority source
    const refreshData = async () => {
      const d = await initializeCMSData();
      setData(d);
    };
    refreshData();
  }, [saveStatus, activeTab]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectTopN = (type: 'article' | 'product', n: number) => {
    const list = type === 'article' ? data.articles : data.products;
    const next = new Set<string>();
    list.slice(0, n).forEach(i => next.add(i.id));
    setSelectedIds(next);
  };

  const handlePurgeSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`PERMANENT PURGE: Vaporize ${selectedIds.size} records?`)) return;
    
    setSaveStatus('saving');
    const success = await hardDeleteItems(activeTab as any, Array.from(selectedIds));
    
    if (success) {
      setSaveStatus('saved');
      setSelectedIds(new Set());
      setTimeout(() => setSaveStatus('idle'), 400);
    } else {
      setSaveStatus('idle');
    }
  };

  const handleSingleDelete = async (type: 'article' | 'product', id: string) => {
    setSaveStatus('saving');
    const success = await hardDeleteItems(type, [id]);
    if (success) {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 400);
    } else {
      setSaveStatus('idle');
    }
  };

  const openEditModal = (item: any, type: 'article' | 'product') => {
    setModalType(type);
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    setSaveStatus('saving');
    const success = await updateItem(modalType, editingItem.id, editingItem);
    if (success) {
      setSaveStatus('saved');
      setIsModalOpen(false);
      setEditingItem(null);
      setTimeout(() => setSaveStatus('idle'), 400);
    } else {
      setSaveStatus('idle');
    }
  };

  const getLogLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'SUCCESS': return 'text-green-400';
      case 'WARNING': return 'text-orange-400';
      case 'ERROR': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative bg-white min-h-screen pb-32 font-sans">
      {/* PERSISTENCE INDICATOR */}
      {saveStatus !== 'idle' && (
        <div className="fixed top-24 right-8 z-[200] flex items-center px-6 py-3 bg-gray-900 text-white rounded-2xl shadow-2xl animate-in slide-in-from-right-10">
          {saveStatus === 'saving' ? <Loader2 className="h-4 w-4 mr-3 animate-spin text-blue-400" /> : <ShieldCheck className="h-4 w-4 mr-3 text-green-400" />}
          <span className="text-[10px] font-black uppercase tracking-widest">{saveStatus === 'saving' ? 'Writing Hard' : 'Authority Sync Complete'}</span>
        </div>
      )}

      {/* BULK ACTION BAR */}
      {selectedIds.size > 0 && (activeTab === 'articles' || activeTab === 'products') && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg px-4">
          <div className="bg-gray-900 text-white p-5 rounded-[2rem] shadow-2xl flex items-center justify-between border border-gray-700">
            <div className="ml-4">
              <p className="text-sm font-black uppercase tracking-widest">{selectedIds.size} Targeted</p>
              <p className="text-[9px] text-red-400 font-bold uppercase">Irreversible Purge Ready</p>
            </div>
            <button 
              onClick={handlePurgeSelected}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg"
            >
              PERMANENT PURGE
            </button>
          </div>
        </div>
      )}

      {/* EDITING MODAL */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h4 className="text-xl font-black uppercase tracking-tighter text-gray-900 flex items-center gap-2">
                  <Edit2 className="h-5 w-5 text-blue-600" /> Direct Edit
                </h4>
                <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase">Target UID: {editingItem.id}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="h-6 w-6 text-gray-400" /></button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-6">
              {modalType === 'article' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Article Title</label>
                    <input type="text" value={editingItem.title} onChange={(e) => setEditingItem({...editingItem, title: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Slug</label>
                      <input type="text" value={editingItem.slug} onChange={(e) => setEditingItem({...editingItem, slug: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Category</label>
                      <select value={editingItem.category} onChange={(e) => setEditingItem({...editingItem, category: e.target.value as CategoryType})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm">
                        <option value={CategoryType.BUSINESS}>Business</option>
                        <option value={CategoryType.TECH}>Tech</option>
                        <option value={CategoryType.DIGITAL_ASSETS}>Digital Assets</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Excerpt</label>
                    <textarea rows={2} value={editingItem.excerpt} onChange={(e) => setEditingItem({...editingItem, excerpt: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Raw Content</label>
                    <textarea rows={6} value={editingItem.content} onChange={(e) => setEditingItem({...editingItem, content: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-medium text-sm outline-none" />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Product Name</label>
                    <input type="text" value={editingItem.name} onChange={(e) => setEditingItem({...editingItem, name: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Price</label>
                      <input type="number" value={editingItem.price} onChange={(e) => setEditingItem({...editingItem, price: Number(e.target.value)})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Asset Category</label>
                      <select value={editingItem.category} onChange={(e) => setEditingItem({...editingItem, category: e.target.value as CategoryType})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm">
                        <option value={CategoryType.BUSINESS}>Business</option>
                        <option value={CategoryType.TECH}>Tech</option>
                        <option value={CategoryType.DIGITAL_ASSETS}>Digital Assets</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Description</label>
                    <textarea rows={4} value={editingItem.description} onChange={(e) => setEditingItem({...editingItem, description: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-medium text-sm outline-none" />
                  </div>
                </>
              )}
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4">
              <button onClick={handleSaveEdit} className="flex-grow flex items-center justify-center gap-2 px-8 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-blue-200">
                <Save className="h-4 w-4" /> Hard Persist
              </button>
              <button onClick={() => setIsModalOpen(false)} className="px-8 py-5 bg-white text-gray-400 font-black uppercase text-xs tracking-widest rounded-2xl border border-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-10">
        {/* SIDEBAR NAVIGATION */}
        <div className="w-full md:w-72 flex-shrink-0">
          <div className="bg-gray-50 border border-gray-100 rounded-[2.5rem] p-6 sticky top-24 shadow-sm">
            <div className="flex items-center gap-3 px-2 mb-10">
              <div className="h-12 w-12 bg-gray-900 rounded-[1.2rem] flex items-center justify-center text-white shadow-lg">
                <Shield className="h-6 w-6" />
              </div>
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-tighter leading-tight">Master<br/>Override</h2>
            </div>
            <nav className="space-y-1">
              {[
                { id: 'articles', label: 'Depository', icon: FileText },
                { id: 'products', label: 'Vault', icon: ShoppingBag },
                { id: 'audit', label: 'Terminal', icon: Terminal },
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center px-4 py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-gray-400 hover:bg-white hover:text-gray-900'}`}>
                  <tab.icon className="h-4 w-4 mr-4" /> {tab.label}
                </button>
              ))}
              <div className="pt-10">
                <button onClick={() => restoreAllData()} className="w-full flex items-center px-4 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl text-red-400 hover:bg-red-50 transition-colors">
                  <RefreshCw className="h-4 w-4 mr-4" /> Wipe & Reset
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-grow">
          <div className="space-y-6">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
               <div>
                  <h3 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">
                    {activeTab === 'articles' ? 'Depository' : activeTab === 'products' ? 'Vault' : 'Registry Logs'}
                  </h3>
                  {activeTab !== 'audit' && (
                    <div className="flex gap-4 mt-2">
                      <button onClick={() => selectTopN(activeTab === 'articles' ? 'article' : 'product', 65)} className="text-[10px] font-bold uppercase text-blue-600 hover:text-blue-700">Target Top 65</button>
                      <button onClick={() => setSelectedIds(new Set())} className="text-[10px] font-bold uppercase text-gray-400">Clear Targeting</button>
                    </div>
                  )}
               </div>
               {activeTab !== 'audit' && (
                 <button className="px-6 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center shadow-lg hover:bg-gray-800 transition-colors">
                   <Plus className="h-4 w-4 mr-2" /> Inject Entry
                 </button>
               )}
             </div>

             {activeTab !== 'audit' && (
               <div className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-xl">
                  <table className="w-full text-left">
                      <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <tr>
                          <th className="px-8 py-5 w-10"></th>
                          <th className="px-8 py-5">Intel Record</th>
                          <th className="px-8 py-5">Source</th>
                          <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(activeTab === 'articles' ? data.articles : data.products).map((item: any) => (
                          <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.has(item.id) ? 'bg-red-50/30' : ''}`}>
                            <td className="px-8 py-6">
                               <button onClick={() => toggleSelect(item.id)} className={`p-1 transition-all ${selectedIds.has(item.id) ? 'text-red-500' : 'text-gray-200 hover:text-gray-400'}`}>
                                 {selectedIds.has(item.id) ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                               </button>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <img src={item.image} className="h-10 w-10 rounded-xl object-cover border border-gray-100" />
                                <div className="max-w-md">
                                  <p className="text-sm font-black text-gray-900 truncate">{item.title || item.name}</p>
                                  <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest">{item.category}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 uppercase font-bold text-[9px] text-gray-400 italic">
                              {item.source || 'ROOT'}
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex justify-end gap-1">
                                <button onClick={() => openEditModal(item, activeTab === 'articles' ? 'article' : 'product')} className="p-3 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 className="h-4 w-4"/></button>
                                <button onClick={() => handleSingleDelete(activeTab === 'articles' ? 'article' : 'product', item.id)} className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="h-4 w-4"/></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                  </table>
                  {(activeTab === 'articles' ? data.articles : data.products).length === 0 && (
                    <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs flex flex-col items-center">
                      <AlertOctagon className="h-10 w-10 mb-4 opacity-20" /> Registry Empty
                    </div>
                  )}
               </div>
             )}

             {activeTab === 'audit' && (
               <div className="bg-gray-900 rounded-[2.5rem] p-10 font-mono text-[11px] text-gray-300 max-h-[650px] overflow-y-auto shadow-2xl border border-gray-800">
                  {data.logs.map((log, i) => (
                    <div key={i} className="mb-3 flex gap-6 border-b border-gray-800 pb-3">
                      <span className="opacity-30">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                      <span className={`font-black uppercase tracking-widest w-24 ${getLogLevelColor(log.level)}`}>{log.level}</span>
                      <span className="opacity-80">{log.message}</span>
                      <span className="ml-auto opacity-20 uppercase">{log.source}</span>
                    </div>
                  ))}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

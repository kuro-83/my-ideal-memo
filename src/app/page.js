"use client";
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// --- アイコンコンポーネント ---
const Icon = ({ type, className = "w-5 h-5" }) => {
  const style = { strokeWidth: "2" };
  if (type === 'write') return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" {...style} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
  if (type === 'timeline') return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" {...style} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
  if (type === 'garden') return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" {...style} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
  if (type === 'settings') return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" {...style} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" {...style} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
  if (type === 'pin') return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" {...style} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>;
  if (type === 'copy') return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" {...style} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>;
  if (type === 'more') return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" {...style} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>;
  return null;
};

export default function MemoApp() {
  const [memos, setMemos] = useState([]);
  const [activeTab, setActiveTab] = useState('write');
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [menuOpenId, setMenuOpenId] = useState(null);
  
  const [writeInput, setWriteInput] = useState("");
  const [gardenInput, setGardenInput] = useState("");
  const [gardenTitle, setGardenTitle] = useState("");
  const [editId, setEditId] = useState(null);
  const [editInput, setEditInput] = useState("");
  const [selectedColor, setSelectedColor] = useState({ bg: 'bg-blue-50', border: 'border-blue-200', bar: 'bg-blue-300' });

  // メニューを外側クリックで閉じるための設定
  useEffect(() => {
    const closeMenu = () => setMenuOpenId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const fetchMemos = async () => {
    const { data } = await supabase.from('memos').select('*').order('is_pinned', { ascending: false }).order('date', { ascending: false });
    setMemos(data || []);
  };

  useEffect(() => { fetchMemos(); }, []);

  const formatMemoDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')} ${(date.getHours()).toString().padStart(2,'0')}:${(date.getMinutes()).toString().padStart(2,'0')}`;
  };

  const addMemo = async (type) => {
    const isGarden = type === 'seed';
    const text = isGarden ? gardenInput : writeInput;
    if (!text.trim()) return;
    
    const { error } = await supabase.from('memos').insert([{ 
      text, 
      color: isGarden ? 'bg-emerald-300' : selectedColor.bar, 
      category: type,
      title: isGarden ? gardenTitle : null 
    }]);
    
    if (!error) { setWriteInput(""); setGardenInput(""); setGardenTitle(""); fetchMemos(); }
  };

  const deleteMemo = async (id) => {
    if (confirm("このメモを削除しますか？")) {
      await supabase.from('memos').delete().eq('id', id);
      fetchMemos();
    }
  };

  const togglePin = async (memo) => {
    await supabase.from('memos').update({ is_pinned: !memo.is_pinned }).eq('id', memo.id);
    fetchMemos();
  };

  const saveEdit = async (id) => {
    await supabase.from('memos').update({ text: editInput }).eq('id', id);
    setEditId(null);
    fetchMemos();
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
  };

  const toggleExpand = (id) => {
    const newIds = new Set(expandedIds);
    if (newIds.has(id)) newIds.delete(id);
    else newIds.add(id);
    setExpandedIds(newIds);
  };

  const normalMemos = memos.filter(m => m.category === 'normal');
  const gardenMemos = memos.filter(m => m.category === 'seed');
  const todayMemos = normalMemos.filter(m => new Date(m.date).toDateString() === new Date().toDateString());

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-600 font-sans pb-24">
      
      {/* --- ヘッダー・ナビ --- */}
      <header className="pt-8 text-center bg-white border-b border-gray-100 sticky top-0 z-20">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">memo</h1>
        <p className="text-[10px] text-emerald-500 font-bold tracking-[0.2em] mt-1 uppercase">Stay and reflect</p>

        <nav className="flex justify-center gap-1 mt-6">
          {[
            { id: 'write', icon: 'write' },
            { id: 'timeline', icon: 'timeline' },
            { id: 'garden', icon: 'garden' },
            { id: 'settings', icon: 'settings' }
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={(e) => { e.stopPropagation(); setActiveTab(tab.id); }} 
              className={`p-3 px-6 rounded-t-xl transition-all ${activeTab === tab.id ? 'bg-[#f2f2f2] text-gray-800' : 'text-gray-200 hover:text-gray-400'}`}
            >
              <Icon type={tab.icon} />
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-xl mx-auto px-4 mt-6">
        
        {/* --- 📝 書くタブ --- */}
        {activeTab === 'write' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white border border-gray-100 rounded-[32px] py-6 flex flex-col items-center mb-6 shadow-sm">
              <span className="text-4xl font-light text-gray-800">{todayMemos.length}</span>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Today's Memo</p>
            </div>

            <div className="flex gap-2 mb-4">
              {[
                { bg: 'bg-blue-50', border: 'border-blue-200', bar: 'bg-blue-300' }, 
                { bg: 'bg-red-50', border: 'border-red-200', bar: 'bg-red-300' }, 
                { bg: 'bg-yellow-50', border: 'border-yellow-200', bar: 'bg-yellow-300' }, 
                { bg: 'bg-green-50', border: 'border-green-200', bar: 'bg-green-300' }, 
                { bg: 'bg-purple-50', border: 'border-purple-200', bar: 'bg-purple-300' }
              ].map((c, index) => (
                <button key={index} onClick={() => setSelectedColor(c)} className={`w-10 h-6 rounded-full border ${c.bg} ${c.border} ${selectedColor.bar === c.bar ? 'ring-2 ring-offset-2 ring-gray-100 scale-110' : 'opacity-40 hover:opacity-100'}`} />
              ))}
            </div>

            <div className={`border-2 rounded-2xl p-4 bg-white shadow-sm transition-all ${selectedColor.border}`}>
              <textarea className="w-full h-40 border-none focus:ring-0 outline-none resize-none text-base placeholder-gray-200 bg-transparent" placeholder="今の気づきを..." value={writeInput} onChange={(e) => setWriteInput(e.target.value)} />
            </div>

            <button onClick={() => addMemo('normal')} disabled={!writeInput.trim()} className={`w-full mt-4 py-4 rounded-2xl font-bold transition-all ${writeInput.trim() ? 'bg-emerald-400 text-white shadow-md hover:bg-emerald-500' : 'bg-gray-100 text-gray-300'}`}>
              メモを追加する
            </button>
          </div>
        )}

        {/* --- 📜 タイムラインタブ --- */}
        {activeTab === 'timeline' && (
          <div className="space-y-4 animate-in fade-in duration-500">
             {normalMemos.map((memo) => {
               const isExpanded = expandedIds.has(memo.id);
               const shouldShowReadMore = memo.text.length > 100 || memo.text.split('\n').length > 3;

               return (
                 <div key={memo.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm relative flex flex-col">
                    {/* 左側のカラーバー */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${memo.color || 'bg-blue-300'}`} />
                    
                    {/* 右上のピン表示（常に表示） */}
                    {memo.is_pinned && <div className="absolute top-0 right-0 p-2 text-emerald-500"><Icon type="pin" className="w-3 h-3 fill-current" /></div>}

                    {/* 本文エリア */}
                    <div className="flex-grow">
                      {editId === memo.id ? (
                        <div className="mt-2">
                          <textarea className="w-full bg-gray-50 p-3 rounded-xl text-sm focus:ring-0 outline-none border border-gray-100 h-24" value={editInput} onChange={(e) => setEditInput(e.target.value)} />
                          <div className="flex justify-end gap-3 mt-2">
                            <button onClick={() => setEditId(null)} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cancel</button>
                            <button onClick={() => saveEdit(memo.id)} className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Save</button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className={`text-sm text-gray-700 leading-relaxed whitespace-pre-wrap ${!isExpanded ? 'line-clamp-3' : ''}`}>
                            {memo.text}
                          </p>
                          {shouldShowReadMore && (
                            <button onClick={() => toggleExpand(memo.id)} className="text-xs text-emerald-500 font-bold mt-1 hover:underline">
                              {isExpanded ? '閉じる' : '続きを読む'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 下部：日付とアクション（余白を詰めた mt-2 pt-2） */}
                    <div className="flex justify-between items-end mt-2 pt-2 border-t border-gray-50">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-300 font-bold tracking-wider">{formatMemoDate(memo.date)}</span>
                        <button onClick={() => copyText(memo.text)} className="text-gray-200 hover:text-emerald-500 transition-colors" title="コピー">
                          <Icon type="copy" className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-4 relative">
                        <button onClick={() => togglePin(memo)} className={`${memo.is_pinned ? 'text-emerald-500' : 'text-gray-200'} hover:text-emerald-500 transition-colors`}>
                          <Icon type="pin" className="w-4 h-4" />
                        </button>
                        
                        {/* Moreボタンとドロップダウン */}
                        <div className="relative">
                          <button onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === memo.id ? null : memo.id); }} className="text-gray-200 hover:text-gray-400">
                            <Icon type="more" className="w-4 h-4" />
                          </button>
                          {menuOpenId === memo.id && (
                            <div className="absolute right-0 top-full mt-2 w-28 bg-white border border-gray-100 rounded-xl shadow-xl z-30 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                              <button onClick={() => {setEditId(memo.id); setEditInput(memo.text);}} className="w-full text-left px-4 py-2.5 text-[11px] font-bold hover:bg-gray-50 flex items-center gap-2 text-gray-600">
                                編集
                              </button>
                              <button onClick={() => deleteMemo(memo.id)} className="w-full text-left px-4 py-2.5 text-[11px] font-bold hover:bg-red-50 text-red-400 flex items-center gap-2 border-t border-gray-50">
                                削除
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                 </div>
               );
             })}
          </div>
        )}

        {/* --- 🌿 育てるタブ --- */}
        {activeTab === 'garden' && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-8 bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
              <input className="w-full bg-transparent border-none focus:ring-0 font-bold text-gray-700 placeholder-gray-200 text-lg" placeholder="育てるものの名前" value={gardenTitle} onChange={(e) => setGardenTitle(e.target.value)} />
              <textarea className="w-full bg-transparent border-none focus:ring-0 text-sm mt-2 h-24 placeholder-gray-200 resize-none" placeholder="ここへ大切にしたい言葉を..." value={gardenInput} onChange={(e) => setGardenInput(e.target.value)} />
              <div className="flex justify-end mt-4">
                <button onClick={() => addMemo('seed')} disabled={!gardenInput.trim()} className="bg-emerald-400 text-white px-8 py-2 rounded-full text-xs font-bold shadow-md hover:bg-emerald-500 transition-all">種をまく</button>
              </div>
            </div>

            <div className="grid gap-4">
              {gardenMemos.map((memo) => (
                <div key={memo.id} className="bg-white border-l-4 border-emerald-300 rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-gray-800">{memo.title || "Untitled"}</h3>
                    <button onClick={() => deleteMemo(memo.id)} className="text-gray-200 hover:text-red-300"><Icon type="more" className="w-4 h-4" /></button>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">{memo.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- ⚙️ 設定タブ --- */}
        {activeTab === 'settings' && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Color Customization</h2>
              <p className="text-sm text-gray-600 mb-4">お好みのカラーを細かく調整できるよう準備中です。</p>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-300 shadow-inner" />
                <div className="w-10 h-10 rounded-xl bg-red-300 shadow-inner" />
                <div className="w-10 h-10 rounded-xl bg-yellow-300 shadow-inner" />
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">App Information</h2>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Version</span>
                <span>1.2.0</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
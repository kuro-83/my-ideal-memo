"use client";
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// --- アイコン ---
const Icon = ({ type, className = "w-5 h-5" }) => {
  const style = { strokeWidth: "2" };
  if (type === 'write') return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" {...style} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
  if (type === 'timeline') return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" {...style} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
  if (type === 'garden') return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" {...style} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
  if (type === 'pin') return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" {...style} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>;
  if (type === 'copy') return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" {...style} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>;
  if (type === 'more') return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" {...style} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>;
  return null;
};

export default function MemoApp() {
  const [memos, setMemos] = useState([]);
  const [activeTab, setActiveTab] = useState('write');
  const [expandedIds, setExpandedIds] = useState(new Set()); // 複数展開用
  const [menuOpenId, setMenuOpenId] = useState(null); // ...メニュー用
  
  const [writeInput, setWriteInput] = useState("");
  const [gardenInput, setGardenInput] = useState("");
  const [gardenTitle, setGardenTitle] = useState("");
  const [showSeedForm, setShowSeedForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editInput, setEditInput] = useState("");
  const [selectedColor, setSelectedColor] = useState({ bg: 'bg-blue-50', border: 'border-blue-200' });

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
    const { error } = await supabase.from('memos').insert([{ text, color: isGarden ? 'bg-emerald-50' : selectedColor.bg, category: type, title: isGarden ? gardenTitle : null }]);
    if (!error) { setWriteInput(""); setGardenInput(""); setGardenTitle(""); setShowSeedForm(false); fetchMemos(); }
  };

  const deleteMemo = async (id) => {
    if (confirm("このメモを削除しますか？")) {
      await supabase.from('memos').delete().eq('id', id);
      setMenuOpenId(null);
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
    setMenuOpenId(null);
    fetchMemos();
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    // ポップアップは出さないが、一瞬だけ成功したことがわかるようにしたい場合はここに処理を追加
  };

  const toggleExpand = (id) => {
    const newIds = new Set(expandedIds);
    if (newIds.has(id)) newIds.delete(id);
    else newIds.add(id);
    setExpandedIds(newIds);
  };

  const gardenMemos = memos.filter(m => m.category === 'seed');
  const normalMemos = memos.filter(m => m.category !== 'seed');
  const todayMemos = normalMemos.filter(m => new Date(m.date).toDateString() === new Date().toDateString());

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-600 font-sans pb-20">
      
      {/* --- ヘッダー --- */}
      <header className="pt-8 text-center bg-white border-b border-gray-100">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">memo</h1>
        <p className="text-[10px] text-emerald-500 font-bold tracking-[0.2em] mt-1 uppercase">Stay and reflect</p>

        <nav className="flex justify-center gap-2 mt-6">
          {['write', 'timeline', 'garden'].map((tab) => (
            <button key={tab} onClick={() => {setActiveTab(tab); setEditId(null); setMenuOpenId(null);}} className={`p-3 px-8 rounded-t-xl transition-all ${activeTab === tab ? 'bg-[#f2f2f2] text-gray-800' : 'text-gray-200'}`}>
              <Icon type={tab} />
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-xl mx-auto px-4 mt-6">
        
        {/* --- 📝 書くタブ --- */}
        {activeTab === 'write' && (
          <div className="animate-in fade-in">
            <div className="bg-white border border-gray-100 rounded-[32px] py-6 flex flex-col items-center mb-6 shadow-sm">
              <span className="text-4xl font-light text-gray-800">{todayMemos.length}</span>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Today's Reflection</p>
              <p className="text-[10px] text-emerald-500 mt-1 font-bold">Total {normalMemos.length}🍃</p>
            </div>

            <div className="flex gap-2 mb-4">
              {[{ bg: 'bg-blue-50', border: 'border-blue-200' }, { bg: 'bg-red-50', border: 'border-red-200' }, { bg: 'bg-yellow-50', border: 'border-yellow-200' }, { bg: 'bg-green-50', border: 'border-green-200' }, { bg: 'bg-purple-50', border: 'border-purple-200' }].map((c, index) => (
                <button key={index} onClick={() => setSelectedColor(c)} className={`w-10 h-6 rounded-full border ${c.bg} ${c.border} ${selectedColor.bg === c.bg ? 'ring-2 ring-offset-2 ring-gray-100 scale-110' : 'opacity-40'}`} />
              ))}
            </div>

            <div className={`border-2 rounded-2xl p-4 bg-white shadow-sm transition-all ${selectedColor.border}`}>
              <textarea className="w-full h-40 border-none focus:ring-0 outline-none resize-none text-base placeholder-gray-200 bg-transparent" placeholder="今の気づきを..." value={writeInput} onChange={(e) => setWriteInput(e.target.value)} />
            </div>

            <button onClick={() => addMemo('normal')} disabled={!writeInput.trim()} className={`w-full mt-4 py-4 rounded-2xl font-bold transition-all ${writeInput.trim() ? 'bg-emerald-400 text-white shadow-md' : 'bg-gray-100 text-gray-300'}`}>メモを追加する</button>
          </div>
        )}

        {/* --- 📜 タイムラインタブ --- */}
        {activeTab === 'timeline' && (
          <div className="space-y-4 animate-in fade-in">
             {normalMemos.map((memo) => {
               const isExpanded = expandedIds.has(memo.id);
               return (
                 <div key={memo.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col min-h-[120px]">
                    {/* 左端のカラーバー */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${memo.color.replace('-50', '-300')}`} />
                    
                    {/* 右上のピンマーク */}
                    {memo.is_pinned && <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-50 text-emerald-500 flex items-center justify-center rounded-bl-xl"><Icon type="pin" className="w-3 h-3" /></div>}

                    {/* 本文エリア */}
                    <div className="flex-grow pr-4">
                      {editId === memo.id ? (
                        <div className="mt-2">
                          <textarea className="w-full bg-gray-50 p-3 rounded-xl text-sm focus:ring-0 outline-none border border-gray-100" value={editInput} onChange={(e) => setEditInput(e.target.value)} />
                          <div className="flex justify-end gap-3 mt-2">
                            <button onClick={() => setEditId(null)} className="text-[10px] font-bold text-gray-400">キャンセル</button>
                            <button onClick={() => saveEdit(memo.id)} className="text-[10px] font-bold text-emerald-500">保存</button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className={`text-sm text-gray-700 leading-relaxed whitespace-pre-wrap ${!isExpanded ? 'line-clamp-3' : ''}`}>
                            {memo.text}
                          </p>
                          {memo.text.split('\n').length > 3 && (
                            <button onClick={() => toggleExpand(memo.id)} className="text-xs text-emerald-500 font-bold mt-2 hover:opacity-70">
                              {isExpanded ? '閉じる' : '続きを読む'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 下部：日付とアクション */}
                    <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-300 font-bold tracking-wider">{formatMemoDate(memo.date)}</span>
                        <button onClick={() => copyText(memo.text)} className="text-gray-300 hover:text-emerald-500 transition-colors" title="コピー">
                          <Icon type="copy" className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <button onClick={() => togglePin(memo)} className={`${memo.is_pinned ? 'text-emerald-500' : 'text-gray-200'} hover:text-emerald-500 transition-colors`}>
                          <Icon type="pin" className="w-4 h-4" />
                        </button>
                        
                        {/* メニュー（編集・削除） */}
                        <div className="relative">
                          <button onClick={() => setMenuOpenId(menuOpenId === memo.id ? null : memo.id)} className="text-gray-200 hover:text-gray-400">
                            <Icon type="more" className="w-4 h-4" />
                          </button>
                          {menuOpenId === memo.id && (
                            <div className="absolute right-0 bottom-8 w-24 bg-white border border-gray-100 rounded-xl shadow-xl z-10 py-1 animate-in slide-in-from-bottom-2">
                              <button onClick={() => {setEditId(memo.id); setEditInput(memo.text); setMenuOpenId(null);}} className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 flex items-center gap-2">
                                <Icon type="write" className="w-3 h-3 text-orange-400" /> 編集
                              </button>
                              <button onClick={() => deleteMemo(memo.id)} className="w-full text-left px-4 py-2 text-xs hover:bg-red-50 text-red-400 flex items-center gap-2 font-bold">
                                <Icon type="delete" className="w-3 h-3" /> 削除
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
          <div className="animate-in fade-in">
            <div className="flex justify-between items-end border-b border-gray-100 pb-2 mb-6">
              <div className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">My Garden</div>
              <button onClick={() => setShowSeedForm(!showSeedForm)} className="text-xs text-emerald-500 font-bold hover:opacity-70 transition-all">
                {showSeedForm ? '× Close' : '+ New Seed'}
              </button>
            </div>
            
            {showSeedForm && (
              <div className="mb-8 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <input className="w-full bg-transparent border-none focus:ring-0 font-bold text-gray-700 placeholder-gray-200" placeholder="リストのタイトル" value={gardenTitle} onChange={(e) => setGardenTitle(e.target.value)} />
                <textarea className="w-full bg-transparent border-none focus:ring-0 text-sm mt-2 h-24 placeholder-gray-200 resize-none" placeholder="ここへ大切にしたい言葉を..." value={gardenInput} onChange={(e) => setGardenInput(e.target.value)} />
                <div className="flex justify-end mt-2">
                  <button onClick={() => addMemo('seed')} className="bg-emerald-400 text-white px-6 py-2 rounded-full text-xs font-bold shadow-md">種をまく</button>
                </div>
              </div>
            )}

            <div className="grid gap-3">
              {gardenMemos.map((memo) => (
                <div key={memo.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:border-emerald-100 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800">{memo.title}</h3>
                    <button onClick={() => deleteMemo(memo.id)} className="text-gray-100 group-hover:text-red-300 transition-colors"><Icon type="delete" className="w-3 h-3" /></button>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">{memo.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
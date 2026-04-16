"use client";
import React, { useState, useEffect } from 'react';
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
  if (type === 'pin') return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" {...style} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>;
  if (type === 'copy') return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" {...style} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>;
  if (type === 'settings') return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" {...style} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" {...style} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
  if (type === 'delete') return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" {...style} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
  return null;
};

export default function MemoApp() {
  const [memos, setMemos] = useState([]);
  const [activeTab, setActiveTab] = useState('write');
  const [dateMode, setDateMode] = useState('relative'); // 'normal' or 'relative'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // 入力・編集状態
  const [writeInput, setWriteInput] = useState("");
  const [gardenInput, setGardenInput] = useState("");
  const [gardenTitle, setGardenTitle] = useState("");
  const [showSeedForm, setShowSeedForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editInput, setEditInput] = useState("");
  const [selectedColor, setSelectedColor] = useState({ bg: 'bg-blue-50', border: 'border-blue-200' });

  // データ取得
  const fetchMemos = async () => {
    const { data } = await supabase.from('memos').select('*').order('is_pinned', { ascending: false }).order('date', { ascending: false });
    setMemos(data || []);
  };

  useEffect(() => { fetchMemos(); }, []);

  // 日付フォーマット関数
  const formatMemoDate = (dateStr) => {
    const date = new Date(dateStr);
    if (dateMode === 'relative') {
      const now = new Date();
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return "今日 " + date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
      if (diffDays === 1) return "昨日";
      if (diffDays < 7) return `${diffDays}日前`;
      if (diffDays < 30) return `${Math.floor(diffDays/7)}週間前`;
    }
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // アクション系
  const addMemo = async (type) => {
    const isGarden = type === 'seed';
    const text = isGarden ? gardenInput : writeInput;
    if (!text.trim()) return;
    const { error } = await supabase.from('memos').insert([{ text, color: isGarden ? 'bg-white' : selectedColor.bg, category: type, title: isGarden ? gardenTitle : null }]);
    if (!error) { setWriteInput(""); setGardenInput(""); setGardenTitle(""); setShowSeedForm(false); fetchMemos(); }
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
    alert("コピーしました！");
  };

  const gardenMemos = memos.filter(m => m.category === 'seed');
  const normalMemos = memos.filter(m => m.category !== 'seed');
  const todayMemos = normalMemos.filter(m => new Date(m.date).toDateString() === new Date().toDateString());

  return (
    <div className="min-h-screen bg-white text-gray-600 font-sans pb-20">
      
      {/* --- ヘッダー & 設定 --- */}
      <header className="pt-8 text-center relative">
        <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="absolute right-6 top-8 text-gray-300 hover:text-emerald-500">
          <Icon type="settings" />
        </button>
        
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">memo</h1>
        <p className="text-[10px] text-emerald-500 font-bold tracking-[0.2em] mt-1 uppercase">Stay and reflect</p>

        {isSettingsOpen && (
          <div className="mx-auto max-w-xs mt-4 p-4 bg-gray-50 rounded-2xl text-left animate-in fade-in zoom-in duration-200">
            <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase">Design Settings</p>
            <label className="flex items-center justify-between text-xs cursor-pointer">
              <span>日付の表示形式</span>
              <select value={dateMode} onChange={(e) => setDateMode(e.target.value)} className="bg-white border-none text-[10px] rounded-lg focus:ring-0">
                <option value="normal">通常 (4月16日)</option>
                <option value="relative">相対 (昨日・2日前)</option>
              </select>
            </label>
          </div>
        )}

        <nav className="flex justify-center gap-2 mt-6">
          {['write', 'timeline', 'garden'].map((tab) => (
            <button key={tab} onClick={() => {setActiveTab(tab); setEditId(null);}} className={`p-3 px-8 rounded-t-xl transition-all ${activeTab === tab ? 'bg-[#f2f2f2] text-gray-800' : 'text-gray-200'}`}>
              <Icon type={tab} />
            </button>
          ))}
        </nav>
        <div className="border-b border-gray-100 mx-auto max-w-xl"></div>
      </header>

      <main className="max-w-xl mx-auto px-6 mt-6">
        
        {/* --- 📝 書くタブ --- */}
        {activeTab === 'write' && (
          <div className="animate-in fade-in duration-500">
            <div className="bg-white border border-gray-100 rounded-[32px] py-6 flex flex-col items-center mb-6 shadow-sm">
              <span className="text-4xl font-light text-gray-800">{todayMemos.length}</span>
              <p className="text-[10px] text-gray-400 font-bold">今日のメモ / 累計 {normalMemos.length}</p>
            </div>

            <div className="flex gap-2 mb-4">
              {[{ bg: 'bg-blue-50', border: 'border-blue-200' }, { bg: 'bg-red-50', border: 'border-red-200' }, { bg: 'bg-yellow-50', border: 'border-yellow-200' }, { bg: 'bg-green-50', border: 'border-green-200' }, { bg: 'bg-purple-50', border: 'border-purple-200' }].map((c, index) => (
                <button key={index} onClick={() => setSelectedColor(c)} className={`w-10 h-6 rounded-full border ${c.bg} ${c.border} ${selectedColor.bg === c.bg ? 'ring-2 ring-offset-2 ring-gray-100 scale-110' : 'opacity-40'}`} />
              ))}
            </div>

            <div className={`border-2 rounded-2xl p-4 bg-white ${selectedColor.border}`}>
              <textarea className="w-full h-32 border-none focus:ring-0 outline-none resize-none text-base placeholder-gray-200 bg-transparent" placeholder="今の気づきを..." value={writeInput} onChange={(e) => setWriteInput(e.target.value)} />
            </div>

            <button onClick={() => addMemo('normal')} disabled={!writeInput.trim()} className={`w-full mt-4 py-4 rounded-2xl font-bold transition-all ${writeInput.trim() ? 'bg-[#98c9b6] text-white' : 'bg-gray-50 text-gray-200'}`}>メモを追加する</button>
          </div>
        )}

        {/* --- 📜 タイムラインタブ --- */}
        {activeTab === 'timeline' && (
          <div className="space-y-4 animate-in fade-in">
             {normalMemos.map((memo) => (
               <div key={memo.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm relative group overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${memo.color.replace('-50', '-300')}`} />
                  
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] text-gray-300 font-bold tracking-tighter uppercase">{formatMemoDate(memo.date)}</span>
                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => togglePin(memo)} className={`${memo.is_pinned ? 'text-emerald-500' : 'text-gray-200'} hover:text-emerald-500`}><Icon type="pin" className="w-4 h-4" /></button>
                      <button onClick={() => copyText(memo.text)} className="text-gray-200 hover:text-blue-400"><Icon type="copy" className="w-4 h-4" /></button>
                      <button onClick={() => {setEditId(memo.id); setEditInput(memo.text);}} className="text-gray-200 hover:text-orange-400"><Icon type="write" className="w-4 h-4" /></button>
                      <button onClick={() => deleteMemo(memo.id)} className="text-gray-200 hover:text-red-400"><Icon type="delete" className="w-4 h-4" /></button>
                    </div>
                  </div>

                  {editId === memo.id ? (
                    <div className="mt-2">
                      <textarea className="w-full bg-gray-50 p-3 rounded-xl text-sm focus:ring-0 outline-none" value={editInput} onChange={(e) => setEditInput(e.target.value)} />
                      <div className="flex justify-end gap-2 mt-2">
                        <button onClick={() => setEditId(null)} className="text-[10px] font-bold text-gray-400">キャンセル</button>
                        <button onClick={() => saveEdit(memo.id)} className="text-[10px] font-bold text-emerald-500">保存</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{memo.text}</p>
                  )}
                  {memo.is_pinned && <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-50 text-emerald-500 flex items-center justify-center rounded-bl-xl"><Icon type="pin" className="w-3 h-3" /></div>}
               </div>
             ))}
          </div>
        )}

        {/* --- 🌿 育てるタブ --- */}
        {activeTab === 'garden' && (
          <div className="animate-in fade-in">
            <div className="flex justify-between items-end border-b border-gray-100 pb-2 mb-6">
              <div className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">My Garden</div>
              <button onClick={() => setShowSeedForm(!showSeedForm)} className="text-xs text-emerald-500 font-bold">{showSeedForm ? '× Close' : '+ New Seed'}</button>
            </div>
            
            {showSeedForm && (
              <div className="mb-8 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <input className="w-full bg-transparent border-none focus:ring-0 font-bold text-gray-700 placeholder-gray-200" placeholder="タイトル" value={gardenTitle} onChange={(e) => setGardenTitle(e.target.value)} />
                <textarea className="w-full bg-transparent border-none focus:ring-0 text-sm mt-2 h-20 placeholder-gray-200" placeholder="内容..." value={gardenInput} onChange={(e) => setGardenInput(e.target.value)} />
                <div className="flex justify-end mt-2"><button onClick={() => addMemo('seed')} className="bg-emerald-400 text-white px-6 py-2 rounded-full text-xs font-bold">種をまく</button></div>
              </div>
            )}

            <div className="grid gap-3">
              {gardenMemos.map((memo) => (
                <div key={memo.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-gray-800">{memo.title}</h3>
                    <button onClick={() => deleteMemo(memo.id)} className="text-gray-100 hover:text-red-400 transition-colors"><Icon type="delete" className="w-3 h-3" /></button>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{memo.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
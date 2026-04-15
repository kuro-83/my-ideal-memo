"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function MemoApp() {
  const [memos, setMemos] = useState([]);
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState('write');
  const [selectedColor, setSelectedColor] = useState({ 
    name: '穏やか', 
    bg: 'bg-blue-50', 
    border: 'border-blue-200',
    text: 'text-blue-500'
  });

  const colors = [
    { name: '穏やか', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-500' },
    { name: '仕事', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-500' },
    { name: '人間関係', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-500' },
    { name: '自分', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-500' },
    { name: 'ネタ', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-500' },
  ];

  const fetchMemos = async () => {
    const { data } = await supabase.from('memos').select('*').order('date', { ascending: false });
    setMemos(data || []);
  };

  useEffect(() => { fetchMemos(); }, []);

  const addMemo = async () => {
    if (!input.trim()) return;
    const { error } = await supabase.from('memos').insert([{
      text: input,
      color: selectedColor.bg,
      category: selectedColor.name // カテゴリ名も保存
    }]);
    if (!error) {
      setInput("");
      fetchMemos();
    }
  };

  const todayCount = memos.filter(m => new Date(m.date).toDateString() === new Date().toDateString()).length;

  return (
    <div className="min-h-screen bg-white text-gray-600 font-sans pb-28">
      {/* --- ロゴ・ヘッダー --- */}
      <header className="pt-10 pb-6 text-center border-b border-gray-50">
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl">🌿</span>
          <h1 className="text-3xl font-bold tracking-tighter text-gray-800">Ochiba</h1>
          <p className="text-[10px] text-emerald-500 font-bold tracking-widest">気づきの落ち葉を、集めよう。</p>
          <div className="mt-2 px-3 py-1 bg-gray-100 rounded-full text-[10px] text-gray-400">
            ● データは自動保存されます
          </div>
        </div>
      </header>

      {/* --- メインコンテンツ --- */}
      <main className="max-w-2xl mx-auto px-4">
        
        {activeTab === 'write' && (
          <div className="mt-8 animate-in fade-in slide-in-from-top-2 duration-700">
            {/* 統計エリア */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-8 flex items-center justify-around mb-8 shadow-sm">
              <div className="text-center">
                <span className="text-4xl font-light text-gray-800">{todayCount}</span>
                <p className="text-[10px] text-gray-400 mt-1">今日の落ち葉</p>
                <p className="text-[10px] text-emerald-500">累計 {memos.length}枚 🍃</p>
              </div>
            </div>

            {/* タグ選択 */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
              {colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c)}
                  className={`px-4 py-1.5 rounded-full border text-xs transition-all whitespace-nowrap
                    ${selectedColor.name === c.name ? `${c.border} ${c.bg} ${c.text}` : 'border-gray-200 text-gray-400'}`}
                >
                  {c.name}
                </button>
              ))}
              <button className="w-8 h-8 rounded-full border border-gray-200 text-gray-300 flex items-center justify-center text-sm">+</button>
            </div>

            {/* 入力欄 */}
            <div className={`border-2 rounded-2xl p-4 transition-colors duration-500 ${selectedColor.border}`}>
              <textarea
                className="w-full h-32 border-none focus:ring-0 resize-none text-sm placeholder-gray-300"
                placeholder="今の気づきを..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            <button 
              onClick={addMemo}
              className="w-full mt-6 py-4 bg-[#c8e6d9] hover:bg-[#b8d6c9] text-white rounded-2xl font-bold transition-all shadow-sm"
            >
              落ち葉を追加する
            </button>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="mt-8 space-y-4 animate-in fade-in duration-500">
             <div className="text-[10px] text-gray-400 border-b border-dashed border-gray-200 pb-2 mb-4">
               すべて ({memos.length}枚)
             </div>
             {memos.map((memo) => (
               <div key={memo.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm relative group">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-emerald-400 text-xs">🌱</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${memo.color} border border-black/5`}>
                      {memo.category || '自分'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{memo.text}</p>
                  <div className="mt-3 text-[9px] text-gray-300 flex justify-between">
                    <span>{new Date(memo.date).toLocaleString()}</span>
                  </div>
               </div>
             ))}
          </div>
        )}
      </main>

      {/* --- ナビゲーションバー --- */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-around items-center z-50">
        <button onClick={() => setActiveTab('write')} className={`p-2 transition-all ${activeTab === 'write' ? 'bg-gray-100 rounded-lg' : 'opacity-30'}`}>📍</button>
        <button onClick={() => setActiveTab('timeline')} className={`p-2 transition-all ${activeTab === 'timeline' ? 'bg-gray-100 rounded-lg' : 'opacity-30'}`}>📅</button>
        <button className="opacity-30 p-2 text-xl">📊</button>
        <button className="opacity-30 p-2 text-xl">🔖</button>
        <button className="opacity-30 p-2 text-xl">➕</button>
        <button className="opacity-30 p-2 text-xl">⚙️</button>
      </nav>
    </div>
  );
}
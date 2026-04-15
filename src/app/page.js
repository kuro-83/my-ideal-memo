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
  const [selectedColor, setSelectedColor] = useState('bg-white'); // デフォルト色
  const [activeTab, setActiveTab] = useState('write'); // 現在のモード

  // 感情の色リスト
  const colors = [
    { name: '穏やか', class: 'bg-blue-50', border: 'border-blue-200' },
    { name: '情熱', class: 'bg-red-50', border: 'border-red-200' },
    { name: '発見', class: 'bg-yellow-50', border: 'border-yellow-200' },
    { name: '癒し', class: 'bg-green-50', border: 'border-green-200' },
    { name: '自分', class: 'bg-purple-50', border: 'border-purple-200' },
  ];

  const fetchMemos = async () => {
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .order('date', { ascending: false });
    if (error) console.error(error);
    else setMemos(data || []);
  };

  useEffect(() => {
    fetchMemos();
  }, []);

  const addMemo = async () => {
    if (!input.trim()) return;
    const { error } = await supabase.from('memos').insert([{
      text: input,
      color: selectedColor,
      pinned: false
    }]);
    if (error) {
      alert("王国の記録に失敗しました...");
    } else {
      setInput("");
      alert("停留所に記録しました。");
      fetchMemos();
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-gray-700 font-sans pb-24">
      {/* --- ヘッダー --- */}
      <header className="p-6 text-center">
        <h1 className="text-sm tracking-[0.3em] text-gray-400 uppercase">Life's Stop - 人生の停留所</h1>
        <p className="text-xs text-gray-300 mt-2">{new Date().toLocaleDateString('ja-JP', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </header>

      <main className="max-w-md mx-auto px-6">
        
        {/* --- 📝 書くモード --- */}
        {activeTab === 'write' && (
          <div className="animate-in fade-in duration-700">
            <div className="mt-10 mb-6">
              <textarea
                className="w-full h-64 bg-transparent text-xl border-none focus:ring-0 resize-none placeholder-gray-200"
                placeholder="今の思いを、ここに置いていってください..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col items-center gap-6">
              <div className="flex gap-4">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.class)}
                    className={`w-8 h-8 rounded-full ${c.class} border ${selectedColor === c.class ? `${c.border} scale-125 shadow-sm` : 'border-transparent'} transition-all`}
                    title={c.name}
                  />
                ))}
              </div>
              <button 
                onClick={addMemo}
                className="px-10 py-3 bg-gray-900 text-white rounded-full text-sm tracking-widest hover:bg-gray-700 transition shadow-xl"
              >
                記録する
              </button>
            </div>
          </div>
        )}

        {/* --- 📜 辿るモード (これまでのメモ) --- */}
        {activeTab === 'timeline' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-6">
              {memos.map((memo) => (
                <div key={memo.id} className={`${memo.color} p-6 rounded-2xl border border-black/5 shadow-sm`}>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{memo.text}</p>
                  <div className="mt-4 text-[10px] text-gray-300 font-mono">
                    {new Date(memo.date).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- ⚙️ 整えるモード (仮) --- */}
        {activeTab === 'settings' && (
          <div className="text-center py-20 text-gray-300 italic">
            <p>王国の書斎は、現在準備中です...</p>
          </div>
        )}

      </main>

      {/* --- 🧭 下部ナビゲーション --- */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border border-gray-100 px-6 py-3 rounded-full shadow-2xl flex gap-10 z-50">
        <button onClick={() => setActiveTab('write')} className={`text-xl ${activeTab === 'write' ? 'opacity-100 scale-110' : 'opacity-30'}`}>📝</button>
        <button onClick={() => setActiveTab('timeline')} className={`text-xl ${activeTab === 'timeline' ? 'opacity-100 scale-110' : 'opacity-30'}`}>📜</button>
        <button onClick={() => setActiveTab('settings')} className={`text-xl ${activeTab === 'settings' ? 'opacity-100 scale-110' : 'opacity-30'}`}>⚙️</button>
      </nav>
    </div>
  );
}
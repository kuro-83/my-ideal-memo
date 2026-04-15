"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const Icon = ({ type }) => {
  if (type === 'write') return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
  if (type === 'timeline') return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
  if (type === 'stats') return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
  if (type === 'tag') return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>;
  return null;
};

export default function MemoApp() {
  const [memos, setMemos] = useState([]);
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState('write');
  const [selectedColor, setSelectedColor] = useState({ 
    bg: 'bg-blue-50', 
    border: 'border-blue-300' // 枠線を少し濃く
  });

  const colors = [
    { bg: 'bg-blue-50', border: 'border-blue-300' },
    { bg: 'bg-red-50', border: 'border-red-300' },
    { bg: 'bg-yellow-50', border: 'border-yellow-300' },
    { bg: 'bg-green-50', border: 'border-green-300' },
    { bg: 'bg-purple-50', border: 'border-purple-300' },
  ];

  const fetchMemos = async () => {
    const { data } = await supabase.from('memos').select('*').order('date', { ascending: false });
    setMemos(data || []);
  };

  useEffect(() => { fetchMemos(); }, []);

  const addMemo = async () => {
    if (!input.trim()) return;
    const { error } = await supabase.from('memos').insert([{ text: input, color: selectedColor.bg }]);
    if (!error) { setInput(""); fetchMemos(); }
  };

  const todayCount = memos.filter(m => new Date(m.date).toDateString() === new Date().toDateString()).length;

  return (
    <div className="min-h-screen bg-white text-gray-600 font-sans pb-10">
      
      <header className="pt-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">memo</h1>
        <p className="text-[10px] text-emerald-500 font-bold tracking-[0.2em] mt-1 uppercase">Stay and reflect</p>

        <nav className="flex justify-center gap-2 mt-6">
          <button onClick={() => setActiveTab('write')} className={`p-3 px-8 rounded-t-xl transition-all ${activeTab === 'write' ? 'bg-[#f2f2f2] text-gray-800' : 'text-gray-300 hover:text-gray-400'}`}>
            <Icon type="write" />
          </button>
          <button onClick={() => setActiveTab('timeline')} className={`p-3 px-8 rounded-t-xl transition-all ${activeTab === 'timeline' ? 'bg-[#f2f2f2] text-gray-800' : 'text-gray-300 hover:text-gray-400'}`}>
            <Icon type="timeline" />
          </button>
          <button className="p-3 px-8 text-gray-200 opacity-40"><Icon type="stats" /></button>
          <button className="p-3 px-8 text-gray-200 opacity-40"><Icon type="tag" /></button>
        </nav>
        <div className="border-b border-gray-200 mx-auto max-w-xl"></div>
      </header>

      <main className="max-w-xl mx-auto px-6">
        
        {activeTab === 'write' && (
          <div className="mt-6 animate-in fade-in duration-500">
            {/* 統計エリア - 枠を少しはっきり */}
            <div className="bg-white border border-gray-200 rounded-[32px] py-6 flex flex-col items-center mb-6 shadow-sm">
              <span className="text-4xl font-light text-gray-800">{todayCount}</span>
              <p className="text-[10px] text-gray-500 tracking-wider">今日のメモ</p>
              <p className="text-[10px] text-emerald-500 mt-1 font-medium">累計 {memos.length}枚 🍃</p>
            </div>

            {/* タグ選択 */}
            <div className="flex gap-2 mb-4 justify-start">
              {colors.map((c, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedColor(c)}
                  className={`w-12 h-6 rounded-full border transition-all duration-300
                    ${c.bg} ${c.border} 
                    ${selectedColor.bg === c.bg ? 'ring-2 ring-offset-2 ring-gray-100 scale-105' : 'opacity-50 border-gray-200 hover:opacity-100'}`}
                />
              ))}
              <button className="w-6 h-6 rounded-full border border-gray-200 text-gray-400 flex items-center justify-center text-xs ml-1 hover:bg-gray-50">+</button>
            </div>

            {/* 入力欄 - 枠の色を微調整 */}
            <div className={`border-2 rounded-2xl p-4 transition-all duration-500 bg-white ${selectedColor.border}`}>
              <textarea
                className="w-full h-32 border-none focus:ring-0 outline-none resize-none text-base text-gray-700 placeholder-gray-300 bg-transparent"
                placeholder="今の気づきを..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            <button 
              onClick={addMemo}
              disabled={!input.trim()}
              className={`w-full mt-4 py-4 rounded-2xl font-bold transition-all duration-300 shadow-sm
                ${input.trim() ? 'bg-[#98c9b6] text-white shadow-md' : 'bg-[#e8f2ee] text-[#b8d6ca]'}`}
            >
              メモを追加する
            </button>
          </div>
        )}

        {/* --- タイムライン（一旦シンプルに維持） --- */}
        {activeTab === 'timeline' && (
          <div className="mt-6 space-y-4 animate-in fade-in duration-500">
             <div className="text-[10px] text-gray-400 border-b border-gray-200 pb-2 mb-4 tracking-widest font-bold">
               HISTORY ({memos.length})
             </div>
             {memos.map((memo) => (
               <div key={memo.id} className="bg-white border border-gray-100 rounded-2xl p-5 relative overflow-hidden shadow-sm">
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${memo.color.replace('bg-', 'bg-').replace('-50', '-300')}`} />
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{memo.text}</p>
                  <div className="mt-3 text-[9px] text-gray-400 font-mono italic">
                    {new Date(memo.date).toLocaleString()}
                  </div>
               </div>
             ))}
          </div>
        )}
      </main>
    </div>
  );
}
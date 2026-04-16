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
  if (type === 'garden') return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
  return null;
};

export default function MemoApp() {
  const [memos, setMemos] = useState([]);
  const [input, setInput] = useState("");
  const [titleInput, setTitleInput] = useState(""); // 育てるメモ用のタイトル
  const [activeTab, setActiveTab] = useState('write');
  const [selectedColor, setSelectedColor] = useState({ bg: 'bg-blue-50', border: 'border-blue-300' });

  const fetchMemos = async () => {
    const { data } = await supabase.from('memos').select('*').order('date', { ascending: false });
    setMemos(data || []);
  };

  useEffect(() => { fetchMemos(); }, []);

  // メモ追加時に、カテゴリ（種か、普通のメモか）を判別
  const addMemo = async (type = 'normal') => {
    const textToAdd = type === 'permanent' ? input : input;
    const titleToAdd = type === 'permanent' ? titleInput : null;
    
    if (!input.trim()) return;
    
    const { error } = await supabase.from('memos').insert([{ 
      text: input, 
      color: selectedColor.bg,
      category: type === 'permanent' ? 'seed' : 'normal',
      title: titleToAdd // タイトルを保存
    }]);

    if (!error) { 
      setInput(""); 
      setTitleInput("");
      fetchMemos(); 
    }
  };

  const todayCount = memos.filter(m => m.category !== 'seed' && new Date(m.date).toDateString() === new Date().toDateString()).length;
  const gardenMemos = memos.filter(m => m.category === 'seed');
  const normalMemos = memos.filter(m => m.category !== 'seed');

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
          <button onClick={() => setActiveTab('garden')} className={`p-3 px-8 rounded-t-xl transition-all ${activeTab === 'garden' ? 'bg-[#f2f2f2] text-gray-800' : 'text-gray-300 hover:text-gray-400'}`}>
            <Icon type="garden" />
          </button>
          <button className="p-3 px-8 text-gray-200 opacity-40 cursor-not-allowed"><Icon type="stats" /></button>
        </nav>
        <div className="border-b border-gray-200 mx-auto max-w-xl"></div>
      </header>

      <main className="max-w-xl mx-auto px-6">
        
        {/* --- 📝 書くタブ --- */}
        {activeTab === 'write' && (
          <div className="mt-6 animate-in fade-in duration-500">
            <div className="bg-white border border-gray-200 rounded-[32px] py-6 flex flex-col items-center mb-6 shadow-sm">
              <span className="text-4xl font-light text-gray-800">{todayCount}</span>
              <p className="text-[10px] text-gray-500 tracking-wider">今日のメモ</p>
              <p className="text-[10px] text-emerald-500 mt-1 font-medium">累計 {normalMemos.length}枚 🍃</p>
            </div>

            <div className="flex gap-2 mb-4 justify-start">
              {[{ bg: 'bg-blue-50', border: 'border-blue-300' }, { bg: 'bg-red-50', border: 'border-red-300' }, { bg: 'bg-yellow-50', border: 'border-yellow-300' }, { bg: 'bg-green-50', border: 'border-green-300' }, { bg: 'bg-purple-50', border: 'border-purple-300' }].map((c, index) => (
                <button key={index} onClick={() => setSelectedColor(c)} className={`w-12 h-6 rounded-full border transition-all duration-300 ${c.bg} ${c.border} ${selectedColor.bg === c.bg ? 'ring-2 ring-offset-2 ring-gray-100 scale-105' : 'opacity-50 border-gray-200 hover:opacity-100'}`} />
              ))}
            </div>

            <div className={`border-2 rounded-2xl p-4 transition-all duration-500 bg-white ${selectedColor.border}`}>
              <textarea className="w-full h-32 border-none focus:ring-0 outline-none resize-none text-base text-gray-700 placeholder-gray-300 bg-transparent" placeholder="今の気づきを..." value={input} onChange={(e) => setInput(e.target.value)} />
            </div>

            <button onClick={() => addMemo('normal')} disabled={!input.trim()} className={`w-full mt-4 py-4 rounded-2xl font-bold transition-all duration-300 shadow-sm ${input.trim() ? 'bg-[#98c9b6] text-white shadow-md' : 'bg-[#e8f2ee] text-[#b8d6ca]'}`}>
              メモを追加する
            </button>
          </div>
        )}

        {/* --- 📜 タイムラインタブ --- */}
        {activeTab === 'timeline' && (
          <div className="mt-6 space-y-4 animate-in fade-in duration-500">
             <div className="text-[10px] text-gray-400 border-b border-gray-200 pb-2 mb-4 tracking-widest font-bold uppercase">Chronicle</div>
             {normalMemos.map((memo) => (
               <div key={memo.id} className="bg-white border border-gray-100 rounded-2xl p-5 relative overflow-hidden shadow-sm">
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${memo.color.replace('bg-', 'bg-').replace('-50', '-300')}`} />
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{memo.text}</p>
                  <div className="mt-3 text-[9px] text-gray-400 font-mono italic">{new Date(memo.date).toLocaleString()}</div>
               </div>
             ))}
          </div>
        )}

        {/* --- 🌿 育てるタブ (Seed/Permanent) --- */}
        {activeTab === 'garden' && (
          <div className="mt-6 animate-in fade-in duration-500">
            <div className="text-[10px] text-gray-400 border-b border-gray-200 pb-2 mb-6 tracking-widest font-bold uppercase">My Garden</div>
            
            {/* 新しい種を植えるエリア */}
            <div className="bg-[#fcfcfc] border-2 border-dashed border-gray-200 rounded-3xl p-6 mb-8">
              <input 
                className="w-full bg-transparent border-none focus:ring-0 text-lg font-bold placeholder-gray-300 mb-2"
                placeholder="新しい種の名前 (例: やりたいこと)"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
              />
              <textarea 
                className="w-full bg-transparent border-none focus:ring-0 text-sm placeholder-gray-300 resize-none h-20"
                placeholder="ここに育てていきたい言葉を..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button 
                onClick={() => addMemo('permanent')}
                disabled={!titleInput.trim() || !input.trim()}
                className={`mt-2 px-6 py-2 rounded-full text-xs font-bold transition-all ${titleInput.trim() && input.trim() ? 'bg-emerald-400 text-white' : 'bg-gray-100 text-gray-300'}`}
              >
                種をまく
              </button>
            </div>

            {/* 植えられた種（カード）のリスト */}
            <div className="grid gap-4">
              {gardenMemos.map((memo) => (
                <div key={memo.id} className="bg-white border-2 border-gray-100 rounded-3xl p-6 shadow-sm hover:border-emerald-100 transition-colors group">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-gray-800">{memo.title || "無題の種"}</h3>
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">Growth</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{memo.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
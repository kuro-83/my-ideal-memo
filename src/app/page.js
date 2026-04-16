"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const Icon = ({ type }) => {
  const style = { strokeWidth: "1.8" };
  if (type === 'write') return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" {...style} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
  if (type === 'timeline') return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" {...style} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
  if (type === 'garden') return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" {...style} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
  return null;
};

export default function MemoApp() {
  const [memos, setMemos] = useState([]);
  const [activeTab, setActiveTab] = useState('write');
  const [showSeedForm, setShowSeedForm] = useState(false); // 入力欄の表示管理
  
  const [writeInput, setWriteInput] = useState("");
  const [gardenInput, setGardenInput] = useState("");
  const [gardenTitle, setGardenTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState({ bg: 'bg-blue-50', border: 'border-blue-300' });

  const fetchMemos = async () => {
    const { data } = await supabase.from('memos').select('*').order('date', { ascending: false });
    setMemos(data || []);
  };

  useEffect(() => { fetchMemos(); }, []);

  const addMemo = async (type) => {
    const isGarden = type === 'seed';
    const text = isGarden ? gardenInput : writeInput;
    if (!text.trim()) return;

    const { error } = await supabase.from('memos').insert([{ 
      text, 
      color: isGarden ? 'bg-white' : selectedColor.bg,
      category: type,
      title: isGarden ? gardenTitle : null
    }]);

    if (!error) {
      if (isGarden) { setGardenInput(""); setGardenTitle(""); setShowSeedForm(false); }
      else { setWriteInput(""); }
      fetchMemos();
    }
  };

  const gardenMemos = memos.filter(m => m.category === 'seed');
  const normalMemos = memos.filter(m => m.category !== 'seed');
  const todayMemos = normalMemos.filter(m => new Date(m.date).toDateString() === new Date().toDateString());

  return (
    <div className="min-h-screen bg-white text-gray-600 font-sans pb-10">
      
      {/* --- ヘッダー --- */}
      <header className="pt-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">memo</h1>
        <p className="text-[10px] text-emerald-500 font-bold tracking-[0.2em] mt-1 uppercase">Stay and reflect</p>

        <nav className="flex justify-center gap-2 mt-6">
          {['write', 'timeline', 'garden'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`p-3 px-8 rounded-t-xl transition-all ${activeTab === tab ? 'bg-[#f2f2f2] text-gray-800' : 'text-gray-300 hover:text-gray-400'}`}>
              <Icon type={tab} />
            </button>
          ))}
          <button className="p-3 px-8 text-gray-200 opacity-40 cursor-not-allowed"><Icon type="stats" /></button>
        </nav>
        <div className="border-b border-gray-200 mx-auto max-w-xl"></div>
      </header>

      <main className="max-w-xl mx-auto px-6">
        
        {/* --- 📝 書くタブ --- */}
        {activeTab === 'write' && (
          <div className="mt-6 animate-in fade-in duration-500">
            <div className="bg-white border border-gray-200 rounded-[32px] py-6 flex flex-col items-center mb-6 shadow-sm">
              <span className="text-4xl font-light text-gray-800">{todayMemos.length}</span>
              <p className="text-[10px] text-gray-500 tracking-wider">今日のメモ</p>
              <p className="text-[10px] text-emerald-500 mt-1 font-medium">累計 {normalMemos.length}枚 🍃</p>
            </div>

            <div className="flex gap-2 mb-4">
              {[{ bg: 'bg-blue-50', border: 'border-blue-300' }, { bg: 'bg-red-50', border: 'border-red-300' }, { bg: 'bg-yellow-50', border: 'border-yellow-300' }, { bg: 'bg-green-50', border: 'border-green-300' }, { bg: 'bg-purple-50', border: 'border-purple-300' }].map((c, index) => (
                <button key={index} onClick={() => setSelectedColor(c)} className={`w-12 h-6 rounded-full border ${c.bg} ${c.border} ${selectedColor.bg === c.bg ? 'ring-2 ring-offset-2 ring-gray-100 scale-105' : 'opacity-50 hover:opacity-100 border-gray-200'}`} />
              ))}
            </div>

            <div className={`border-2 rounded-2xl p-4 transition-all bg-white ${selectedColor.border}`}>
              <textarea className="w-full h-32 border-none focus:ring-0 outline-none resize-none text-base text-gray-700 placeholder-gray-300 bg-transparent" placeholder="今の気づきを..." value={writeInput} onChange={(e) => setWriteInput(e.target.value)} />
            </div>

            <button onClick={() => addMemo('normal')} disabled={!writeInput.trim()} className={`w-full mt-4 py-4 rounded-2xl font-bold transition-all ${writeInput.trim() ? 'bg-[#98c9b6] text-white shadow-md' : 'bg-[#e8f2ee] text-[#b8d6ca]'}`}>
              メモを追加する
            </button>
          </div>
        )}

        {/* --- 🌿 育てるタブ --- */}
        {activeTab === 'garden' && (
          <div className="mt-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-end border-b border-gray-200 pb-2 mb-6">
              <div className="text-[10px] text-gray-400 tracking-widest font-bold">MY GARDEN</div>
              <button 
                onClick={() => setShowSeedForm(!showSeedForm)}
                className="text-xs text-emerald-500 font-bold hover:text-emerald-600 transition-colors"
              >
                {showSeedForm ? '× 閉じる' : '+ 新しい種をまく'}
              </button>
            </div>
            
            {showSeedForm && (
              <div className="mb-8 bg-white border-2 border-emerald-100 rounded-2xl p-5 shadow-sm animate-in slide-in-from-top-2">
                <input 
                  className="w-full bg-transparent border-none focus:ring-0 outline-none text-base font-bold placeholder-gray-200 mb-1"
                  placeholder="リストのタイトル"
                  value={gardenTitle}
                  onChange={(e) => setGardenTitle(e.target.value)}
                />
                <textarea 
                  className="w-full bg-transparent border-none focus:ring-0 outline-none text-sm placeholder-gray-200 resize-none h-20"
                  placeholder="ここへ大切にしたい言葉を..."
                  value={gardenInput}
                  onChange={(e) => setGardenInput(e.target.value)}
                />
                <div className="flex justify-end mt-2">
                  <button onClick={() => addMemo('seed')} disabled={!gardenTitle.trim()} className="bg-emerald-400 text-white px-6 py-2 rounded-full text-xs font-bold shadow-sm">
                    種をまく
                  </button>
                </div>
              </div>
            )}

            <div className="grid gap-4">
              {gardenMemos.map((memo) => (
                <div key={memo.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-emerald-200 transition-colors shadow-sm">
                  <h3 className="text-sm font-bold text-gray-800 mb-2">{memo.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{memo.text}</p>
                </div>
              ))}
              {gardenMemos.length === 0 && !showSeedForm && (
                <div className="text-center py-20 text-gray-300 text-sm">
                  まだ種がありません。右上のボタンから植えてみましょう。
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- 📜 タイムラインタブ --- */}
        {activeTab === 'timeline' && (
          <div className="mt-6 space-y-4 animate-in fade-in duration-500">
             {normalMemos.map((memo) => (
               <div key={memo.id} className="bg-white border border-gray-100 rounded-2xl p-5 relative overflow-hidden shadow-sm">
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${memo.color.replace('-50', '-300')}`} />
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{memo.text}</p>
               </div>
             ))}
          </div>
        )}
      </main>
    </div>
  );
}
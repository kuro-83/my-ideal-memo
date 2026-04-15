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
    bg: 'bg-blue-50', border: 'border-blue-200'
  });

  const colors = [
    { bg: 'bg-blue-50', border: 'border-blue-200' },
    { bg: 'bg-red-50', border: 'border-red-200' },
    { bg: 'bg-yellow-50', border: 'border-yellow-200' },
    { bg: 'bg-green-50', border: 'border-green-200' },
    { bg: 'bg-purple-50', border: 'border-purple-200' },
  ];

  const fetchMemos = async () => {
    const { data } = await supabase.from('memos').select('*').order('date', { ascending: false });
    setMemos(data || []);
  };

  useEffect(() => { fetchMemos(); }, []);

  const addMemo = async () => {
    if (!input.trim()) return;
    // エラー回避のため、確実に存在する'text'と'color'のみを送信
    const { error } = await supabase.from('memos').insert([{
      text: input,
      color: selectedColor.bg
    }]);
    
    if (error) {
      console.error(error);
      alert("保存に失敗しました。");
    } else {
      setInput("");
      fetchMemos();
    }
  };

  const todayCount = memos.filter(m => new Date(m.date).toDateString() === new Date().toDateString()).length;

  return (
    <div className="min-h-screen bg-white text-gray-600 font-sans pb-10">
      
      {/* --- ヘッダーエリア --- */}
      <header className="pt-6 pb-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">memo</h1>
        <p className="text-[10px] text-emerald-500 font-bold tracking-widest mt-1">
          ここに好きな言葉をいれる
        </p>

        {/* --- タブメニュー (参考元と同じ位置) --- */}
        <nav className="flex justify-center gap-1 mt-4">
          <button onClick={() => setActiveTab('write')} className={`p-2 px-6 rounded-t-lg transition-all ${activeTab === 'write' ? 'bg-gray-100' : 'opacity-30'}`}>📍</button>
          <button onClick={() => setActiveTab('timeline')} className={`p-2 px-6 rounded-t-lg transition-all ${activeTab === 'timeline' ? 'bg-gray-100' : 'opacity-30'}`}>📅</button>
          <button className="opacity-30 p-2 px-6">📊</button>
          <button className="opacity-30 p-2 px-6">🔖</button>
        </nav>
        <div className="border-b border-gray-100 mx-auto max-w-2xl"></div>
      </header>

      <main className="max-w-xl mx-auto px-4">
        
        {activeTab === 'write' && (
          <div className="mt-4">
            {/* 統計エリア (余白を削減) */}
            <div className="bg-white border border-gray-100 rounded-[24px] py-4 flex flex-col items-center mb-4 shadow-sm">
              <span className="text-3xl font-light text-gray-800">{todayCount}</span>
              <p className="text-[9px] text-gray-400">今日のメモ</p>
              <p className="text-[9px] text-emerald-500">累計 {memos.length}枚 🍃</p>
            </div>

            {/* タグ選択 (文字なし・常時着色) */}
            <div className="flex gap-2 mb-3 justify-center">
              {colors.map((c, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedColor(c)}
                  className={`w-10 h-6 rounded-full border transition-all 
                    ${c.bg} ${c.border} 
                    ${selectedColor.bg === c.bg ? 'scale-110 ring-2 ring-offset-1 ring-gray-100' : 'opacity-60'}`}
                />
              ))}
              <button className="w-6 h-6 rounded-full border border-gray-100 text-gray-300 flex items-center justify-center text-xs">+</button>
            </div>

            {/* 入力欄 */}
            <div className={`border rounded-xl p-3 transition-colors duration-500 ${selectedColor.border}`}>
              <textarea
                className="w-full h-24 border-none focus:ring-0 resize-none text-sm placeholder-gray-200"
                placeholder="今の気づきを..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            {/* 追加ボタン (入力があれば濃く、なければ薄く) */}
            <button 
              onClick={addMemo}
              disabled={!input.trim()}
              className={`w-full mt-3 py-3 rounded-xl font-bold transition-all shadow-sm text-white
                ${input.trim() ? 'bg-[#98c9b6]' : 'bg-[#e2ede8]'}`}
            >
              メモを追加する
            </button>
          </div>
        )}

        {/* --- タイムライン --- */}
        {activeTab === 'timeline' && (
          <div className="mt-4 space-y-3">
             <div className="text-[10px] text-gray-400 border-b border-dashed border-gray-100 pb-1 mb-2">
               すべて ({memos.length})
             </div>
             {memos.map((memo) => (
               <div key={memo.id} className="bg-white border border-gray-50 rounded-xl p-4 shadow-sm relative">
                  <div className={`w-2 h-2 rounded-full ${memo.color} mb-2`} />
                  <p className="text-sm text-gray-700 leading-relaxed">{memo.text}</p>
                  <div className="mt-2 text-[8px] text-gray-300">
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
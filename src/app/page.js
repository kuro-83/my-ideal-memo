"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabaseとの接続設定
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function MemoApp() {
  const [memos, setMemos] = useState([]);
  const [input, setInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // 1. 金庫からメモを読み込む（取得）
  const fetchMemos = async () => {
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .order('pinned', { ascending: false })
      .order('date', { ascending: false });
    
    if (error) console.error(error);
    else setMemos(data || []);
  };

  useEffect(() => {
    fetchMemos();
    document.getElementById("memo-input")?.focus();
  }, []);

  // 2. 新しいメモを金庫に入れる（追加）
  const addMemo = async () => {
    if (!input.trim()) return;
    const newMemo = {
      text: input,
      pinned: false,
      color: 'bg-yellow-50'
    };

    const { error } = await supabase.from('memos').insert([newMemo]);
    if (error) {
      alert("保存に失敗しました...");
    } else {
      setInput("");
      fetchMemos(); // 最新の状態に更新
    }
  };

  // 3. ピン留めを更新する（更新）
  const togglePin = async (id, currentPinned) => {
    const { error } = await supabase
      .from('memos')
      .update({ pinned: !currentPinned })
      .eq('id', id);
    
    if (error) console.error(error);
    else fetchMemos();
  };

  // 4. メモを消す（削除）
  const deleteMemo = async (id) => {
    const { error } = await supabase.from('memos').delete().eq('id', id);
    if (error) console.error(error);
    else fetchMemos();
  };

  const filteredMemos = memos.filter(m => 
    m.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 font-sans text-gray-800">
      <div className="max-w-md mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-black text-blue-600 tracking-tighter mb-4">My Cloud Memos</h1>
          <input 
            type="text"
            placeholder="クラウドから検索..."
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 ring-blue-400 bg-white shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </header>

        <div className="bg-white p-4 rounded-2xl shadow-md mb-8 border border-blue-50">
          <textarea
            id="memo-input"
            className="w-full h-24 focus:outline-none resize-none text-lg"
            placeholder="今、何を考えてる？"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addMemo(); }}
          />
          <div className="flex justify-end mt-2">
            <button onClick={addMemo} className="px-6 py-2 bg-blue-500 text-white rounded-xl font-bold shadow-lg hover:bg-blue-600 transition">
              追加
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredMemos.map((memo) => (
            <div key={memo.id} className={`${memo.color} p-5 rounded-lg shadow-sm border-l-4 ${memo.pinned ? 'border-blue-500 scale-105' : 'border-yellow-400'} transition-all`}>
              <p className="text-gray-700 whitespace-pre-wrap">{memo.text}</p>
              <div className="mt-4 pt-3 border-t border-black/5 flex justify-between items-center">
                <span className="text-[10px] text-gray-400 font-mono">
                  {new Date(memo.date).toLocaleString()}
                </span>
                <div className="flex gap-3 text-lg">
                  <button onClick={() => togglePin(memo.id, memo.pinned)} className={memo.pinned ? 'grayscale-0' : 'grayscale opacity-30'}>📌</button>
                  <button onClick={() => deleteMemo(memo.id)} className="opacity-30 hover:opacity-100 transition">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-12 text-center text-[10px] text-gray-300 tracking-[0.2em] uppercase">
          Progress: 50% - Cloud Sync Active
        </footer>
      </div>
    </div>
  );
}
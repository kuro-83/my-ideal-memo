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
  if (type === 'settings') return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" {...style} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" {...style} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
  if (type === 'pin') return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" {...style} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>;
  if (type === 'copy') return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" {...style} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>;
  if (type === 'more') return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" {...style} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>;
  if (type === 'search') return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" {...style} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
  if (type === 'tag') return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>;
  return null;
};

export default function MemoApp() {
  const [memos, setMemos] = useState([]);
  const [activeTab, setActiveTab] = useState('write');
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [tagMenuOpenId, setTagMenuOpenId] = useState(null); // どのメモのタグメニューを開いているか記録
  const [writeInput, setWriteInput] = useState("");
  const [gardenInput, setGardenInput] = useState("");
  const [gardenTitle, setGardenTitle] = useState("");
  const [editId, setEditId] = useState(null); 
  const [editInput, setEditInput] = useState(""); 
  const [selectedColor, setSelectedColor] = useState({ bg: 'bg-blue-50', border: 'border-blue-200', bar: 'bg-blue-300' });
  const [availableTags, setAvailableTags] = useState([
    { id: 1, name: '仕事', isHidden: false },
    { id: 2, name: 'アイデア', isHidden: false },
    { id: 3, name: '秘密', isHidden: true }, 
  ]);
  const [selectedTags, setSelectedTags] = useState([]); 
  const [isTagMenuOpen, setIsTagMenuOpen] = useState(false); 
  const [searchFilterTag, setSearchFilterTag] = useState(null); 
  const [newTagName, setNewTagName] = useState("");
  const [newTagIsHidden, setNewTagIsHidden] = useState(false);
  const [editingTagId, setEditingTagId] = useState(null);
  const [editingTagName, setEditingTagName] = useState("");
  const [editingTagIsHidden, setEditingTagIsHidden] = useState(false);

  useEffect(() => {
    const closeMenu = () => {
      setMenuOpenId(null);
      setTagMenuOpenId(null); // 画面のどこかを押したらタグメニューも閉じる
    };
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const fetchMemos = async () => {
    const { data } = await supabase.from('memos').select('*').order('is_pinned', { ascending: false }).order('date', { ascending: false });
    setMemos(data || []);
  };

  useEffect(() => { fetchMemos(); }, []);

  const addMemo = async (type) => {
    const isGarden = type === 'seed';
    const text = isGarden ? gardenInput : writeInput;
    if (!text.trim()) return;
    const { error } = await supabase.from('memos').insert([{ 
      text, 
      color: isGarden ? 'bg-emerald-300' : selectedColor.bar, 
      category: type,
      title: isGarden ? gardenTitle : null,
      tags: selectedTags.map(t => t.name) // タグの名前だけを配列にして保存
    }]);
    if (!error) { setWriteInput(""); setGardenInput(""); setGardenTitle(""); setSelectedTags([]); fetchMemos(); }
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

  // メモのタグを追加・削除する処理
  const toggleMemoTag = async (memoId, currentTags, tagToToggle) => {
    const tags = currentTags || [];
    let newTags;
    if (tags.includes(tagToToggle)) {
      newTags = tags.filter(t => t !== tagToToggle); // すでにあれば削除
    } else {
      newTags = [...tags, tagToToggle]; // なければ追加
    }
    await supabase.from('memos').update({ tags: newTags }).eq('id', memoId);
    fetchMemos(); // 画面を更新
  };

  // 編集した内容を保存する処理
  const saveEdit = async (id) => {
    await supabase.from('memos').update({ text: editInput }).eq('id', id);
    setEditId(null); // 編集モードを終了
    fetchMemos(); // 最新のデータを読み込む
  };

  // --- タグ管理機能 ---
  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    const newId = availableTags.length > 0 ? Math.max(...availableTags.map(t => t.id)) + 1 : 1;
    setAvailableTags([...availableTags, { id: newId, name: newTagName, isHidden: newTagIsHidden }]);
    setNewTagName("");
    setNewTagIsHidden(false);
  };

  const handleDeleteTag = (id) => {
    if (confirm("このタグをリストから削除しますか？\n（※すでにこのタグがついている過去のメモからタグが消えるわけではありません）")) {
      setAvailableTags(availableTags.filter(t => t.id !== id));
    }
  };

  const handleSaveEditTag = (id) => {
    if (!editingTagName.trim()) return;
    setAvailableTags(availableTags.map(t => t.id === id ? { ...t, name: editingTagName, isHidden: editingTagIsHidden } : t));
    setEditingTagId(null);
  };

  const normalMemos = memos.filter(m => m.category === 'normal');
  const gardenMemos = memos.filter(m => m.category === 'seed');
  const todayMemos = normalMemos.filter(m => new Date(m.date).toDateString() === new Date().toDateString());

  // タイムライン用：非表示設定(isHidden: true)のタグが含まれているメモを除外
  const hiddenTagNames = availableTags.filter(t => t.isHidden).map(t => t.name);
  const timelineMemos = normalMemos.filter(memo => {
    if (!memo.tags || memo.tags.length === 0) return true;
    return !memo.tags.some(tag => hiddenTagNames.includes(tag));
  });

  // 検索タブ用：フィルターが選ばれていれば絞り込み、選ばれていなければ全て表示
  const searchMemos = searchFilterTag 
    ? normalMemos.filter(memo => memo.tags && memo.tags.includes(searchFilterTag))
    : normalMemos;

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-600 font-sans pb-24">
      {/* --- ヘッダー・ナビ --- */}
      <header className="pt-8 text-center bg-white border-b border-gray-100 sticky top-0 z-20">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">memo</h1>
        <p className="text-[10px] text-emerald-500 font-bold tracking-[0.2em] mt-1 uppercase">Stay and reflect</p>
        <nav className="flex justify-center gap-1 mt-6">
          {['write', 'timeline', 'search', 'garden', 'settings'].map((tab) => (
            <button key={tab} onClick={(e) => { e.stopPropagation(); setActiveTab(tab); }} className={`p-3 px-6 rounded-t-xl transition-all ${activeTab === tab ? 'bg-[#f2f2f2] text-gray-800' : 'text-gray-200 hover:text-gray-400'}`}>
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
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Today's Memo</p>
              <p className="text-[10px] text-emerald-500 mt-1 font-bold">累計 {normalMemos.length}枚🍃</p>
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
            {/* カラー選択のすぐ下（テキストエリアの上）に追加 */}
            <div className="flex items-center flex-wrap gap-2 mb-4 relative z-10">
              {/* 選択済みのタグ */}
              {selectedTags.map(tag => (
                <span key={tag.id} className="text-[11px] px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg font-bold flex items-center gap-1">
                  {tag.name}
                  <button onClick={() => setSelectedTags(selectedTags.filter(t => t.id !== tag.id))} className="text-gray-400 hover:text-gray-600 ml-1">×</button>
                </span>
              ))}
              {/* ＋ボタン */}
              <button onClick={() => setIsTagMenuOpen(!isTagMenuOpen)} className="text-[11px] px-3 py-1.5 border border-dashed border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 rounded-lg font-bold transition-colors">
                ＋
              </button>
              
              {/* タグ選択メニュー（ポップアップ） */}
              {isTagMenuOpen && (
                <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 animate-in fade-in zoom-in-95">
                  {availableTags.filter(t => !selectedTags.some(st => st.id === t.id)).length === 0 ? (
                    <p className="text-xs text-center text-gray-400 py-2">追加できるタグがありません</p>
                  ) : (
                    availableTags.filter(t => !selectedTags.some(st => st.id === t.id)).map(tag => (
                      <button 
                        key={tag.id} 
                        onClick={() => { setSelectedTags([...selectedTags, tag]); setIsTagMenuOpen(false); }} 
                        className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-between"
                      >
                        {tag.name}
                        {tag.isHidden && <span className="text-[9px] text-gray-400 font-normal border border-gray-200 px-1.5 py-0.5 rounded">非表示</span>}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className={`border-2 rounded-2xl p-4 bg-white shadow-sm transition-all ${selectedColor.border}`}>
              <textarea className="w-full h-40 border-none focus:ring-0 outline-none resize-none text-base placeholder-gray-200 bg-transparent" placeholder="今の気づきを..." value={writeInput} onChange={(e) => setWriteInput(e.target.value)} />
            </div>
            <button onClick={() => addMemo('normal')} disabled={!writeInput.trim()} className={`w-full mt-4 py-4 rounded-2xl font-bold transition-all ${writeInput.trim() ? 'bg-emerald-400 text-white shadow-md hover:bg-emerald-500' : 'bg-gray-100 text-gray-300'}`}>メモを追加する</button>
          </div>
        )}

        {/* --- 📜 タイムラインタブ --- */}
        {activeTab === 'timeline' && (
          <div className="space-y-4 animate-in fade-in">
             {timelineMemos.map((memo) => {
               const isExpanded = expandedIds.has(memo.id);
               const shouldShowReadMore = memo.text.length > 100 || memo.text.split('\n').length > 3;

               return (
                 <div key={memo.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm relative flex flex-col ">
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${memo.color || 'bg-blue-300'}`} />
                    {memo.is_pinned && <div className="absolute top-0 right-0 p-2 text-emerald-500"><Icon type="pin" className="w-3 h-3 fill-current" /></div>}

                    {/* 本文エリア：編集モードと通常表示を切り替え */}
                    <div className="flex-grow pb-4">
                      {editId === memo.id ? (
                        <div className="mt-2">
                          <textarea 
                            className="w-full bg-gray-50 p-3 rounded-xl text-sm focus:ring-0 outline-none border border-gray-100 h-24" 
                            value={editInput} 
                            onChange={(e) => setEditInput(e.target.value)} 
                          />
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
                            <button onClick={() => {const n=new Set(expandedIds); n.has(memo.id)?n.delete(memo.id):n.add(memo.id); setExpandedIds(n);}} className="text-xs text-emerald-500 font-bold mt-1 hover:underline">
                              {isExpanded ? '閉じる' : '続きを読む'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* items-center に変更してアイコンの垂直位置を中央に */}
                    <div className="flex justify-between items-center mt-1 pt-2 border-t border-gray-50">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-300 font-bold tracking-wider">
                          {new Date(memo.date).toLocaleDateString()} {new Date(memo.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <button onClick={() => navigator.clipboard.writeText(memo.text)} className="text-gray-200 hover:text-emerald-500 transition-colors">
                          <Icon type="copy" className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-4 relative">
                        {/* タグ管理ボタン＆メニュー */}
                        <div className="relative">
                          <button onClick={(e) => { e.stopPropagation(); setTagMenuOpenId(tagMenuOpenId === memo.id ? null : memo.id); setMenuOpenId(null); }} className={`${memo.tags && memo.tags.length > 0 ? 'text-emerald-500' : 'text-gray-200'} hover:text-emerald-500`}>
                            <Icon type="tag" className="w-4 h-4" />
                          </button>
                          
                          {/* タグ選択ポップアップ */}
                          {tagMenuOpenId === memo.id && (
                            <div className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                              <div className="px-4 pb-2 mb-1 border-b border-gray-50 flex justify-between items-center">
                                <span className="text-[10px] text-gray-400 font-bold">タグの追加・削除</span>
                              </div>
                              <div className="max-h-48 overflow-y-auto">
                                {availableTags.map(tag => {
                                  const isSelected = memo.tags && memo.tags.includes(tag.name);
                                  return (
                                    <button
                                      key={tag.id}
                                      onClick={() => toggleMemoTag(memo.id, memo.tags, tag.name)}
                                      className={`w-full text-left px-4 py-2 text-[11px] font-bold flex items-center justify-between ${isSelected ? 'bg-gray-50 text-gray-700' : 'text-gray-400 hover:bg-gray-50'}`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Icon type="write" className="w-3 h-3 opacity-50" />
                                        {tag.name}
                                      </div>
                                      {isSelected ? (
                                        <span className="text-gray-400 border border-gray-200 bg-white rounded px-1.5 py-0.5 text-[9px] shadow-sm">ー</span>
                                      ) : (
                                        <span className="text-gray-300 text-[10px]">＋</span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* ピン留めボタン */}
                        <button onClick={() => togglePin(memo)} className={`${memo.is_pinned ? 'text-emerald-500' : 'text-gray-200'} hover:text-emerald-500`}>
                          <Icon type="pin" className="w-4 h-4" />
                        </button>
                        
                        {/* メニュー（編集・削除） */}
                        <div className="relative">
                          <button onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === memo.id ? null : memo.id); setTagMenuOpenId(null); }} className="text-gray-200 hover:text-gray-400">
                            <Icon type="more" className="w-4 h-4" />
                          </button>
                          {menuOpenId === memo.id && (
                            <div className="absolute right-0 top-full mt-2 w-28 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 animate-in fade-in zoom-in-95">
                              <button onClick={() => {setEditId(memo.id); setEditInput(memo.text);}} className="w-full text-left px-4 py-2.5 text-[11px] font-bold hover:bg-gray-50 text-gray-600 border-b border-gray-50">
                                編集
                              </button>
                              <button onClick={() => deleteMemo(memo.id)} className="w-full text-left px-4 py-2.5 text-[11px] font-bold hover:bg-red-50 text-red-400">
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

        {/* --- 🔍 検索タブ --- */}
        {activeTab === 'search' && (
          <div className="animate-in fade-in">
            {/* タグ絞り込みエリア */}
            <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-100">
              <button 
                onClick={() => setSearchFilterTag(null)} 
                className={`text-[11px] px-4 py-1.5 rounded-full font-bold transition-all ${!searchFilterTag ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
              >
                すべて
              </button>
              {availableTags.map(tag => (
                <button 
                  key={tag.id} 
                  onClick={() => setSearchFilterTag(tag.name)} 
                  className={`text-[11px] px-4 py-1.5 rounded-full font-bold transition-all flex items-center gap-1 ${searchFilterTag === tag.name ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                >
                  {tag.name}
                  {tag.isHidden && <span className="opacity-50 text-[9px]">🔒</span>}
                </button>
              ))}
            </div>

            {/* メモ一覧（検索結果：全機能入り） */}
            <div className="space-y-4">
              {searchMemos.map((memo) => {
                const isExpanded = expandedIds.has(memo.id);
                const shouldShowReadMore = memo.text.length > 100 || memo.text.split('\n').length > 3;

                return (
                  <div key={memo.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm relative flex flex-col">
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${memo.color || 'bg-blue-300'}`} />
                    {memo.is_pinned && <div className="absolute top-0 right-0 p-2 text-emerald-500"><Icon type="pin" className="w-3 h-3 fill-current" /></div>}

                    {/* 本文エリア：編集モードと通常表示を切り替え */}
                    <div className="flex-grow pb-4">
                      {editId === memo.id ? (
                        <div className="mt-2">
                          <textarea 
                            className="w-full bg-gray-50 p-3 rounded-xl text-sm focus:ring-0 outline-none border border-gray-100 h-24" 
                            value={editInput} 
                            onChange={(e) => setEditInput(e.target.value)} 
                          />
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
                            <button onClick={() => {const n=new Set(expandedIds); n.has(memo.id)?n.delete(memo.id):n.add(memo.id); setExpandedIds(n);}} className="text-xs text-emerald-500 font-bold mt-1 hover:underline">
                              {isExpanded ? '閉じる' : '続きを読む'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* アクションバー（日付＋タグ ＆ 各種ボタン） */}
                    <div className="flex justify-between items-center mt-1 pt-2 border-t border-gray-50">
                      
                      {/* 左側：日付、コピー、タグ */}
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-[10px] text-gray-300 font-bold tracking-wider">
                          {new Date(memo.date).toLocaleDateString()} {new Date(memo.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        
                        {/* コピーボタン */}
                        <button onClick={() => navigator.clipboard.writeText(memo.text)} className="text-gray-200 hover:text-emerald-500 transition-colors">
                          <Icon type="copy" className="w-3.5 h-3.5" />
                        </button>

                        {/* タグ表示エリア（日付の横） */}
                        {memo.tags && memo.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 border-l border-gray-100 pl-2">
                            {memo.tags.map(t => (
                              <span key={t} className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                                <Icon type="tag" className="w-3 h-3 text-gray-300" />
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 右側：タグ管理・ピン・メニュー（タイムラインと同じ） */}
                      <div className="flex items-center gap-4 relative">
                        {/* タグ管理ボタン＆メニュー */}
                        <div className="relative">
                          <button onClick={(e) => { e.stopPropagation(); setTagMenuOpenId(tagMenuOpenId === memo.id ? null : memo.id); setMenuOpenId(null); }} className={`${memo.tags && memo.tags.length > 0 ? 'text-emerald-500' : 'text-gray-200'} hover:text-emerald-500`}>
                            <Icon type="tag" className="w-4 h-4" />
                          </button>
                          
                          {/* タグ選択ポップアップ */}
                          {tagMenuOpenId === memo.id && (
                            <div className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                              <div className="px-4 pb-2 mb-1 border-b border-gray-50 flex justify-between items-center">
                                <span className="text-[10px] text-gray-400 font-bold">タグの追加・削除</span>
                              </div>
                              <div className="max-h-48 overflow-y-auto">
                                {availableTags.map(tag => {
                                  const isSelected = memo.tags && memo.tags.includes(tag.name);
                                  return (
                                    <button
                                      key={tag.id}
                                      onClick={() => toggleMemoTag(memo.id, memo.tags, tag.name)}
                                      className={`w-full text-left px-4 py-2 text-[11px] font-bold flex items-center justify-between ${isSelected ? 'bg-gray-50 text-gray-700' : 'text-gray-400 hover:bg-gray-50'}`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Icon type="write" className="w-3 h-3 opacity-50" />
                                        {tag.name}
                                      </div>
                                      {isSelected ? (
                                        <span className="text-gray-400 border border-gray-200 bg-white rounded px-1.5 py-0.5 text-[9px] shadow-sm">ー</span>
                                      ) : (
                                        <span className="text-gray-300 text-[10px]">＋</span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* ピン留めボタン */}
                        <button onClick={() => togglePin(memo)} className={`${memo.is_pinned ? 'text-emerald-500' : 'text-gray-200'} hover:text-emerald-500`}>
                          <Icon type="pin" className="w-4 h-4" />
                        </button>
                        
                        {/* メニュー（編集・削除） */}
                        <div className="relative">
                          <button onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === memo.id ? null : memo.id); setTagMenuOpenId(null); }} className="text-gray-200 hover:text-gray-400">
                            <Icon type="more" className="w-4 h-4" />
                          </button>
                          {menuOpenId === memo.id && (
                            <div className="absolute right-0 top-full mt-2 w-28 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 animate-in fade-in zoom-in-95">
                              <button onClick={() => {setEditId(memo.id); setEditInput(memo.text);}} className="w-full text-left px-4 py-2.5 text-[11px] font-bold hover:bg-gray-50 text-gray-600 border-b border-gray-50">
                                編集
                              </button>
                              <button onClick={() => deleteMemo(memo.id)} className="w-full text-left px-4 py-2.5 text-[11px] font-bold hover:bg-red-50 text-red-400">
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
              {searchMemos.length === 0 && <p className="text-center text-xs text-gray-400 mt-10">メモがありません</p>}
            </div>
          </div>
        )}

        {/* --- 🌿 育てるタブ --- */}
        {activeTab === 'garden' && (
          <div className="animate-in fade-in">
            <div className="mb-8 bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
              <input className="w-full bg-transparent border-none focus:ring-0 font-bold text-gray-700 placeholder-gray-200 text-lg" placeholder="育てるものの名前" value={gardenTitle} onChange={(e) => setGardenTitle(e.target.value)} />
              <textarea className="w-full bg-transparent border-none focus:ring-0 text-sm mt-2 h-24 placeholder-gray-200 resize-none" placeholder="大切にしたい言葉を..." value={gardenInput} onChange={(e) => setGardenInput(e.target.value)} />
              <div className="flex justify-end mt-4"><button onClick={() => addMemo('seed')} className="bg-emerald-400 text-white px-8 py-2 rounded-full text-xs font-bold shadow-md">種をまく</button></div>
            </div>
            <div className="grid gap-4">
              {gardenMemos.map((memo) => (
                <div key={memo.id} className="bg-white border-l-4 border-emerald-300 rounded-xl p-5 shadow-sm">
                  <h3 className="font-bold text-gray-800">{memo.title || "Untitled"}</h3>
                  <p className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">{memo.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- ⚙️ 設定タブ --- */}
        {activeTab === 'settings' && (
          <div className="animate-in fade-in space-y-6">
            <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Icon type="tag" className="w-5 h-5 text-emerald-500" />
                タグの管理
              </h2>

              {/* 新規追加エリア */}
              <div className="flex gap-2 mb-6 items-center">
                <input 
                  type="text" 
                  value={newTagName} 
                  onChange={(e) => setNewTagName(e.target.value)} 
                  placeholder="新しいタグ名" 
                  className="flex-grow bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
                <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer font-bold">
                  <input type="checkbox" checked={newTagIsHidden} onChange={(e) => setNewTagIsHidden(e.target.checked)} className="rounded text-emerald-500 focus:ring-emerald-500 border-gray-300 w-4 h-4" />
                  秘密
                </label>
                <button onClick={handleAddTag} disabled={!newTagName.trim()} className="bg-emerald-400 text-white px-4 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50 hover:bg-emerald-500 transition-colors shadow-sm">
                  追加
                </button>
              </div>

              {/* タグ一覧 */}
              <div className="space-y-2">
                {availableTags.map(tag => (
                  <div key={tag.id} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                    {editingTagId === tag.id ? (
                      <div className="flex flex-grow items-center gap-2">
                        <input 
                          type="text" 
                          value={editingTagName} 
                          onChange={(e) => setEditingTagName(e.target.value)} 
                          className="flex-grow bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
                        />
                        <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer whitespace-nowrap font-bold">
                          <input type="checkbox" checked={editingTagIsHidden} onChange={(e) => setEditingTagIsHidden(e.target.checked)} className="rounded text-emerald-500 focus:ring-emerald-500 border-gray-300 w-4 h-4" />
                          秘密
                        </label>
                        <button onClick={() => handleSaveEditTag(tag.id)} className="text-xs text-emerald-500 font-bold px-2 hover:underline">保存</button>
                        <button onClick={() => setEditingTagId(null)} className="text-xs text-gray-400 font-bold px-2 hover:underline">取消</button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-700">{tag.name}</span>
                          {tag.isHidden && <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-bold">🔒秘密</span>}
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => { setEditingTagId(tag.id); setEditingTagName(tag.name); setEditingTagIsHidden(tag.isHidden); }} className="text-xs text-gray-400 hover:text-emerald-500 font-bold">編集</button>
                          <button onClick={() => handleDeleteTag(tag.id)} className="text-xs text-gray-400 hover:text-red-500 font-bold">削除</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {availableTags.length === 0 && <p className="text-center text-xs text-gray-400 py-4">タグがありません</p>}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
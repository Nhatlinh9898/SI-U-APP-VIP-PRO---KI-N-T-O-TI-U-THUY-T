import React, { useState, useEffect, useRef } from 'react';
import { StoryNode, NodeType, GeneratorStyle } from './types';
import * as GeminiService from './services/geminiService';
import TreeNode from './components/TreeVisualization';
import VoiceStudio from './components/VoiceStudio';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // App State
  const [idea, setIdea] = useState('');
  const [rootNode, setRootNode] = useState<StoryNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<StoryNode | null>(null);
  
  // Editor State
  const [editorContent, setEditorContent] = useState('');
  const [generatedOptions, setGeneratedOptions] = useState<string[]>([]);
  const [genStyle, setGenStyle] = useState<GeneratorStyle>(GeneratorStyle.DRAMATIC);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Helper: Deep update node in tree
  const updateTree = (nodes: StoryNode, targetId: string, updater: (n: StoryNode) => StoryNode): StoryNode => {
    if (nodes.id === targetId) return updater(nodes);
    if (!nodes.children) return nodes;
    return {
      ...nodes,
      children: nodes.children.map(child => updateTree(child, targetId, updater))
    };
  };

  const handleToggleNode = (id: string) => {
    if (!rootNode) return;
    setRootNode(prev => prev ? updateTree(prev, id, (n) => ({ ...n, isExpanded: !n.isExpanded })) : null);
  };

  const handleSelectNode = (node: StoryNode) => {
    setSelectedNode(node);
    setEditorContent(node.content || '');
    setGeneratedOptions([]);
  };

  const handleGenerateStructure = async () => {
    if (!apiKey || !idea) return;
    setLoading(true);
    try {
      const tree = await GeminiService.generateStructure(apiKey, idea);
      setRootNode(tree);
      setSelectedNode(tree);
    } catch (error) {
      alert("Lỗi tạo cấu trúc: " + error);
    } finally {
      setLoading(false);
    }
  };

  const handleWriteContent = async () => {
    if (!apiKey || !selectedNode) return;
    setLoading(true);
    try {
      const context = `${selectedNode.type} ${selectedNode.title}`;
      const text = await GeminiService.generateContent(apiKey, context, genStyle, editorContent);
      setEditorContent(prev => prev + (prev ? "\n\n" : "") + text);
      
      // Auto save to tree state
      setRootNode(prev => prev ? updateTree(prev, selectedNode.id, n => ({...n, content: (n.content || "") + "\n\n" + text})) : null);
    } catch (error) {
      alert("Lỗi viết bài: " + error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestBridge = async () => {
    if (!apiKey || !selectedNode) return;
    setLoading(true);
    try {
       const context = selectedNode.title;
       const options = await GeminiService.generateBridge(apiKey, context, genStyle);
       setGeneratedOptions(options);
    } catch (e) {
      alert("Lỗi tạo dẫn chuyện");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTitle = async () => {
    if(!apiKey || !editorContent) return;
    setLoading(true);
    try {
        const newTitle = await GeminiService.generateTitle(apiKey, editorContent);
        // Update Title locally and in Tree
        if(selectedNode && rootNode) {
            const updatedTree = updateTree(rootNode, selectedNode.id, n => ({...n, title: newTitle}));
            setRootNode(updatedTree);
            // Need to re-find selected node to update local state view
            // Simplified: just update title locally for now, re-selection updates view
            setSelectedNode({...selectedNode, title: newTitle});
        }
    } catch (e) {
        alert("Lỗi tạo tiêu đề");
    } finally {
        setLoading(false);
    }
  }

  const insertOption = (text: string) => {
    setEditorContent(prev => prev + "\n\n" + text);
    setGeneratedOptions([]);
  };

  // --- RENDERING ---

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 overflow-hidden relative">
         {/* Background Effects */}
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-[#0f172a] to-[#0f172a] z-0"></div>
         
         <div className="relative z-10 w-full max-w-lg glass-panel p-8 rounded-2xl shadow-2xl border border-cyan-500/30 text-center">
            <h1 className="text-4xl md:text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 neon-text brand-font">
              SIÊU APP VIP PRO
            </h1>
            <p className="text-amber-300 tracking-widest text-sm mb-8 font-bold">KÍCH HOẠT HỆ THỐNG KIẾN TẠO TIỂU THUYẾT</p>
            
            <div className="space-y-6">
              <div className="text-left">
                <label className="block text-cyan-400 text-sm font-bold mb-2 ml-1">NHẬP GEMINI API KEY</label>
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-600 text-white rounded-xl px-4 py-3 focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.5)] outline-none transition-all placeholder-slate-600"
                  placeholder="AIzaSy..."
                />
                <p className="text-xs text-slate-500 mt-2 italic">* Khóa của bạn được sử dụng trực tiếp với Google, không lưu trữ trung gian.</p>
              </div>
              
              <button 
                onClick={() => apiKey && setHasKey(true)}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-cyan-900/50 transition-all transform hover:scale-105"
              >
                KHỞI ĐỘNG HỆ THỐNG 🚀
              </button>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-200 flex flex-col font-sans overflow-hidden">
      {/* HEADER */}
      <header className="h-16 border-b border-slate-700/50 bg-[#0f172a]/80 backdrop-blur-md flex items-center justify-center relative z-20 shadow-lg shadow-black/50">
        <div className="absolute left-4 top-4 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_red]"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_yellow]"></div>
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_green]"></div>
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-widest gold-text brand-font">
          SIÊU APP VIP PRO <span className="text-xs text-cyan-500 align-top opacity-70">v32.0</span>
        </h1>
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-600 text-xs text-cyan-400 font-mono animate-pulse">
                SYSTEM: ONLINE
            </span>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT: SETTINGS & TREE */}
        <div className="w-80 md:w-96 bg-[#0f172a] border-r border-slate-700/50 flex flex-col z-10 shadow-2xl">
          
          {/* Idea Input */}
          <div className="p-4 border-b border-slate-700/50 bg-slate-900/50">
            <label className="text-xs text-amber-500 font-bold uppercase tracking-wider mb-2 block">Ý Tưởng Cốt Lõi</label>
            <textarea
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-sm focus:border-amber-500 outline-none resize-none h-24 mb-3 placeholder-slate-600"
              placeholder="VD: Một chuyện tình xuyên không về thời nhà Trần..."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
            />
            <button 
                onClick={handleGenerateStructure}
                disabled={loading}
                className={`w-full py-2 rounded-lg font-bold text-sm shadow-lg transition-all
                  ${loading ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-amber-900/40'}
                `}
            >
               {loading ? 'ĐANG PHÂN TÍCH...' : '⚡ TẠO CẤU TRÚC TRUYỆN'}
            </button>
          </div>

          {/* Tree View */}
          <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
            {rootNode ? (
                <TreeNode 
                    node={rootNode} 
                    selectedId={selectedNode?.id || null}
                    onSelect={handleSelectNode}
                    onToggle={handleToggleNode}
                />
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
                    <span className="text-4xl mb-2">🌳</span>
                    <p className="text-xs uppercase tracking-widest">Chưa có dữ liệu</p>
                </div>
            )}
          </div>
        </div>

        {/* RIGHT: WORKSPACE */}
        <div className="flex-1 flex flex-col bg-slate-900/50 relative">
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>

          {selectedNode ? (
             <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
                
                {/* Editor Area */}
                <div className="flex-1 flex flex-col p-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                             <span className="px-2 py-0.5 rounded bg-cyan-900/30 text-cyan-400 text-xs border border-cyan-800 uppercase">{selectedNode.type}</span>
                             <input 
                                className="bg-transparent border-b border-transparent hover:border-slate-600 focus:border-amber-500 text-2xl font-bold text-amber-100 outline-none w-full md:w-96 content-font truncate"
                                value={selectedNode.title}
                                onChange={(e) => {
                                    // Update locally for responsiveness
                                    setSelectedNode({...selectedNode, title: e.target.value});
                                    // Sync with tree would happen on blur or debounce ideally
                                }}
                             />
                        </div>
                        <button 
                            onClick={handleGenerateTitle}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 px-3 py-1 rounded border border-slate-600 transition-colors"
                        >
                            ✨ Đặt Tên VIP
                        </button>
                    </div>

                    <div className="flex-1 relative group">
                        <textarea
                            className="w-full h-full bg-[#111827] border border-slate-700 rounded-xl p-6 text-lg leading-relaxed text-slate-300 resize-none focus:border-cyan-500/50 focus:shadow-[0_0_20px_rgba(6,182,212,0.1)] outline-none content-font"
                            value={editorContent}
                            onChange={(e) => setEditorContent(e.target.value)}
                            placeholder="Nội dung sẽ hiển thị ở đây..."
                        />
                        {loading && (
                            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="mt-4 text-cyan-400 font-bold animate-pulse">MASTER AI ĐANG SÁNG TÁC...</p>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Voice Studio integrated at bottom of editor */}
                    <VoiceStudio text={editorContent} />
                </div>

                {/* AI Tools Panel (Right Sidebar) */}
                <div className="w-80 bg-[#0f172a] border-l border-slate-700/50 p-4 overflow-y-auto">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-700 pb-2">AI CONTROL CENTER</h3>
                    
                    {/* Style Selector */}
                    <div className="mb-6">
                        <label className="text-xs text-slate-500 block mb-1">Phong Cách Sáng Tác</label>
                        <select 
                            value={genStyle}
                            onChange={(e) => setGenStyle(e.target.value as GeneratorStyle)}
                            className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-sm text-cyan-400 outline-none"
                        >
                            {Object.values(GeneratorStyle).map(style => (
                                <option key={style} value={style}>{style}</option>
                            ))}
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-1 gap-3">
                        <button 
                            onClick={handleWriteContent}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold shadow-lg shadow-indigo-900/50 transition-all group"
                        >
                            <span>✍️</span>
                            <span className="group-hover:tracking-wider transition-all">VIẾT TIẾP</span>
                        </button>

                        <button 
                            onClick={handleSuggestBridge}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold border border-slate-500 transition-all"
                        >
                            <span>🔗</span>
                            <span>GỢI Ý DẪN CHUYỆN</span>
                        </button>
                    </div>

                    {/* Generated Options Area */}
                    {generatedOptions.length > 0 && (
                        <div className="mt-6 animate-fadeIn">
                            <h4 className="text-xs text-green-400 font-bold mb-2 uppercase">Lựa chọn dẫn chuyện:</h4>
                            <div className="space-y-2">
                                {generatedOptions.map((opt, idx) => (
                                    <div 
                                        key={idx}
                                        onClick={() => insertOption(opt)}
                                        className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs cursor-pointer transition-colors hover:border-green-500"
                                    >
                                        {opt}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-8 p-4 bg-amber-900/20 border border-amber-900/50 rounded-xl">
                        <p className="text-xs text-amber-500/80 italic text-center">
                            "Mọi câu chữ đều là kiệt tác của tương lai." <br/> - Linh Master AI
                        </p>
                    </div>
                </div>

             </div>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] animate-bounce">
                    <span className="text-4xl">👈</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-400 mb-2">CHỌN MỘT PHÂN ĐOẠN</h2>
                <p className="max-w-md text-center text-sm">Hãy chọn một node từ cây cấu trúc bên trái để bắt đầu quá trình sáng tạo nội dung đỉnh cao.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

import React from 'react';
import { StoryNode, NodeType } from '../types';

interface TreeProps {
  node: StoryNode;
  selectedId: string | null;
  onSelect: (node: StoryNode) => void;
  onToggle: (nodeId: string) => void;
}

const TreeNode: React.FC<TreeProps> = ({ node, selectedId, onSelect, onToggle }) => {
  const isSelected = selectedId === node.id;
  
  const getIcon = (type: NodeType) => {
    switch (type) {
      case NodeType.NOVEL: return '📚';
      case NodeType.PART: return '📑';
      case NodeType.CHAPTER: return '📜';
      case NodeType.ACT: return '🎭';
      case NodeType.SECTION: return '🖋️';
      default: return '📄';
    }
  };

  const getColor = (type: NodeType) => {
     switch (type) {
      case NodeType.NOVEL: return 'text-amber-400';
      case NodeType.PART: return 'text-cyan-400';
      case NodeType.CHAPTER: return 'text-purple-400';
      case NodeType.ACT: return 'text-rose-400';
      case NodeType.SECTION: return 'text-emerald-400';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="pl-4 border-l border-slate-700/50 ml-2">
      <div 
        className={`
            flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-all duration-200
            ${isSelected ? 'bg-slate-700 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'hover:bg-slate-800'}
        `}
        onClick={(e) => {
            e.stopPropagation();
            onSelect(node);
        }}
      >
        <button 
            onClick={(e) => {
                e.stopPropagation();
                onToggle(node.id);
            }}
            className="w-4 h-4 flex items-center justify-center text-xs text-slate-500 hover:text-white"
        >
            {node.children && node.children.length > 0 ? (node.isExpanded ? '▼' : '▶') : '•'}
        </button>
        <span className={`text-lg ${getIcon(node.type) === '📚' ? 'text-2xl' : ''}`}>{getIcon(node.type)}</span>
        <span className={`font-medium truncate text-sm ${getColor(node.type)} ${isSelected ? 'font-bold' : ''}`}>
            {node.title}
        </span>
      </div>

      {node.isExpanded && node.children && (
        <div className="animate-fadeIn">
          {node.children.map((child) => (
            <TreeNode 
              key={child.id} 
              node={child} 
              selectedId={selectedId} 
              onSelect={onSelect} 
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;

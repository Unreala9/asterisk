import React, { useState } from 'react';
import {
  MessageSquare,
  Users,
  Terminal,
  PhoneForwarded,
  Hash,
  GitBranch,
  UserCheck,
  MessageCircle,
  Binary,
  Code,
  Cpu,
  PowerOff,
  StickyNote,
  Search,
  Grid
} from 'lucide-react';
import { NodeType } from './types';

interface NodePaletteProps {
  onAddNode: (type: NodeType) => void;
}

interface PaletteItem {
  type: NodeType;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  colorClass: string;
  iconColorClass: string;
}

export const paletteItems: PaletteItem[] = [
  {
    type: 'conversation',
    label: 'Conversation',
    description: 'Speak and listen to the user',
    icon: MessageSquare,
    colorClass: 'bg-rose-50 border-rose-200 hover:bg-rose-100/70',
    iconColorClass: 'text-rose-600 bg-rose-100'
  },
  {
    type: 'subagent',
    label: 'Subagent',
    description: 'Delegate to a specialized subagent',
    icon: Users,
    colorClass: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100/70',
    iconColorClass: 'text-emerald-600 bg-emerald-100'
  },
  {
    type: 'function',
    label: 'Function',
    description: 'Call external REST APIs',
    icon: Terminal,
    colorClass: 'bg-purple-50 border-purple-200 hover:bg-purple-100/70',
    iconColorClass: 'text-purple-600 bg-purple-100'
  },
  {
    type: 'call_transfer',
    label: 'Call Transfer',
    description: 'Transfer call to human operator',
    icon: PhoneForwarded,
    colorClass: 'bg-orange-50 border-orange-200 hover:bg-orange-100/70',
    iconColorClass: 'text-orange-600 bg-orange-100'
  },
  {
    type: 'press_digit',
    label: 'Press Digit',
    description: 'Send DTMF tones or dialpad digits',
    icon: Hash,
    colorClass: 'bg-blue-50 border-blue-200 hover:bg-blue-100/70',
    iconColorClass: 'text-blue-600 bg-blue-100'
  },
  {
    type: 'logic_split',
    label: 'Logic Split',
    description: 'Conditional routing logic branch',
    icon: GitBranch,
    colorClass: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100/70',
    iconColorClass: 'text-indigo-600 bg-indigo-100'
  },
  {
    type: 'agent_transfer',
    label: 'Agent Transfer',
    description: 'Hand over to a different voice agent',
    icon: UserCheck,
    colorClass: 'bg-amber-50 border-amber-200 hover:bg-amber-100/70',
    iconColorClass: 'text-amber-600 bg-amber-100'
  },
  {
    type: 'in_call_sms',
    label: 'In-Call SMS',
    description: 'Trigger text message to caller',
    icon: MessageCircle,
    colorClass: 'bg-teal-50 border-teal-200 hover:bg-teal-100/70',
    iconColorClass: 'text-teal-600 bg-teal-100'
  },
  {
    type: 'extract_variable',
    label: 'Extract Variable',
    description: 'Parse info out of transcript context',
    icon: Binary,
    colorClass: 'bg-slate-50 border-slate-200 hover:bg-slate-100/70',
    iconColorClass: 'text-slate-600 bg-slate-100'
  },
  {
    type: 'code',
    label: 'Code',
    description: 'Execute custom JS code snippet',
    icon: Code,
    colorClass: 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100/70',
    iconColorClass: 'text-neutral-600 bg-neutral-100'
  },
  {
    type: 'mcp',
    label: 'MCP',
    description: 'Run Model Context Protocol tool',
    icon: Cpu,
    colorClass: 'bg-fuchsia-50 border-fuchsia-200 hover:bg-fuchsia-100/70',
    iconColorClass: 'text-fuchsia-600 bg-fuchsia-100'
  },
  {
    type: 'ending',
    label: 'Ending',
    description: 'Hang up and terminate call session',
    icon: PowerOff,
    colorClass: 'bg-red-50 border-red-200 hover:bg-red-100/70',
    iconColorClass: 'text-red-600 bg-red-100'
  },
  {
    type: 'note',
    label: 'Note',
    description: 'Place comments or canvas guidelines',
    icon: StickyNote,
    colorClass: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100/70',
    iconColorClass: 'text-yellow-600 bg-yellow-100'
  }
];

export function NodePalette({ onAddNode }: NodePaletteProps) {
  const [activeTab, setActiveTab] = useState<'node' | 'components'>('node');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = paletteItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-[280px] border-r border-[#dfdfdf] bg-white flex flex-col h-full shrink-0 select-none">
      {/* Tab Switcher */}
      <div className="p-3 border-b border-[#dfdfdf] flex gap-1">
        <button
          onClick={() => setActiveTab('node')}
          className={`flex-1 py-2 px-3 text-[13px] font-medium rounded-lg transition-all duration-150 ${
            activeTab === 'node'
              ? 'bg-neutral-100 text-black shadow-sm'
              : 'text-neutral-500 hover:text-black hover:bg-neutral-50'
          }`}
        >
          Node
        </button>
        <button
          onClick={() => setActiveTab('components')}
          className={`flex-1 py-2 px-3 text-[13px] font-medium rounded-lg transition-all duration-150 ${
            activeTab === 'components'
              ? 'bg-neutral-100 text-black shadow-sm'
              : 'text-neutral-500 hover:text-black hover:bg-neutral-50'
          }`}
        >
          Components
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-[#dfdfdf]">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-[13px] bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:border-black focus:bg-white transition-all duration-150"
          />
        </div>
      </div>

      {/* Node List Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {activeTab === 'node' ? (
          filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.type}
                onClick={() => onAddNode(item.type)}
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', item.type);
                }}
                className={`flex items-start gap-3 p-3 rounded-[14px] border border-solid cursor-pointer transition-all duration-150 ${item.colorClass} select-none active:scale-95`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 flex items-center justify-center ${item.iconColorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-[13px] font-[500] text-black tracking-tight leading-tight">{item.label}</h4>
                  <p className="text-[11px] text-neutral-500 font-[320] leading-snug truncate">{item.description}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-4">
            <Grid className="h-10 w-10 text-neutral-300" />
            <div className="space-y-1">
              <h5 className="text-[13px] font-[500] text-black">Reusable Components</h5>
              <p className="text-[11px] text-neutral-400 font-[320] max-w-[200px]">
                Create sub-flows or component modules to reuse logic blocks across agents.
              </p>
            </div>
            <button className="text-[12px] bg-black text-white px-4 py-1.5 rounded-full font-medium hover:bg-neutral-800 transition-colors shadow-sm">
              Create Component
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

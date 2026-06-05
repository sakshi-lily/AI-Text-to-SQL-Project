import { Database, LogOut, History, ChevronRight, HelpCircle } from 'lucide-react';
import type { ConnectionStatus } from '../utils/api';

interface SidebarProps {
  connectionStatus: ConnectionStatus;
  history: string[];
  onSelectHistory: (prompt: string) => void;
  onClearHistory: () => void;
  onDisconnect: () => void;
}

export default function Sidebar({
  connectionStatus,
  history,
  onSelectHistory,
  onClearHistory,
  onDisconnect
}: SidebarProps) {
  return (
    <aside className="w-80 shrink-0 min-h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 p-6 flex flex-col justify-between relative z-20 transition-colors duration-300">
      
      <div className="space-y-8">
        {/* Header Branding */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-blue-500 to-indigo-600 p-2.5 rounded-xl text-white shadow-md shadow-blue-500/10">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight dark:text-white leading-none">AI Text-to-SQL</h1>
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1 inline-block">Evaluation Portal</span>
          </div>
        </div>

        {/* Database Connection Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Database Connection</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          
          <div className="space-y-2 text-xs">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 break-all">{connectionStatus.database || 'University Database'}</h3>
            
            <div className="space-y-1 text-[11px] font-semibold text-slate-500 dark:text-slate-450 leading-relaxed">
              <div className="flex justify-between items-center">
                <span>Status:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Engine:</span>
                <span className="text-slate-700 dark:text-slate-300 font-bold">SQLite/MySQL</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Tables:</span>
                <span className="text-slate-700 dark:text-slate-300 font-bold">2</span>
              </div>
            </div>
          </div>

          <button
            onClick={onDisconnect}
            className="w-full mt-1.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Disconnect Session
          </button>
        </div>

        {/* Recent Queries List */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-400" />
              Query History
            </span>
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-[9px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white uppercase tracking-wider"
              >
                Clear
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-1">
              <HelpCircle className="w-5 h-5 text-slate-350 dark:text-slate-650 mx-auto" />
              <p className="text-[10px] font-bold text-slate-400">No recent queries</p>
              <p className="text-[9px] text-slate-400 leading-normal">Your translations will accumulate here for easy execution.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {history.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectHistory(prompt)}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 dark:border-slate-850 hover:border-blue-400 dark:hover:border-blue-800 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-white dark:hover:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all flex items-start justify-between gap-2 group cursor-pointer"
                >
                  <span className="line-clamp-2 leading-relaxed">{prompt}</span>
                  <ChevronRight className="w-4 h-4 shrink-0 text-slate-350 dark:text-slate-650 group-hover:translate-x-0.5 group-hover:text-blue-500 transition-all mt-0.5" />
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Database Schema Status Indicator footer */}
      <div className="space-y-2 border-t border-slate-200 dark:border-slate-800/80 pt-4">
        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
          <span>Engine Model</span>
          <span className="text-blue-600 dark:text-blue-400 font-bold">SQLite v3.x</span>
        </div>
        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
          <span>Seeded Tables</span>
          <span className="dark:text-slate-300 font-bold">2 Tables (15 rows)</span>
        </div>
      </div>

    </aside>
  );
}

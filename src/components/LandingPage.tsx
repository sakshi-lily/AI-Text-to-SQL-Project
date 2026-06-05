import { Database, ArrowRight, BarChart3, Cpu, ShieldAlert, Zap, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onEnterDemoMode: () => void;
}

export default function LandingPage({ onGetStarted, onEnterDemoMode }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 bg-grid-pattern relative overflow-hidden">
      
      {/* Background Radial blur effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-indigo-400/10 dark:bg-indigo-600/10 blur-[120px] pointer-events-none" />

      {/* Header logo */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-md shadow-blue-500/20 text-white animate-pulse-glow">
            <Database className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            AI Database Intelligence Platform
          </span>
        </div>
        <button
          onClick={onGetStarted}
          className="px-5 py-2 rounded-xl text-sm font-semibold glass-card hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800 hover:border-blue-450 dark:hover:border-blue-800 flex items-center gap-2 cursor-pointer"
        >
          Launch Platform <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 relative z-10 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 mb-8 animate-fade-in">
          <Cpu className="w-3.5 h-3.5" /> Platform Active: v2.0 Enterprise-Grade
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black tracking-tight max-w-4xl leading-tight dark:text-white mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Unified Database Interface Driven by{" "}
          <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Natural Language AI
          </span>
        </h1>
        
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Translate Hindi or English statements into optimal database SQL, enforce query security safety scans, tune syntax with built-in code optimizers, and auto-generate data trends dashboard reports.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in justify-center items-center" style={{ animationDelay: '0.3s' }}>
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-500 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-blue-600/20 dark:shadow-blue-900/30 flex items-center justify-center gap-3 cursor-pointer"
          >
            Access Platform Workspace <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={onEnterDemoMode}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-blue-600 dark:text-blue-450 hover:text-blue-500 bg-white dark:bg-slate-900 border border-blue-200/50 dark:border-blue-900/40 hover:bg-blue-500/5 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4 animate-pulse" /> Try in Demo Sandbox
          </button>
        </div>

        {/* Visual Interactive Dashboard mockup */}
        <div className="w-full max-w-5xl mt-16 rounded-2xl glass-panel p-3 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl relative z-10 group transition-all duration-500 hover:border-indigo-500/30">
          <div className="bg-slate-900 dark:bg-slate-950 rounded-xl overflow-hidden shadow-inner border border-slate-950">
            {/* Mock Header controls */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800/60">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/85" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/85" />
                <span className="w-3 h-3 rounded-full bg-green-500/85" />
              </div>
              <span className="text-xs font-semibold text-slate-500">AI Database Intelligence Platform Dashboard</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-450 border border-emerald-500/20">SQL Safe</span>
              </div>
            </div>
            
            {/* Mock Dashboard Contents */}
            <div className="p-6 text-left grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[300px] text-sm text-slate-350">
              <div className="space-y-4">
                <div className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase">User Request Statement</div>
                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 font-medium">
                  "Find the average budget of all departments and show the highest one."
                </div>
                <div className="flex justify-start gap-2 pt-2">
                  <span className="px-2 py-1 rounded bg-slate-800 text-[9px] font-bold">Tables: departments</span>
                  <span className="px-2 py-1 rounded bg-slate-800 text-[9px] font-bold">Filters: none</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">Optimized Generated SQL Query</div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-emerald-350 leading-relaxed overflow-x-auto text-xs whitespace-pre">
                  <span className="text-indigo-455">SELECT</span> id, department_name, budget <span className="text-indigo-455">FROM</span> departments<br />
                  <span className="text-indigo-455">ORDER BY</span> budget <span className="text-indigo-455">DESC</span>;
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24 relative z-10 border-t border-slate-200 dark:border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight dark:text-white mb-4">
            Unified Database Auditing & Analysis Suite
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            A comprehensive, low-code interface linking prompt processing with dynamic query security validation, performance tuning, and dashboard reports.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-900 group hover:border-blue-400/40 dark:hover:border-blue-500/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg mb-2 dark:text-white">Conversational SQL</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Speaks database language in Hindi or English. Translates speech and holds context across follow-up refinement messages.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-900 group hover:border-rose-400/40 dark:hover:border-rose-500/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-450 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg mb-2 dark:text-white">Security Auditing</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Real-time syntax validation. Scans query commands to protect relational files, blocking modifying actions.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-900 group hover:border-amber-400/40 dark:hover:border-amber-500/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-405 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg mb-2 dark:text-white">Performance Tuning</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Identifies sub-optimal full-table scans, wildcard selects, or implicit ANSI-89 joins, recommending optimized equivalents.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-900 group hover:border-purple-400/40 dark:hover:border-purple-500/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg mb-2 dark:text-white">AI Data Insights</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Auto-computes mathematical summaries, outlier groupings, and recommendations from output tables, displaying trends.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white/40 dark:bg-slate-950/40 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500 p-1.5 rounded-lg text-white">
              <Database className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight dark:text-white">
              AI Database Intelligence Platform
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Unified Enterprise platform &copy; 2026. Powered by React, Spring Boot & MySQL.
          </p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              Enterprise Ready
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

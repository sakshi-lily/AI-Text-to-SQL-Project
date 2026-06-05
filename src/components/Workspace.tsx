import { useState, useEffect } from 'react';
import { Play, Copy, Check, Sparkles, AlertCircle, RefreshCw, BarChart2, CheckCircle2, XCircle, Table, ChevronLeft, ChevronRight, GraduationCap, Building2, TrendingUp, Clock, Award, Network, ListCollapse } from 'lucide-react';
import { translatePrompt, executeSql, getDbSchemas } from '../utils/api';
import type { QueryResult, ConnectionStatus } from '../utils/api';

interface WorkspaceProps {
  apiKey: string;
  connectionStatus: ConnectionStatus;
  onNewQuery: (prompt: string) => void;
  selectedQueryFromHistory: string | null;
  onClearSelectedQuery: () => void;
}

export default function Workspace({
  apiKey,
  connectionStatus,
  onNewQuery,
  selectedQueryFromHistory,
  onClearSelectedQuery
}: WorkspaceProps) {
  // UI states
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Translation & Execution states
  const [sql, setSql] = useState('');
  const [explanation, setExplanation] = useState<any | null>(null);
  const [translationSource, setTranslationSource] = useState('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Counter metrics
  const [metrics, setMetrics] = useState({
    total: 0,
    success: 0,
    failed: 0,
    tables: 2,
    totalRecords: 0,
    avgQueryTime: 0,
    aiAccuracy: 98.5
  });

  // Fetch metrics and active table count on load
  useEffect(() => {
    const fetchTablesCount = async () => {
      try {
        const schemas = await getDbSchemas();
        setMetrics(m => ({ ...m, tables: Object.keys(schemas).length }));
      } catch (e) {}
    };
    fetchTablesCount();
  }, []);

  // Handle selected query from sidebar history
  useEffect(() => {
    if (selectedQueryFromHistory) {
      setPrompt(selectedQueryFromHistory);
      handleGenerate(selectedQueryFromHistory);
      onClearSelectedQuery(); // Reset trigger
    }
  }, [selectedQueryFromHistory]);

  const handleGenerate = async (targetPrompt?: string) => {
    const promptToUse = targetPrompt || prompt;
    if (!promptToUse.trim()) return;

    setGenerating(true);
    setSql('');
    setExplanation(null);
    setQueryResult(null);
    onNewQuery(promptToUse);

    const startTime = performance.now();

    try {
      const res = await translatePrompt(promptToUse, apiKey);
      setSql(res.sql);
      setExplanation(res.explanation || null);
      setTranslationSource(res.source);
      
      // Auto execute query right after generating
      await handleExecute(res.sql, startTime);
    } catch (e) {
      setSql('-- Failed to generate SQL. Please check connection or retry.');
      setMetrics(m => {
        const newFailed = m.failed + 1;
        const newTotal = m.total + 1;
        const totalQueries = m.success + newFailed;
        return {
          ...m,
          failed: newFailed,
          total: newTotal,
          aiAccuracy: (m.success / Math.max(1, totalQueries)) * 100
        };
      });
      setGenerating(false);
    }
  };

  const handleExecute = async (sqlToRun: string, startTime?: number) => {
    if (!sqlToRun.trim()) return;
    setExecuting(true);
    setCurrentPage(1); // Reset page to first page

    const execStartTime = performance.now();

    try {
      const res = await executeSql(sqlToRun);
      setQueryResult(res);
      
      const durationMs = performance.now() - (startTime || execStartTime);
      
      if (res.error) {
        setMetrics(m => {
          const newFailed = m.failed + 1;
          const newTotal = m.total + 1;
          const totalQueries = m.success + newFailed;
          return {
            ...m,
            failed: newFailed,
            total: newTotal,
            avgQueryTime: m.avgQueryTime === 0 ? durationMs : (m.avgQueryTime * (m.success + m.failed) + durationMs) / totalQueries,
            aiAccuracy: (m.success / totalQueries) * 100
          };
        });
      } else {
        setMetrics(m => {
          const newSuccess = m.success + 1;
          const newTotal = m.total + 1;
          const totalQueries = newSuccess + m.failed;
          const returnedRows = res.rows ? res.rows.length : 0;
          return {
            ...m,
            success: newSuccess,
            total: newTotal,
            totalRecords: m.totalRecords + returnedRows,
            avgQueryTime: m.avgQueryTime === 0 ? durationMs : (m.avgQueryTime * (m.success + m.failed) + durationMs) / totalQueries,
            aiAccuracy: (newSuccess / totalQueries) * 100
          };
        });
      }
    } catch (e) {
      setQueryResult({
        columns: [],
        rows: [],
        error: 'Execution failed: Unable to connect to server.'
      });
      setMetrics(m => {
        const newFailed = m.failed + 1;
        const newTotal = m.total + 1;
        const totalQueries = m.success + newFailed;
        return {
          ...m,
          failed: newFailed,
          total: newTotal,
          aiAccuracy: (m.success / Math.max(1, totalQueries)) * 100
        };
      });
    } finally {
      setExecuting(false);
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!sql) return;
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    handleGenerate(suggestion);
  };

  const categorizedTemplates = [
    {
      category: "Student Queries",
      icon: GraduationCap,
      color: "text-blue-500 border-blue-200/50 bg-blue-50/40 dark:bg-blue-950/20 dark:border-blue-900/40",
      items: [
        { label: "High GPA CS Students", text: "Show all students in Computer Science with a CGPA above 3.5" },
        { label: "ME Students sorted by CGPA", text: "List students in Mechanical Engineering sorted by CGPA from lowest to highest" }
      ]
    },
    {
      category: "Department Queries",
      icon: Building2,
      color: "text-indigo-500 border-indigo-200/50 bg-indigo-50/40 dark:bg-indigo-950/20 dark:border-indigo-900/40",
      items: [
        { label: "Department Budgets & Heads", text: "Show the budget and head of each department" },
        { label: "Show All Departments", text: "List all departments" }
      ]
    },
    {
      category: "Analytics Queries",
      icon: TrendingUp,
      color: "text-purple-500 border-purple-200/50 bg-purple-50/40 dark:bg-purple-950/20 dark:border-purple-900/40",
      items: [
        { label: "Top 3 Students by GPA", text: "Get the top 3 students by CGPA" },
        { label: "Biology Enrollment Count", text: "How many students are enrolled in Biology?" }
      ]
    }
  ];
  // Pagination calculation
  const totalRows = queryResult?.rows.length || 0;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const paginatedRows = queryResult?.rows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  ) || [];

  // Helper to map columns to proper labels
  const getHeaderLabel = (colName: string) => {
    const mapping: Record<string, string> = {
      id: 'Student ID',
      name: 'Name',
      department: 'Department',
      cgpa: 'CGPA',
      enrollment_year: 'Enrollment Year',
      email: 'Email Address',
      dept_id: 'Dept ID',
      dept_name: 'Department Name',
      head: 'Department Head',
      budget: 'Annual Budget'
    };
    return mapping[colName.toLowerCase()] || colName;
  };

  return (
    <div className="flex-1 p-6 space-y-6 max-h-screen overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* 1. Metrics Card Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
        {/* Metric 1 */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-900 flex items-center justify-between group hover:border-blue-500/20 transition-all duration-300">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Queries</span>
            <span className="text-2xl font-black tracking-tight dark:text-white mt-1.5 block">{metrics.total}</span>
          </div>
          <div className="bg-blue-100 dark:bg-blue-950/60 p-3 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <BarChart2 className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-900 flex items-center justify-between group hover:border-emerald-500/20 transition-all duration-300">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Successful Queries</span>
            <span className="text-2xl font-black tracking-tight dark:text-white mt-1.5 block">{metrics.success}</span>
          </div>
          <div className="bg-emerald-100 dark:bg-emerald-950/60 p-3 rounded-xl text-emerald-655 dark:text-emerald-400 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-900 flex items-center justify-between group hover:border-rose-500/20 transition-all duration-300">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Failed Queries</span>
            <span className="text-2xl font-black tracking-tight dark:text-white mt-1.5 block">{metrics.failed}</span>
          </div>
          <div className="bg-rose-100 dark:bg-rose-950/60 p-3 rounded-xl text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-900 flex items-center justify-between group hover:border-indigo-500/20 transition-all duration-300">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Database Tables</span>
            <span className="text-2xl font-black tracking-tight dark:text-white mt-1.5 block">{metrics.tables}</span>
          </div>
          <div className="bg-indigo-100 dark:bg-indigo-950/60 p-3 rounded-xl text-indigo-650 dark:text-indigo-400 group-hover:scale-110 transition-transform">
            <Table className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 5 */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-900 flex items-center justify-between group hover:border-yellow-500/20 transition-all duration-300">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Avg Query Time</span>
            <span className="text-2xl font-black tracking-tight dark:text-white mt-1.5 block">
              {metrics.avgQueryTime === 0 
                ? "0ms" 
                : (metrics.avgQueryTime < 1000 
                    ? `${Math.round(metrics.avgQueryTime)}ms` 
                    : `${(metrics.avgQueryTime / 1000).toFixed(2)}s`
                  )
              }
            </span>
          </div>
          <div className="bg-yellow-100 dark:bg-yellow-950/60 p-3 rounded-xl text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 6 */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-900 flex items-center justify-between group hover:border-teal-500/20 transition-all duration-300">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">AI Accuracy</span>
            <span className="text-2xl font-black tracking-tight dark:text-white mt-1.5 block">
              {metrics.aiAccuracy.toFixed(1)}%
            </span>
          </div>
          <div className="bg-teal-100 dark:bg-teal-950/60 p-3 rounded-xl text-teal-650 dark:text-teal-400 group-hover:scale-110 transition-transform">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 7 */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-900 flex items-center justify-between group hover:border-orange-500/20 transition-all duration-300">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Records Fetched</span>
            <span className="text-2xl font-black tracking-tight dark:text-white mt-1.5 block">
              {metrics.totalRecords}
            </span>
          </div>
          <div className="bg-orange-100 dark:bg-orange-950/60 p-3 rounded-xl text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
            <ListCollapse className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 8 */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-900 flex items-center justify-between group hover:border-purple-500/20 transition-all duration-300">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Active Connections</span>
            <span className="text-2xl font-black tracking-tight dark:text-white mt-1.5 block">
              {connectionStatus.connected ? "1 Active" : "0 Active"}
            </span>
          </div>
          <div className="bg-purple-100 dark:bg-purple-950/60 p-3 rounded-xl text-purple-650 dark:text-purple-400 group-hover:scale-110 transition-transform">
            <Network className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* 2. Large Query Input Card */}
      <section className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-900 shadow-sm animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
          Ask Database
        </h3>

        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={3}
            className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors shadow-inner resize-none leading-relaxed"
            placeholder="Ask your database question in English"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Quick Hints */}
            <span className="text-[10px] text-slate-400 font-medium">
              💡 Press <strong>Enter</strong> to translate and execute automatically
            </span>

            <button
              onClick={() => handleGenerate()}
              disabled={generating || !prompt.trim()}
              className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all shadow-md shadow-blue-500/10"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate SQL
                </>
              )}
            </button>
          </div>

          {/* Categorized Query Templates */}
          <div className="space-y-3 pt-3 border-t border-slate-200/60 dark:border-slate-850/60">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Query Templates</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categorizedTemplates.map((cat, cIdx) => {
                const IconComponent = cat.icon;
                return (
                  <div key={cIdx} className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                      <div className={`p-1.5 rounded-lg border ${cat.color}`}>
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <span>{cat.category}</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {cat.items.map((item, iIdx) => (
                        <button
                          key={iIdx}
                          onClick={() => handleSuggestionClick(item.text)}
                          className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-blue-400/40 dark:border-slate-850/80 dark:hover:border-blue-800/80 bg-slate-50/50 hover:bg-blue-50/10 dark:bg-slate-900/10 dark:hover:bg-slate-800/20 text-xs text-slate-600 dark:text-slate-400 hover:text-blue-650 dark:hover:text-blue-400 transition-all cursor-pointer flex flex-col gap-1 group shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                          title="Click to load query template"
                        >
                          <span className="font-bold text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors">
                            {item.label}
                          </span>
                          <span className="line-clamp-2 leading-relaxed font-medium">
                            {item.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Generated SQL Card */}
      <section className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-900 shadow-sm relative overflow-hidden animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-500" />
            Generated SQL
          </h3>
          
          <div className="flex items-center gap-2">
            {translationSource && (
              <span className="text-[9px] font-extrabold text-blue-500 uppercase bg-blue-50 dark:bg-blue-950/20 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-900/60 tracking-wider">
                {translationSource}
              </span>
            )}
            {sql && (
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80 text-slate-500 hover:text-slate-850 dark:hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                title="Copy SQL to Clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[10px] font-bold uppercase tracking-wider">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Read-Only Code Container with custom loading animation overlay */}
        <div className="relative rounded-2xl border border-slate-200 dark:border-slate-850 bg-slate-900 dark:bg-slate-950 overflow-hidden min-h-[110px]">
          
          {generating && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-slate-900/90 text-white animate-pulse">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
              <span className="text-xs font-bold tracking-widest uppercase text-blue-400">Generating SQL...</span>
            </div>
          )}

          {!sql && !generating ? (
            <div className="p-6 text-center text-slate-500 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">Example reference query</span>
              <code className="text-xs text-slate-500 block font-mono bg-slate-950 p-3 rounded-lg border border-slate-950">
                SELECT id, name, department, cgpa FROM students WHERE cgpa &gt; 3.8;
              </code>
            </div>
          ) : (
            <pre className="p-5 font-mono text-emerald-400 text-xs overflow-x-auto leading-relaxed select-all">
              {sql}
            </pre>
          )}
        </div>
      </section>

      {/* AI Query Explanation Card */}
      {explanation && (
        <section className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-900 shadow-sm animate-fade-in" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse-glow" />
              AI Query Explanation
            </h3>
            
            {explanation.confidence_score && (
              <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border tracking-wide flex items-center gap-1.5 ${
                explanation.confidence_score >= 95
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-250/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-250/30 text-yellow-600 dark:text-yellow-400'
              }`}>
                <span>Confidence:</span>
                <strong>{explanation.confidence_score}%</strong>
              </span>
            )}
          </div>

          <div className="space-y-4">
            {/* Simple English Explanation */}
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {explanation.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Tables & Sorting Grid */}
              <div className="space-y-3 p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-850/60">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Tables Used</span>
                  <div className="flex flex-wrap gap-1.5">
                    {explanation.tables && explanation.tables.length > 0 ? (
                      explanation.tables.map((t: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                          {t}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">None</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Sorting Applied</span>
                  {explanation.sorting && explanation.sorting.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {explanation.sorting.map((s: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500 italic">No sorting applied</span>
                  )}
                </div>
              </div>

              {/* Filters & Output Grid */}
              <div className="space-y-3 p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-850/60 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Filters Applied</span>
                  {explanation.filters && explanation.filters.length > 0 ? (
                    <ul className="space-y-1.5 text-xs text-slate-650 dark:text-slate-400 list-disc list-inside">
                      {explanation.filters.map((f: string, idx: number) => (
                        <li key={idx} className="leading-relaxed">
                          {f}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500 italic">No filters applied</span>
                  )}
                </div>

                <div className="border-t border-slate-200/60 dark:border-slate-850/60 pt-3 mt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Expected Output</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {explanation.expected_output}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Database Results Table */}
      <section className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-900 shadow-sm animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Table className="w-4 h-4 text-indigo-500" />
            Execution Results
          </h3>
          
          {sql && (
            <button
              onClick={() => handleExecute(sql)}
              disabled={executing || generating}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-650 hover:from-emerald-500 hover:to-teal-500 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-md shadow-emerald-500/10"
            >
              {executing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              Run Query
            </button>
          )}
        </div>

        {/* Results states (loading / empty / table / error) */}
        {executing ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
            <div className="divide-y divide-slate-100 dark:divide-slate-850/60 rounded-2xl border border-slate-200 dark:border-slate-850/80 bg-white/50 dark:bg-slate-900/20 p-4 space-y-4">
              <div className="h-5 bg-slate-250 dark:bg-slate-800 rounded w-5/6" />
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-4/6 pt-4" />
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-5/6 pt-4" />
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/6 pt-4" />
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px] py-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
              <span>Executing Query & Fetching Results...</span>
            </div>
          </div>
        ) : queryResult?.error ? (
          <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/15 text-rose-800 dark:text-rose-400 leading-relaxed text-xs flex gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
            <div>
              <strong className="font-bold uppercase tracking-wider block mb-1">SQL Execution Failed</strong>
              <code className="font-mono text-[10px] break-all">{queryResult.error}</code>
            </div>
          </div>
        ) : !queryResult ? (
          <div className="py-16 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Table className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="font-bold">No active query execution</p>
            <p className="text-slate-500 mt-1 leading-normal">Enter a prompt above and click generate to query the SQLite tables.</p>
          </div>
        ) : queryResult.rows.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="font-bold">Empty dataset</p>
            <p className="text-slate-500 mt-1 leading-normal">The query compiled successfully, but returned 0 rows matching criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Table Container */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-850/80 bg-white/50 dark:bg-slate-900/20">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850/85">
                    {queryResult.columns.map((col, idx) => (
                      <th key={idx} className="px-5 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {getHeaderLabel(col)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60">
                  {paginatedRows.map((row, rIdx) => (
                    <tr 
                      key={rIdx} 
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors"
                    >
                      {queryResult.columns.map((col, cIdx) => (
                        <td key={cIdx} className="px-5 py-4 font-medium dark:text-slate-200">
                          {row[col] === null || row[col] === undefined 
                            ? <span className="text-slate-350 dark:text-slate-650 font-bold italic">NULL</span>
                            : row[col].toString()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Page {currentPage} of {totalPages} ({totalRows} records)
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Execution indicator badge */}
            <div className="flex items-center justify-end text-[9px] text-slate-400 font-bold uppercase tracking-wider gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Queried on {queryResult.source || 'Local Engine'}</span>
            </div>

          </div>
        )}
      </section>

    </div>
  );
}

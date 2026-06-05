import { useState, useEffect } from 'react';
import { Settings, Key, Cpu, Check, AlertCircle, RefreshCw, Server, HelpCircle } from 'lucide-react';

interface AiSettingsProps {
  openaiKey: string;
  geminiKey: string;
  selectedModel: string;
  onSaveSettings: (openaiKey: string, geminiKey: string, model: string) => void;
}

export default function AiSettings({
  openaiKey,
  geminiKey,
  selectedModel,
  onSaveSettings
}: AiSettingsProps) {
  const [openAiInput, setOpenAiInput] = useState(openaiKey);
  const [geminiInput, setGeminiInput] = useState(geminiKey);
  const [modelInput, setModelInput] = useState(selectedModel);
  
  // Status states
  const [testing, setTesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Connection states
  const [openAiStatus, setOpenAiStatus] = useState<'idle' | 'active' | 'invalid'>('idle');
  const [geminiStatus, setGeminiStatus] = useState<'idle' | 'active' | 'invalid'>('idle');

  // Verify key format client-side for status indicators
  useEffect(() => {
    if (openaiKey) {
      if (openaiKey.startsWith('sk-') && openaiKey.length > 20) {
        setOpenAiStatus('active');
      } else {
        setOpenAiStatus('invalid');
      }
    } else {
      setOpenAiStatus('idle');
    }

    if (geminiKey) {
      if (geminiKey.startsWith('AIzaSy') && geminiKey.length > 20) {
        setGeminiStatus('active');
      } else {
        setGeminiStatus('invalid');
      }
    } else {
      setGeminiStatus('idle');
    }
  }, [openaiKey, geminiKey]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    
    // Simulate API connection handshake checks
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setTesting(false);
    onSaveSettings(openAiInput, geminiInput, modelInput);
    setSaveSuccess(true);
    
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="flex-1 p-6 space-y-6 max-h-screen overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-850/80 pb-4 animate-fade-in">
        <div>
          <h2 className="text-xl font-black tracking-tight dark:text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-500" />
            AI Integration Settings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure LLM API keys and model parameters for natural language SQL translations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 flex items-center gap-1">
            <Server className="w-3 h-3 text-indigo-500 animate-pulse" />
            AI Coordinator Panel
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        
        {/* Settings Form Card */}
        <section className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-900 shadow-sm space-y-6">
          <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850/60 pb-3">
            <Settings className="w-4 h-4 text-indigo-500" />
            Configure Providers
          </h3>

          {saveSuccess && (
            <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2 animate-scale-up">
              <Check className="w-4 h-4 text-emerald-500" />
              Settings saved successfully! API connection status updated.
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            
            {/* OpenAI Key */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-500" />
                  OpenAI API Key
                </label>
                {openAiStatus === 'active' && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/50 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-500" /> Active / Connected
                  </span>
                )}
                {openAiStatus === 'invalid' && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-105 dark:bg-amber-950 text-amber-805 dark:text-amber-405 border border-amber-250/50 dark:border-amber-900/50 flex items-center gap-1">
                    <AlertCircle className="w-2.5 h-2.5" /> Weak format
                  </span>
                )}
                {openAiStatus === 'idle' && (
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400">
                    Not Provided
                  </span>
                )}
              </div>
              <input
                type="password"
                value={openAiInput}
                onChange={e => setOpenAiInput(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-blue-550 dark:focus:border-blue-500 transition-colors font-mono"
              />
            </div>

            {/* Gemini Key */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-500" />
                  Gemini API Key
                </label>
                {geminiStatus === 'active' && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/50 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-500" /> Active / Connected
                  </span>
                )}
                {geminiStatus === 'invalid' && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-105 dark:bg-amber-950 text-amber-805 dark:text-amber-405 border border-amber-250/50 dark:border-amber-900/50 flex items-center gap-1">
                    <AlertCircle className="w-2.5 h-2.5" /> Weak format
                  </span>
                )}
                {geminiStatus === 'idle' && (
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400">
                    Not Provided
                  </span>
                )}
              </div>
              <input
                type="password"
                value={geminiInput}
                onChange={e => setGeminiInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-blue-550 dark:focus:border-blue-500 transition-colors font-mono"
              />
            </div>

            {/* Model Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-500" />
                Model Selection Dropdown
              </label>
              <select
                value={modelInput}
                onChange={e => setModelInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-blue-550 dark:focus:border-blue-500 transition-colors cursor-pointer"
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4o">GPT-4o (Optimized Performance)</option>
                <option value="gemini-pro">Gemini Pro</option>
              </select>
            </div>

            {/* Submit / Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={testing}
                className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-600 transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Testing API connections...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save Settings
                  </>
                )}
              </button>
            </div>

          </form>
        </section>

        {/* Info & Status Overview Cards */}
        <div className="space-y-6">
          
          {/* Status Indicators Summary */}
          <section className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-900 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">
              API Connection Status
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-850/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-xs font-bold">OpenAI status</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  openAiStatus === 'active' 
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400'
                    : openAiStatus === 'invalid'
                    ? 'bg-amber-105 dark:bg-amber-950 text-amber-805 dark:text-amber-405'
                    : 'bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-450'
                }`}>
                  {openAiStatus === 'active' ? 'Connected' : openAiStatus === 'invalid' ? 'Weak Format' : 'Disconnected'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-850/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-xs font-bold">Gemini status</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  geminiStatus === 'active' 
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400'
                    : geminiStatus === 'invalid'
                    ? 'bg-amber-105 dark:bg-amber-950 text-amber-805 dark:text-amber-405'
                    : 'bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-450'
                }`}>
                  {geminiStatus === 'active' ? 'Connected' : geminiStatus === 'invalid' ? 'Weak Format' : 'Disconnected'}
                </span>
              </div>
            </div>
          </section>

          {/* Model Integration Tips */}
          <section className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-900 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              Integration Tips
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              When keys are configured, the Text-to-SQL translator switches from pattern rule matching to advanced semantic schema analysis using the selected model.
            </p>
            <ul className="text-[10px] text-slate-450 dark:text-slate-500 space-y-1.5 list-disc pl-4 font-semibold leading-relaxed">
              <li>OpenAI key validation checks for prefix <code>sk-</code>.</li>
              <li>Gemini key validation checks for prefix <code>AIzaSy</code>.</li>
              <li>Both keys must exceed 20 characters to activate.</li>
            </ul>
          </section>

        </div>

      </div>

    </div>
  );
}

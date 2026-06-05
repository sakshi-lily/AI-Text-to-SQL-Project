import { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Mic, MicOff, RefreshCw, X, Play, Copy, CornerDownLeft, Languages } from 'lucide-react';
import { generateSQL } from '../utils/apiService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sql?: string;
  explanation?: string;
}

interface AssistantPanelProps {
  apiKey: string;
  onClose: () => void;
  onLoadSql: (sql: string, prompt: string) => void;
}

export default function AssistantPanel({ apiKey, onClose, onLoadSql }: AssistantPanelProps) {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your AI Database Assistant. You can speak to me in English or Hindi. Ask me a database query or tell me to refine our search!'
    }
  ]);
  const [loading, setLoading] = useState(false);

  // Web Speech API Voice States
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll chat area
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    // Initialize Web Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US'; // Supports 'hi-IN' dynamically if we want, or generic auto

      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setChatInput(prev => (prev ? prev + ' ' + transcript : transcript));
        setIsListening(false);
      };

      rec.onerror = (e: any) => {
        console.error('Speech recognition error:', e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in this browser. Try Chrome.');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      setIsListening(true);
      recognition.start();
    }
  };

  const handleSend = async (textToSend?: string) => {
    const promptText = textToSend || chatInput;
    if (!promptText.trim()) return;

    // Append user message
    const userMsg: Message = { role: 'user', content: promptText };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setLoading(true);

    // Compile dialogue history for context
    const contextList = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    try {
      const result = await generateSQL(promptText, apiKey, contextList);
      
      const assistantMsg: Message = {
        role: 'assistant',
        content: result.explanation?.description || 'Here is the SQL query:',
        sql: result.sql,
        explanation: result.explanation?.expected_output
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Unable to translate. Error detail: ${e.message || e}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    { label: 'CS Students with GPA > 3.8', text: 'Show students in Computer Science with a CGPA above 3.8' },
    { label: 'Highest Budget Division', text: 'Find the department with the highest budget allocation' },
    { label: 'Total Enrollment Counts', text: 'Count the total number of students in Biology' }
  ];

  return (
    <div className="w-80 border-l border-slate-200 dark:border-slate-850 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-col h-screen relative z-30 shadow-2xl animate-slide-left">
      
      {/* Header bar */}
      <div className="px-4 py-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-850 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse-glow" />
          <span className="font-extrabold text-xs tracking-wider uppercase dark:text-white">AI assistant</span>
        </div>
        
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-170px)]">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}>
            
            {/* Bubble */}
            <div className={`max-w-[90%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-500/10'
                : 'bg-slate-100 dark:bg-slate-850 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200/50 dark:border-slate-800/60'
            }`}>
              {msg.content}
            </div>

            {/* Generated SQL attachment inside Chat */}
            {msg.sql && (
              <div className="w-full mt-2 rounded-xl bg-slate-950 border border-slate-900 p-3 overflow-hidden text-[10px] space-y-2 animate-fade-in">
                <pre className="font-mono text-emerald-400 overflow-x-auto select-all max-h-24">
                  {msg.sql}
                </pre>
                
                <div className="flex items-center justify-between border-t border-slate-850/80 pt-2 mt-1">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Actionable Code</span>
                  <button
                    onClick={() => onLoadSql(msg.sql!, msg.content)}
                    className="px-2.5 py-1 bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg text-[8px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <CornerDownLeft className="w-2.5 h-2.5" />
                    Load SQL
                  </button>
                </div>
              </div>
            )}

          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100/50 dark:bg-slate-850/30 text-slate-400 dark:text-slate-500 animate-pulse text-[10px] font-bold">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
            <span>AI model is compiling SQL...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggesters and input panel */}
      <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-850 space-y-3 shrink-0">
        
        {/* Dynamic suggestion buttons */}
        <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s.text)}
              className="shrink-0 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-400/40 dark:border-slate-850 dark:hover:border-blue-800/80 bg-white hover:bg-blue-50/10 dark:bg-slate-900/10 dark:hover:bg-slate-800/20 text-[9px] font-semibold text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-all cursor-pointer"
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="flex items-center gap-2 relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5">
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            className="flex-1 px-2.5 py-1.5 text-xs focus:outline-none dark:text-white"
            placeholder={isListening ? 'Listening...' : 'Type or talk to AI...'}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSend();
            }}
          />

          {/* Web Speech Dictation trigger */}
          <button
            onClick={toggleListening}
            className={`p-2 rounded-lg transition-colors cursor-pointer relative ${
              isListening 
                ? 'bg-rose-500/15 text-rose-500 hover:bg-rose-500/25'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white'
            }`}
            title="Voice Speech to Text Dictation"
          >
            {isListening ? (
              <>
                <MicOff className="w-3.5 h-3.5 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              </>
            ) : (
              <Mic className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Send query trigger */}
          <button
            onClick={() => handleSend()}
            disabled={!chatInput.trim()}
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-30 transition-all cursor-pointer shadow-md shadow-blue-500/10"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
}

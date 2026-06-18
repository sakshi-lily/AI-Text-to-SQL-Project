import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import ConnectionPage from './components/ConnectionPage';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Workspace from './components/Workspace';
import SchemaExplorer from './components/SchemaExplorer';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AiSettings from './components/AiSettings';
import { getConnectionStatus, disconnectDatabase, getQueryHistory } from './utils/api';
import type { ConnectionStatus } from './utils/api';

type PageState = 'landing' | 'connect' | 'dashboard';

export default function App() {
  // Navigation State
  const [page, setPage] = useState<PageState>('landing');
  const [dashboardTab, setDashboardTab] = useState<'workspace' | 'explorer' | 'analytics' | 'settings'>('workspace');

  // Theme State
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme-preference');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Global App States
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('gemini-api-key') || '';
  });

  // AI Keys & Model integration states
  const [openaiApiKey, setOpenaiApiKey] = useState(() => {
    return localStorage.getItem('openai-api-key') || '';
  });

  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem('gemini-api-key') || '';
  });

  const [selectedModel, setSelectedModel] = useState(() => {
    return localStorage.getItem('selected-model') || 'gpt-4o';
  });

  const handleSaveSettings = (openaiKey: string, geminiKey: string, model: string) => {
    setOpenaiApiKey(openaiKey);
    localStorage.setItem('openai-api-key', openaiKey);
    
    setGeminiApiKey(geminiKey);
    localStorage.setItem('gemini-api-key', geminiKey);
    setApiKey(geminiKey); // Sync to older state
    
    setSelectedModel(model);
    localStorage.setItem('selected-model', model);
  };
  
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    host: '',
    port: '',
    database: '',
    username: ''
  });

  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('query-history-list');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedQuery, setSelectedQuery] = useState<string | null>(null);

  // Sync theme to root HTML element
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme-preference', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme-preference', 'light');
    }
  }, [darkMode]);

  // Sync API Key to LocalStorage
  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini-api-key', key);
  };

  // Check connection status on load
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const status = await getConnectionStatus();
        setConnectionStatus(status);
        if (status.connected) {
          setPage('dashboard');
        }
      } catch (e) {}
    };
    checkConnection();
  }, []);

  // Load query history on dashboard mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const list = await getQueryHistory();
        setHistory(list);
        localStorage.setItem('query-history-list', JSON.stringify(list));
      } catch (e) {}
    };
    if (page === 'dashboard') {
      fetchHistory();
    }
  }, [page]);

  const handleConnectSuccess = (dbName: string) => {
    setConnectionStatus({
      connected: true,
      host: 'local-sqlite-client',
      port: '3306',
      database: dbName,
      username: 'sqlite_user'
    });
    setPage('dashboard');
  };

  const handleDisconnect = async () => {
    try {
      await disconnectDatabase();
      setConnectionStatus({
        connected: false,
        host: '',
        port: '',
        database: '',
        username: ''
      });
      setPage('connect');
    } catch (e) {}
  };

  // History Management
  const handleNewQuery = (prompt: string) => {
    // Prevent duplicates in history
    setHistory(prev => {
      const filtered = prev.filter(p => p !== prompt);
      const updated = [prompt, ...filtered].slice(0, 20); // Keep max 20 entries
      localStorage.setItem('query-history-list', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('query-history-list');
  };

  const handleSelectHistory = (prompt: string) => {
    setSelectedQuery(prompt);
  };

  // Render navigation views
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {page === 'landing' && (
        <LandingPage 
          onGetStarted={() => setPage('connect')} 
          onEnterDemoMode={() => handleConnectSuccess('summership_demo')}
        />
      )}

      {page === 'connect' && (
        <ConnectionPage
          onBack={() => setPage('landing')}
          onConnectSuccess={handleConnectSuccess}
        />
      )}

      {page === 'dashboard' && (
        <div className="flex min-h-screen">
          <Sidebar
            connectionStatus={connectionStatus}
            history={history}
            onSelectHistory={handleSelectHistory}
            onClearHistory={handleClearHistory}
            onDisconnect={handleDisconnect}
          />
          <div className="flex-1 flex flex-col min-h-screen">
            <Navbar
              darkMode={darkMode}
              onToggleDarkMode={() => setDarkMode(!darkMode)}
              connectionStatus={connectionStatus}
              apiKey={apiKey}
              onApiKeyChange={handleApiKeyChange}
              activeTab={dashboardTab}
              onActiveTabChange={setDashboardTab}
            />
            {dashboardTab === 'workspace' ? (
              <Workspace
                apiKey={apiKey}
                connectionStatus={connectionStatus}
                onNewQuery={handleNewQuery}
                selectedQueryFromHistory={selectedQuery}
                onClearSelectedQuery={() => setSelectedQuery(null)}
              />
            ) : dashboardTab === 'explorer' ? (
              <SchemaExplorer />
            ) : dashboardTab === 'analytics' ? (
              <AnalyticsDashboard />
            ) : (
              <AiSettings
                openaiKey={openaiApiKey}
                geminiKey={geminiApiKey}
                selectedModel={selectedModel}
                onSaveSettings={handleSaveSettings}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

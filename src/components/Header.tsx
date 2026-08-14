import React from 'react';
import { Home, Calendar, History, Settings, Plus, Lock } from 'lucide-react';

interface HeaderProps {
  activeTab: 'home' | 'calendar' | 'history' | 'settings';
  setActiveTab: (tab: 'home' | 'calendar' | 'history' | 'settings') => void;
  onOpenLogModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenLogModal,
}) => {
  return (
    <header className="bg-[#f8f7f4] border-b border-[#1a1a1a]/10 sticky top-0 z-30 backdrop-blur-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-[#1a1a1a]">
              AuraCycle
            </h1>
            <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 bg-[#1a1a1a] text-[#f8f7f4] rounded-xs font-medium inline-flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" /> Private &amp; Local
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setActiveTab('home')}
              className={`font-mono text-xs uppercase tracking-widest py-1 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'home'
                  ? 'text-[#1a1a1a] font-semibold border-b-2 border-[#1a1a1a]'
                  : 'text-[#1a1a1a]/60 hover:text-[#1a1a1a]'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              Home
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`font-mono text-xs uppercase tracking-widest py-1 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'calendar'
                  ? 'text-[#1a1a1a] font-semibold border-b-2 border-[#1a1a1a]'
                  : 'text-[#1a1a1a]/60 hover:text-[#1a1a1a]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Calendar
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`font-mono text-xs uppercase tracking-widest py-1 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'text-[#1a1a1a] font-semibold border-b-2 border-[#1a1a1a]'
                  : 'text-[#1a1a1a]/60 hover:text-[#1a1a1a]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              History
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`font-mono text-xs uppercase tracking-widest py-1 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'settings'
                  ? 'text-[#1a1a1a] font-semibold border-b-2 border-[#1a1a1a]'
                  : 'text-[#1a1a1a]/60 hover:text-[#1a1a1a]'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </button>

            <button
              onClick={onOpenLogModal}
              className="bg-[#c47c7c] text-[#f8f7f4] px-4 py-2 font-mono text-xs uppercase tracking-wider font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer ml-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Today
            </button>
          </nav>

          {/* Mobile Log Button */}
          <div className="md:hidden">
            <button
              onClick={onOpenLogModal}
              className="bg-[#c47c7c] text-[#f8f7f4] px-3 py-1.5 font-mono text-xs uppercase tracking-wider font-medium flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Log
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden border-t border-[#1a1a1a]/10 py-2 justify-around">
          <button
            onClick={() => setActiveTab('home')}
            className={`font-mono text-[11px] uppercase tracking-wider py-1 flex items-center gap-1 cursor-pointer ${
              activeTab === 'home' ? 'text-[#1a1a1a] font-bold border-b border-[#1a1a1a]' : 'text-[#1a1a1a]/60'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            Home
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`font-mono text-[11px] uppercase tracking-wider py-1 flex items-center gap-1 cursor-pointer ${
              activeTab === 'calendar' ? 'text-[#1a1a1a] font-bold border-b border-[#1a1a1a]' : 'text-[#1a1a1a]/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`font-mono text-[11px] uppercase tracking-wider py-1 flex items-center gap-1 cursor-pointer ${
              activeTab === 'history' ? 'text-[#1a1a1a] font-bold border-b border-[#1a1a1a]' : 'text-[#1a1a1a]/60'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            History
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`font-mono text-[11px] uppercase tracking-wider py-1 flex items-center gap-1 cursor-pointer ${
              activeTab === 'settings' ? 'text-[#1a1a1a] font-bold border-b border-[#1a1a1a]' : 'text-[#1a1a1a]/60'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>
        </div>
      </div>
    </header>
  );
};

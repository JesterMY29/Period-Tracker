import React from 'react';
import { Home, Calendar, History, Settings, Plus, Lock } from 'lucide-react';
import { AppTab } from '../lib/navigation';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onOpenLogModal: () => void;
}

const navItems = [
  { id: 'home' as AppTab, label: 'Home', Icon: Home },
  { id: 'calendar' as AppTab, label: 'Calendar', Icon: Calendar },
  { id: 'history' as AppTab, label: 'History', Icon: History },
  { id: 'settings' as AppTab, label: 'Settings', Icon: Settings },
];

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenLogModal }) => {
  return (
    <header className="bg-[#f8f7f4]/95 border-b border-[#1a1a1a]/10 sticky top-0 z-30 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            aria-label="Go to AuraCycle home"
            className="flex items-center gap-3 text-left rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c47c7c]"
          >
            <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-[#1a1a1a]">
              AuraCycle
            </span>
            <span className="hidden sm:inline-flex font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 bg-[#1a1a1a] text-[#f8f7f4] rounded-xs font-medium items-center gap-1">
              <Lock className="w-2.5 h-2.5" aria-hidden="true" />
              Private &amp; Local
            </span>
          </button>

          <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-5">
            {navItems.map(({ id, label, Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`font-mono text-xs uppercase tracking-widest py-2 transition-colors rounded-sm flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#c47c7c] ${
                    isActive
                      ? 'text-[#1a1a1a] font-semibold border-b-2 border-[#1a1a1a]'
                      : 'text-[#1a1a1a]/60 hover:text-[#1a1a1a]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  {label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={onOpenLogModal}
              className="btn-primary ml-2 inline-flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#1a1a1a]"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              Log today
            </button>
          </nav>

          <button
            type="button"
            onClick={onOpenLogModal}
            className="md:hidden btn-primary !px-3 !py-2 inline-flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#1a1a1a]"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            Log
          </button>
        </div>

        <nav aria-label="Mobile navigation" className="grid grid-cols-4 md:hidden border-t border-[#1a1a1a]/10 py-2 -mx-1">
          {navItems.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                aria-current={isActive ? 'page' : undefined}
                className={`font-mono text-[10px] uppercase tracking-wider min-h-10 py-1 flex flex-col items-center justify-center gap-0.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#c47c7c] ${
                  isActive ? 'text-[#1a1a1a] font-bold' : 'text-[#1a1a1a]/55'
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

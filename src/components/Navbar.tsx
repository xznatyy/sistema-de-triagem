import React, { useState, useEffect } from 'react';
import { Activity, PlusCircle, History, Code2, Bell, Volume2, VolumeX, ShieldAlert, HeartPulse } from 'lucide-react';
import { soundManager } from '../lib/soundEffect';

interface NavbarProps {
  activeTab: 'dashboard' | 'triage' | 'history' | 'api';
  onTabChange: (tab: 'dashboard' | 'triage' | 'history' | 'api') => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  emergencyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  unreadNotificationsCount,
  onOpenNotifications,
  emergencyCount
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Hospital Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-orange-500 to-amber-500 flex items-center justify-center shadow-lg ring-2 ring-white/10">
              <HeartPulse className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base tracking-tight text-white">Triagem Manchester</h1>
                <span className="bg-slate-800 text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-700">
                  v2.5 Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Classificação de Risco & Atendimento</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Painel da Fila</span>
              {emergencyCount > 0 && (
                <span className="ml-1 bg-red-600 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full animate-bounce">
                  {emergencyCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('triage')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'triage'
                  ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-blue-400" />
              <span>Nova Triagem</span>
            </button>

            <button
              onClick={() => onTabChange('history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <History className="w-4 h-4 text-purple-400" />
              <span>Histórico de Chamados</span>
            </button>

            <button
              onClick={() => onTabChange('api')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'api'
                  ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Code2 className="w-4 h-4 text-amber-400" />
              <span>Integração API</span>
            </button>
          </nav>

          {/* Right Controls: Clock, Sound, Notification Bell */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700/60 font-mono text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>{timeString}</span>
            </div>

            <button
              onClick={handleToggleSound}
              className={`p-2 rounded-lg transition-colors border ${
                isMuted
                  ? 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                  : 'bg-emerald-950/60 border-emerald-800 text-emerald-400 hover:bg-emerald-900/60'
              }`}
              title={isMuted ? 'Som desativado. Clique para ativar som de alertas.' : 'Som de alertas ativado.'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white transition-colors"
              title="Notificações da equipe"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-slate-900">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex flex-col items-center gap-1 px-2 py-1 ${activeTab === 'dashboard' ? 'text-white font-bold' : 'text-slate-400'}`}
          >
            <Activity className="w-4 h-4" />
            <span>Fila</span>
          </button>
          <button
            onClick={() => onTabChange('triage')}
            className={`flex flex-col items-center gap-1 px-2 py-1 ${activeTab === 'triage' ? 'text-white font-bold' : 'text-slate-400'}`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Triagem</span>
          </button>
          <button
            onClick={() => onTabChange('history')}
            className={`flex flex-col items-center gap-1 px-2 py-1 ${activeTab === 'history' ? 'text-white font-bold' : 'text-slate-400'}`}
          >
            <History className="w-4 h-4" />
            <span>Histórico</span>
          </button>
          <button
            onClick={() => onTabChange('api')}
            className={`flex flex-col items-center gap-1 px-2 py-1 ${activeTab === 'api' ? 'text-white font-bold' : 'text-slate-400'}`}
          >
            <Code2 className="w-4 h-4" />
            <span>API</span>
          </button>
        </div>
      </div>
    </header>
  );
};

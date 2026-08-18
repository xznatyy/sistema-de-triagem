import React, { useState, useEffect } from 'react';
import { TriageTicket, ManchesterColor, TicketStatus, DashboardStats, MANCHESTER_RULES } from '../types';
import { ManchesterBadge } from './ManchesterBadge';
import { soundManager } from '../lib/soundEffect';
import {
  Users, Clock, AlertTriangle, ShieldAlert, CheckCircle2,
  Search, Filter, Megaphone, UserCheck, Eye, RefreshCw,
  Stethoscope, DoorOpen, Calendar, ArrowUpRight, Flame
} from 'lucide-react';

interface DashboardViewProps {
  tickets: TriageTicket[];
  stats: DashboardStats;
  onRefresh: () => void;
  onStatusChange: (id: string, status: TicketStatus, room?: string, doctor?: string, notes?: string) => void;
  onViewTicket: (ticket: TriageTicket) => void;
  onRetriageTicket: (ticket: TriageTicket) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tickets,
  stats,
  onRefresh,
  onStatusChange,
  onViewTicket,
  onRetriageTicket
}) => {
  const [search, setSearch] = useState('');
  const [selectedColor, setSelectedColor] = useState<ManchesterColor | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | 'all'>('aguardando');
  const [callModalTicket, setCallModalTicket] = useState<TriageTicket | null>(null);
  const [callRoom, setCallRoom] = useState('Consultório 01');
  const [callDoctor, setCallDoctor] = useState('Dr. Plantonista');

  // Timer ticker state to update countdowns every second
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
    if (selectedColor !== 'all' && t.color !== selectedColor) return false;
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      return (
        t.patient.fullName.toLowerCase().includes(q) ||
        t.patient.cpf.includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.questionnaire.chiefComplaint.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Emergency Red / Orange waiting count
  const redOrangeWaiting = tickets.filter(
    t => t.status === 'aguardando' && (t.color === 'red' || t.color === 'orange')
  );

  const handleCallPatient = (ticket: TriageTicket) => {
    setCallModalTicket(ticket);
  };

  const confirmCallPatient = () => {
    if (!callModalTicket) return;
    soundManager.playPatientCallChime();
    onStatusChange(callModalTicket.id, 'em_atendimento', callRoom, callDoctor, `Paciente chamado para ${callRoom}`);
    setCallModalTicket(null);
  };

  // Helper to calculate elapsed time and remaining time for Manchester limit
  const getWaitInfo = (ticket: TriageTicket) => {
    const createdMs = new Date(ticket.createdAt).getTime();
    const nowMs = Date.now();
    const elapsedSecs = Math.max(0, Math.floor((nowMs - createdMs) / 1000));
    const elapsedMins = Math.floor(elapsedSecs / 60);

    const maxMins = ticket.maxWaitMinutes;
    if (maxMins === 0) {
      return {
        elapsedMins,
        formattedElapsed: `${elapsedMins}m`,
        isBreached: true,
        remainingText: 'Atendimento Imediato!'
      };
    }

    const maxSecs = maxMins * 60;
    const remainingSecs = maxSecs - elapsedSecs;
    const isBreached = remainingSecs < 0;

    const absSecs = Math.abs(remainingSecs);
    const remMins = Math.floor(absSecs / 60);
    const remSecsLeft = absSecs % 60;

    const formattedTime = `${remMins}m ${remSecsLeft.toString().padStart(2, '0')}s`;

    return {
      elapsedMins,
      formattedElapsed: `${elapsedMins}m`,
      isBreached,
      remainingText: isBreached ? `Excedido em ${formattedTime}` : `Resta ${formattedTime}`
    };
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Emergency Banner Alert if Red or Orange patients waiting */}
      {redOrangeWaiting.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-600 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-black/20 rounded-xl">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight flex items-center gap-2">
                <span>ATENÇÃO: ALERTA CRÍTICO DE TRIAGEM</span>
                <span className="bg-white text-red-700 text-xs font-black px-2 py-0.5 rounded-full uppercase">
                  {redOrangeWaiting.length} na fila
                </span>
              </h3>
              <p className="text-sm opacity-95">
                Existem pacientes classificados com emergência (Vermelho/Laranja) aguardando chamada imediata!
              </p>
            </div>
          </div>
          <button
            onClick={() => soundManager.playEmergencyAlarm()}
            className="hidden sm:flex items-center gap-2 bg-white text-red-700 hover:bg-slate-100 font-bold px-4 py-2 rounded-xl text-sm shadow-md transition-transform hover:scale-105"
          >
            <Flame className="w-4 h-4 text-red-600" />
            <span>Testar Alerta Sonoro</span>
          </button>
        </div>
      )}

      {/* 2. Top Metric Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total de Triagens Hoje</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalToday}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>{stats.completedCount} atendidos | {stats.inProgressCount} em consultório</span>
          </p>
        </div>

        {/* Waiting Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aguardando Chamada</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stats.waitingCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          {/* Breakdown mini-bar */}
          <div className="flex items-center gap-1 mt-3.5">
            <span className="w-3 h-3 rounded-full bg-red-600" title={`Vermelho: ${stats.colorBreakdown.red}`}></span>
            <span className="text-xs font-bold text-slate-700 mr-2">{stats.colorBreakdown.red}</span>

            <span className="w-3 h-3 rounded-full bg-orange-500" title={`Laranja: ${stats.colorBreakdown.orange}`}></span>
            <span className="text-xs font-bold text-slate-700 mr-2">{stats.colorBreakdown.orange}</span>

            <span className="w-3 h-3 rounded-full bg-amber-500" title={`Amarelo: ${stats.colorBreakdown.yellow}`}></span>
            <span className="text-xs font-bold text-slate-700 mr-2">{stats.colorBreakdown.yellow}</span>

            <span className="w-3 h-3 rounded-full bg-emerald-600" title={`Verde: ${stats.colorBreakdown.green}`}></span>
            <span className="text-xs font-bold text-slate-700 mr-2">{stats.colorBreakdown.green}</span>

            <span className="w-3 h-3 rounded-full bg-blue-600" title={`Azul: ${stats.colorBreakdown.blue}`}></span>
            <span className="text-xs font-bold text-slate-700">{stats.colorBreakdown.blue}</span>
          </div>
        </div>

        {/* Avg Wait Time */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tempo Médio de Espera</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stats.averageWaitMinutes} <span className="text-base font-normal text-slate-500">min</span></h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 flex items-center gap-1 font-medium">
            <span className="text-emerald-600 font-bold">Meta Manchester:</span> Dentro das faixas estipuladas
          </p>
        </div>

        {/* SLA Breaches */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tempo Limite Excedido</p>
              <h3 className={`text-3xl font-extrabold mt-1 ${stats.slaBreachCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                {stats.slaBreachCount}
              </h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.slaBreachCount > 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 font-medium">
            {stats.slaBreachCount > 0 ? '⚠️ Atenção: Reavaliar fila de prioridade' : '✓ Nenhuma violação grave de SLA registrada'}
          </p>
        </div>
      </div>

      {/* 3. Controls & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por Nome do Paciente, CPF ou Nº da Ficha..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Status:</span>
            <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-medium">
              {(['aguardando', 'em_atendimento', 'concluido', 'all'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                    selectedStatus === st
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st === 'aguardando' ? 'Aguardando' : st === 'em_atendimento' ? 'Em Atendimento' : st === 'concluido' ? 'Concluídos' : 'Todos'}
                </button>
              ))}
            </div>

            <button
              onClick={onRefresh}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
              title="Atualizar Fila"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Manchester Color Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
          <span className="font-bold text-slate-500 mr-1 uppercase text-[11px]">Cor Manchester:</span>
          <button
            onClick={() => setSelectedColor('all')}
            className={`px-3 py-1 rounded-full font-semibold border transition-all ${
              selectedColor === 'all'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Todas ({tickets.length})
          </button>

          {(['red', 'orange', 'yellow', 'green', 'blue'] as ManchesterColor[]).map(c => {
            const cfg = MANCHESTER_RULES[c];
            const count = tickets.filter(t => t.color === c).length;
            const isSelected = selectedColor === c;
            return (
              <button
                key={c}
                onClick={() => setSelectedColor(c)}
                className={`px-3 py-1 rounded-full font-semibold border transition-all flex items-center gap-1.5 ${
                  isSelected ? 'ring-2 ring-slate-900 shadow-xs' : 'hover:opacity-90'
                }`}
                style={{
                  backgroundColor: cfg.hexColor,
                  color: '#ffffff',
                  borderColor: cfg.hexColor
                }}
              >
                <span>{cfg.label}</span>
                <span className="bg-black/20 text-white px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Real-time Queue Board Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
          <span>EXIBINDO {filteredTickets.length} CHAMADOS NA FILA</span>
          <span>ORDENADOS POR PRIORIDADE DO PROTOCOLO MANCHESTER</span>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-800 text-base">Nenhum chamado encontrado</h4>
            <p className="text-xs text-slate-500 mt-1">
              Ajuste os filtros de busca ou cadastre uma nova triagem no formulário.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredTickets.map(ticket => {
              const wait = getWaitInfo(ticket);
              const colorCfg = MANCHESTER_RULES[ticket.color];

              return (
                <div
                  key={ticket.id}
                  className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs transition-all hover:shadow-md relative overflow-hidden ${
                    ticket.color === 'red'
                      ? 'border-red-300 ring-1 ring-red-200'
                      : ticket.color === 'orange'
                      ? 'border-orange-300'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Color Accent Indicator Strip on left */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-2"
                    style={{ backgroundColor: colorCfg.hexColor }}
                  ></div>

                  <div className="pl-3 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Main Patient Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <ManchesterBadge color={ticket.color} size="md" pulse={ticket.status === 'aguardando'} />
                        <span className="font-mono font-bold text-slate-900 text-sm bg-slate-100 px-2 py-0.5 rounded-md">
                          #{ticket.id}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          Triado às {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                          ticket.status === 'aguardando'
                            ? 'bg-amber-100 text-amber-800'
                            : ticket.status === 'em_atendimento'
                            ? 'bg-blue-100 text-blue-800'
                            : ticket.status === 'concluido'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {ticket.status === 'aguardando' ? 'Aguardando' : ticket.status === 'em_atendimento' ? 'Em Atendimento' : ticket.status === 'concluido' ? 'Concluído' : 'Cancelado'}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-900 leading-snug flex items-center gap-2">
                          <span>{ticket.patient.fullName}</span>
                          <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {ticket.patient.age} anos ({ticket.patient.gender})
                          </span>
                        </h3>
                        <p className="text-xs text-slate-600 mt-1 font-medium line-clamp-2">
                          <strong className="text-slate-800">Queixa:</strong> {ticket.questionnaire.chiefComplaint}
                        </p>
                      </div>

                      {/* Vital Signs Bar */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1 font-mono">
                        <span className="bg-slate-100 px-2 py-1 rounded-md">
                          PA: <strong>{ticket.vitalSigns.systolicBP}/{ticket.vitalSigns.diastolicBP}</strong>
                        </span>
                        <span className="bg-slate-100 px-2 py-1 rounded-md">
                          FC: <strong>{ticket.vitalSigns.heartRate} bpm</strong>
                        </span>
                        <span className={`px-2 py-1 rounded-md font-bold ${ticket.vitalSigns.oxygenSaturation < 94 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                          SpO2: {ticket.vitalSigns.oxygenSaturation}%
                        </span>
                        <span className="bg-slate-100 px-2 py-1 rounded-md">
                          Temp: <strong>{ticket.vitalSigns.temperature}°C</strong>
                        </span>
                        <span className={`px-2 py-1 rounded-md font-bold ${ticket.vitalSigns.painScale >= 7 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-700'}`}>
                          Dor: {ticket.vitalSigns.painScale}/10
                        </span>
                      </div>
                    </div>

                    {/* Wait Timer & Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 min-w-[200px]">
                      {/* Timer Display */}
                      {ticket.status === 'aguardando' && (
                        <div className={`text-right p-2.5 rounded-xl border w-full sm:w-auto text-center sm:text-right ${
                          wait.isBreached
                            ? 'bg-red-50 border-red-200 text-red-700 animate-pulse'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}>
                          <div className="text-[11px] font-semibold uppercase tracking-wider opacity-80 flex items-center justify-center sm:justify-end gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Tempo de Espera</span>
                          </div>
                          <div className="text-lg font-extrabold font-mono mt-0.5">
                            {wait.formattedElapsed}
                          </div>
                          <div className="text-[11px] font-medium mt-0.5">
                            {wait.remainingText}
                          </div>
                        </div>
                      )}

                      {ticket.status === 'em_atendimento' && (
                        <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-xl text-blue-900 text-xs font-medium text-right w-full sm:w-auto">
                          <p className="font-bold flex items-center justify-end gap-1">
                            <DoorOpen className="w-3.5 h-3.5 text-blue-600" />
                            <span>{ticket.room || 'Consultório'}</span>
                          </p>
                          <p className="text-[11px] text-blue-700">{ticket.attendingDoctor || 'Em Atendimento Médico'}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => onViewTicket(ticket)}
                          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                          title="Ver Ficha Completa"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {ticket.status === 'aguardando' && (
                          <button
                            onClick={() => handleCallPatient(ticket)}
                            className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                          >
                            <Megaphone className="w-3.5 h-3.5 text-amber-400" />
                            <span>Chamar</span>
                          </button>
                        )}

                        {ticket.status === 'em_atendimento' && (
                          <button
                            onClick={() => onStatusChange(ticket.id, 'concluido', undefined, undefined, 'Atendimento concluído pelo painel')}
                            className="flex-1 sm:flex-initial px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Concluir</span>
                          </button>
                        )}

                        <button
                          onClick={() => onRetriageTicket(ticket)}
                          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                          title="Re-triar Paciente"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Call Patient Modal */}
      {callModalTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-slate-900">
              <div className="p-3 bg-slate-100 rounded-xl text-slate-900">
                <Megaphone className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Chamar Paciente para Atendimento</h3>
                <p className="text-xs text-slate-500">Aciona o som de aviso e atualiza o painel da recepção</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p><strong>Paciente:</strong> {callModalTicket.patient.fullName}</p>
              <p><strong>Ficha:</strong> #{callModalTicket.id} | <strong>Idade:</strong> {callModalTicket.patient.age} anos</p>
              <div className="pt-1 flex items-center gap-2">
                <span>Classificação:</span>
                <ManchesterBadge color={callModalTicket.color} size="sm" />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Local / Consultório de Atendimento:</label>
                <select
                  value={callRoom}
                  onChange={e => setCallRoom(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Consultório 01">Consultório 01 (Clínica Médica)</option>
                  <option value="Consultório 02">Consultório 02 (Clínica Médica)</option>
                  <option value="Consultório 03">Consultório 03 (Pediatria)</option>
                  <option value="Sala Vermelha - Emergência">Sala Vermelha - Emergência</option>
                  <option value="Sala de Sutura e Procedimentos">Sala de Sutura e Procedimentos</option>
                  <option value="Sala de Inalação / Medicação">Sala de Inalação / Medicação</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Médico Responsável:</label>
                <input
                  type="text"
                  value={callDoctor}
                  onChange={e => setCallDoctor(e.target.value)}
                  placeholder="Nome do Médico..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setCallModalTicket(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={confirmCallPatient}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
              >
                <Megaphone className="w-4 h-4 text-amber-400" />
                <span>Emitir Chamada Sonora</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { TriageTicket, ManchesterColor, TicketStatus, MANCHESTER_RULES } from '../types';
import { ManchesterBadge } from './ManchesterBadge';
import {
  Search, Download, Printer, Eye, Calendar, Clock,
  UserCheck, ShieldAlert, FileText, CheckCircle2, History, X
} from 'lucide-react';

interface HistoryViewProps {
  tickets: TriageTicket[];
  onSelectTicket: (ticket: TriageTicket) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ tickets, onSelectTicket }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [colorFilter, setColorFilter] = useState<ManchesterColor | 'all'>('all');
  const [activeTicketModal, setActiveTicketModal] = useState<TriageTicket | null>(null);

  const filteredTickets = tickets.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (colorFilter !== 'all' && t.color !== colorFilter) return false;
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      return (
        t.patient.fullName.toLowerCase().includes(q) ||
        t.patient.cpf.includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.triageNurse.toLowerCase().includes(q) ||
        (t.attendingDoctor && t.attendingDoctor.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ['ID', 'Data/Hora', 'Paciente', 'CPF', 'Idade', 'Cor Manchester', 'Prioridade', 'Queixa', 'Status', 'Enfermeiro(a)', 'Médico(a)'];
    const rows = filteredTickets.map(t => [
      t.id,
      new Date(t.createdAt).toLocaleString('pt-BR'),
      `"${t.patient.fullName}"`,
      t.patient.cpf,
      t.patient.age,
      t.color.toUpperCase(),
      t.priorityLevel,
      `"${t.questionnaire.chiefComplaint.replace(/"/g, '""')}"`,
      t.status,
      `"${t.triageNurse}"`,
      `"${t.attendingDoctor || 'N/A'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `historico_triagens_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = (ticket: TriageTicket) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const colorCfg = MANCHESTER_RULES[ticket.color];

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ficha de Triagem Manchester #${ticket.id}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 20px; color: #1e293b; line-height: 1.5; }
            .header { border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .badge { background: ${colorCfg.hexColor}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 18px; text-transform: uppercase; }
            .section { margin-bottom: 20px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
            .vital { background: #f8fafc; padding: 8px; border-radius: 6px; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2 style="margin:0;">HOSPITAL CENTRAL - FICHA DE TRIAGEM</h2>
              <p style="margin:0; font-size:12px; color:#64748b;">Protocolo de Classificação de Risco Manchester</p>
            </div>
            <div class="badge">${colorCfg.label} (${colorCfg.category})</div>
          </div>

          <div class="section">
            <h3 style="margin-top:0;">DADOS DO PACIENTE - FICHA #${ticket.id}</h3>
            <div class="grid">
              <p><strong>Nome:</strong> ${ticket.patient.fullName}</p>
              <p><strong>CPF:</strong> ${ticket.patient.cpf}</p>
              <p><strong>Idade:</strong> ${ticket.patient.age} anos (${ticket.patient.gender})</p>
              <p><strong>Data/Hora:</strong> ${new Date(ticket.createdAt).toLocaleString('pt-BR')}</p>
            </div>
          </div>

          <div class="section">
            <h3 style="margin-top:0;">SINAIS VITAIS</h3>
            <div class="grid">
              <div class="vital">Pressão Arterial: ${ticket.vitalSigns.systolicBP}/${ticket.vitalSigns.diastolicBP} mmHg</div>
              <div class="vital">Frequência Cardíaca: ${ticket.vitalSigns.heartRate} bpm</div>
              <div class="vital">Saturação O2: ${ticket.vitalSigns.oxygenSaturation}%</div>
              <div class="vital">Temperatura: ${ticket.vitalSigns.temperature}°C</div>
              <div class="vital">Escala de Dor: ${ticket.vitalSigns.painScale}/10</div>
              <div class="vital">Consciência: ${ticket.vitalSigns.consciousnessLevel}</div>
            </div>
          </div>

          <div class="section">
            <h3 style="margin-top:0;">QUEIXA PRINCIPAL E PARECER</h3>
            <p><strong>Queixa:</strong> ${ticket.questionnaire.chiefComplaint}</p>
            <p><strong>Justificativa de Prioridade:</strong> ${ticket.justification}</p>
            <p><strong>Enfermeiro(a) Triador(a):</strong> ${ticket.triageNurse}</p>
          </div>

          <div class="footer">
            Sistema de Triagem Manchester - Documento impresso em ${new Date().toLocaleString('pt-BR')}
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <History className="w-6 h-6 text-purple-600" />
              <span>Banco de Dados de Chamados & Histórico</span>
            </h2>
            <p className="text-xs text-slate-500">Histórico completo de fichas de triagem, atendimentos e registros de auditoria</p>
          </div>

          <button
            onClick={exportCSV}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exportar Relatório CSV</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por Paciente, CPF, Nº Ficha..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="all">Todos os Status</option>
              <option value="aguardando">Aguardando</option>
              <option value="em_atendimento">Em Atendimento</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div>
            <select
              value={colorFilter}
              onChange={e => setColorFilter(e.target.value as any)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="all">Todas as Cores Manchester</option>
              <option value="red">Vermelho (Emergência)</option>
              <option value="orange">Laranja (Muito Urgente)</option>
              <option value="yellow">Amarelo (Urgente)</option>
              <option value="green">Verde (Pouco Urgente)</option>
              <option value="blue">Azul (Não Urgente)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-3.5">Ficha / Data</th>
                <th className="p-3.5">Paciente</th>
                <th className="p-3.5">Classificação Manchester</th>
                <th className="p-3.5">Queixa Principal</th>
                <th className="p-3.5">Sinais Vitais</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Nenhum registro encontrado no banco de dados.
                  </td>
                </tr>
              ) : (
                filteredTickets.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 font-mono">#{t.id}</div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(t.createdAt).toLocaleDateString('pt-BR')} às {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{t.patient.fullName}</div>
                      <div className="text-[11px] text-slate-400">{t.patient.cpf} ({t.patient.age} anos)</div>
                    </td>

                    <td className="p-3.5">
                      <ManchesterBadge color={t.color} size="sm" />
                    </td>

                    <td className="p-3.5 max-w-xs truncate" title={t.questionnaire.chiefComplaint}>
                      {t.questionnaire.chiefComplaint}
                    </td>

                    <td className="p-3.5 font-mono text-[11px] text-slate-600">
                      PA {t.vitalSigns.systolicBP}/{t.vitalSigns.diastolicBP} | FC {t.vitalSigns.heartRate} | SpO2 {t.vitalSigns.oxygenSaturation}%
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        t.status === 'aguardando' ? 'bg-amber-100 text-amber-800' :
                        t.status === 'em_atendimento' ? 'bg-blue-100 text-blue-800' :
                        t.status === 'concluido' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {t.status === 'aguardando' ? 'Aguardando' : t.status === 'em_atendimento' ? 'Em Atendimento' : t.status === 'concluido' ? 'Concluído' : 'Cancelado'}
                      </span>
                    </td>

                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => setActiveTicketModal(t)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Ver Detalhes do Chamado"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePrint(t)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Imprimir Ficha de Triagem"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {activeTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 space-y-5 animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <ManchesterBadge color={activeTicketModal.color} size="lg" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Ficha Clínica #{activeTicketModal.id}</h3>
                  <p className="text-xs text-slate-500">
                    Cadastrado em {new Date(activeTicketModal.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTicketModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Patient & Vitals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] border-b pb-1">Dados do Paciente</h4>
                <p><strong>Nome:</strong> {activeTicketModal.patient.fullName}</p>
                <p><strong>CPF:</strong> {activeTicketModal.patient.cpf}</p>
                <p><strong>Idade/Gênero:</strong> {activeTicketModal.patient.age} anos ({activeTicketModal.patient.gender})</p>
                <p><strong>Telefone:</strong> {activeTicketModal.patient.phone}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 font-mono">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] border-b pb-1">Sinais Vitais</h4>
                <p><strong>PA:</strong> {activeTicketModal.vitalSigns.systolicBP}/{activeTicketModal.vitalSigns.diastolicBP} mmHg</p>
                <p><strong>FC:</strong> {activeTicketModal.vitalSigns.heartRate} bpm | <strong>FR:</strong> {activeTicketModal.vitalSigns.respiratoryRate} ipm</p>
                <p><strong>SpO2:</strong> {activeTicketModal.vitalSigns.oxygenSaturation}% | <strong>Temp:</strong> {activeTicketModal.vitalSigns.temperature}°C</p>
                <p><strong>Dor:</strong> {activeTicketModal.vitalSigns.painScale}/10 | <strong>Glasgow:</strong> {activeTicketModal.vitalSigns.glasgowScale || 15}</p>
              </div>
            </div>

            {/* Justification & Complaint */}
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                <p className="font-bold">Queixa Principal:</p>
                <p className="mt-0.5">{activeTicketModal.questionnaire.chiefComplaint}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800">
                <p className="font-bold">Justificativa Automatizada Manchester:</p>
                <p className="mt-0.5 leading-relaxed">{activeTicketModal.justification}</p>
              </div>

              {activeTicketModal.aiAnalysis && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900">
                  <p className="font-bold">Análise Gemini IA:</p>
                  <p className="mt-0.5">{activeTicketModal.aiAnalysis.clinicalReasoning}</p>
                </div>
              )}
            </div>

            {/* Audit Log */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
              <h4 className="font-bold text-slate-800 uppercase text-[11px]">Histórico de Auditoria & Ações</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {activeTicketModal.auditLog.map(log => (
                  <div key={log.id} className="p-2 bg-slate-50 rounded-lg text-[11px] flex items-center justify-between">
                    <div>
                      <strong className="text-slate-900">{log.action}</strong>
                      <span className="text-slate-500"> - por {log.user}</span>
                      {log.notes && <p className="text-slate-600 text-[10px]">{log.notes}</p>}
                    </div>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => handlePrint(activeTicketModal)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Ficha</span>
              </button>
              <button
                onClick={() => setActiveTicketModal(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

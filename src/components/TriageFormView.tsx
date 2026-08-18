import React, { useState, useEffect } from 'react';
import { PatientInfo, VitalSigns, TriageQuestionnaire, ManchesterColor, AIAnalysis } from '../types';
import { DISCRIMINATOR_LIST, evaluateManchesterPriority, DiscriminatorDefinition } from '../lib/manchesterEngine';
import { ManchesterBadge } from './ManchesterBadge';
import {
  User, HeartPulse, Activity, Stethoscope, AlertTriangle, Sparkles,
  CheckCircle2, ArrowRight, ShieldAlert, Thermometer, Flame, Scale
} from 'lucide-react';

interface TriageFormViewProps {
  onSubmitTicket: (
    patient: PatientInfo,
    vitalSigns: VitalSigns,
    questionnaire: TriageQuestionnaire,
    nurseName: string,
    aiAnalysis?: AIAnalysis
  ) => void;
  onCancel?: () => void;
  initialData?: any;
}

export const TriageFormView: React.FC<TriageFormViewProps> = ({
  onSubmitTicket,
  onCancel,
  initialData
}) => {
  // Nurse info
  const [triageNurse, setTriageNurse] = useState('Enf. Juliana Mendes (COREN 142.590)');

  // Step 1: Patient Info
  const [patient, setPatient] = useState<PatientInfo>({
    fullName: initialData?.patient?.fullName || '',
    cpf: initialData?.patient?.cpf || '',
    birthDate: initialData?.patient?.birthDate || '1990-05-15',
    age: initialData?.patient?.age || 36,
    gender: initialData?.patient?.gender || 'feminino',
    phone: initialData?.patient?.phone || '(11) 98888-7777',
    susCard: initialData?.patient?.susCard || ''
  });

  // Calculate age automatically from birthdate
  const handleBirthDateChange = (val: string) => {
    setPatient(prev => {
      let age = prev.age;
      if (val) {
        const birth = new Date(val);
        const today = new Date();
        age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      }
      return { ...prev, birthDate: val, age: Math.max(0, age) };
    });
  };

  // Step 2: Vital Signs
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({
    systolicBP: initialData?.vitalSigns?.systolicBP || 120,
    diastolicBP: initialData?.vitalSigns?.diastolicBP || 80,
    heartRate: initialData?.vitalSigns?.heartRate || 78,
    respiratoryRate: initialData?.vitalSigns?.respiratoryRate || 16,
    oxygenSaturation: initialData?.vitalSigns?.oxygenSaturation || 98,
    temperature: initialData?.vitalSigns?.temperature || 36.6,
    painScale: initialData?.vitalSigns?.painScale || 0,
    bloodGlucose: initialData?.vitalSigns?.bloodGlucose || 95,
    glasgowScale: initialData?.vitalSigns?.glasgowScale || 15,
    consciousnessLevel: initialData?.vitalSigns?.consciousnessLevel || 'alerta'
  });

  // Step 3: Questionnaire
  const [questionnaire, setQuestionnaire] = useState<TriageQuestionnaire>({
    chiefComplaint: initialData?.questionnaire?.chiefComplaint || '',
    symptomsDescription: initialData?.questionnaire?.symptomsDescription || '',
    onsetDuration: initialData?.questionnaire?.onsetDuration || '1 hora',
    allergies: initialData?.questionnaire?.allergies || 'Nenhuma informada',
    preExistingConditions: initialData?.questionnaire?.preExistingConditions || [],
    discriminators: initialData?.questionnaire?.discriminators || []
  });

  // AI Analysis state
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | undefined>(undefined);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Active discriminator filter category
  const [discCategory, setDiscCategory] = useState<string>('todos');
  const [discSearch, setDiscSearch] = useState('');

  // Live evaluation based on current vitals & questionnaire
  const liveEvaluation = evaluateManchesterPriority(vitalSigns, questionnaire);

  const toggleDiscriminator = (id: string) => {
    setQuestionnaire(prev => {
      const exists = prev.discriminators.includes(id);
      return {
        ...prev,
        discriminators: exists
          ? prev.discriminators.filter(d => d !== id)
          : [...prev.discriminators, id]
      };
    });
  };

  const handleRunAIAnalysis = async () => {
    if (!questionnaire.chiefComplaint.trim()) {
      alert('Por favor, informe a queixa principal do paciente antes de solicitar a análise por IA.');
      return;
    }

    setIsAnalyzingAI(true);
    setAiError(null);

    try {
      const response = await fetch('/api/tickets/ai-assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: patient.age,
          vitalSigns,
          questionnaire
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao obter análise inteligente da API Gemini');
      }

      const data: AIAnalysis = await response.json();
      setAiAnalysis(data);
    } catch (err: any) {
      console.error('Error fetching AI analysis:', err);
      setAiError('Não foi possível se conectar ao serviço de IA. A automação determinística permanece ativa.');
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!patient.fullName.trim()) {
      alert('Por favor, informe o nome completo do paciente.');
      return;
    }

    if (!questionnaire.chiefComplaint.trim()) {
      alert('Por favor, informe a queixa principal do paciente.');
      return;
    }

    onSubmitTicket(patient, vitalSigns, questionnaire, triageNurse, aiAnalysis);
  };

  const filteredDiscriminators = DISCRIMINATOR_LIST.filter(d => {
    if (discCategory !== 'todos' && d.category !== discCategory) return false;
    if (discSearch.trim() !== '') {
      const q = discSearch.toLowerCase();
      return d.label.toLowerCase().includes(q) || d.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header Bar */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/30 rounded-xl border border-blue-500/30">
            <Stethoscope className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Formulário de Avaliação Clínica & Triagem</h2>
            <p className="text-xs text-slate-300">Classificação automatizada de prioridade do Protocolo Manchester</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 text-xs">
          <User className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="text-slate-400 block text-[10px]">Profissional Triador:</span>
            <input
              type="text"
              value={triageNurse}
              onChange={e => setTriageNurse(e.target.value)}
              className="bg-transparent font-semibold text-white focus:outline-hidden border-b border-dashed border-slate-600"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 columns: Patient Info, Vitals, Discriminators */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Identification */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>1. Identificação do Paciente</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo do Paciente *</label>
                <input
                  type="text"
                  required
                  value={patient.fullName}
                  onChange={e => setPatient({ ...patient, fullName: e.target.value })}
                  placeholder="Ex: Carlos Eduardo da Silva"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CPF / Documento</label>
                <input
                  type="text"
                  value={patient.cpf}
                  onChange={e => setPatient({ ...patient, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Data de Nascimento / Idade</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={patient.birthDate}
                    onChange={e => handleBirthDateChange(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900"
                  />
                  <div className="w-24 p-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 text-center">
                    {patient.age} anos
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gênero BIológico</label>
                <select
                  value={patient.gender}
                  onChange={e => setPatient({ ...patient, gender: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900"
                >
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Telefone / Contato</label>
                <input
                  type="text"
                  value={patient.phone}
                  onChange={e => setPatient({ ...patient, phone: e.target.value })}
                  placeholder="(11) 98765-4321"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>

          {/* 2. Vital Signs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>2. Registro de Sinais Vitais</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Blood Pressure */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">PA (Sistólica/Diastólica)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={vitalSigns.systolicBP || ''}
                    onChange={e => setVitalSigns({ ...vitalSigns, systolicBP: Number(e.target.value) })}
                    placeholder="120"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-center font-bold"
                  />
                  <span className="text-slate-400 font-bold">/</span>
                  <input
                    type="number"
                    value={vitalSigns.diastolicBP || ''}
                    onChange={e => setVitalSigns({ ...vitalSigns, diastolicBP: Number(e.target.value) })}
                    placeholder="80"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-center font-bold"
                  />
                </div>
                <span className="text-[10px] text-slate-400">mmHg</span>
              </div>

              {/* Heart Rate */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">FC (Cardíaca)</label>
                <input
                  type="number"
                  value={vitalSigns.heartRate || ''}
                  onChange={e => setVitalSigns({ ...vitalSigns, heartRate: Number(e.target.value) })}
                  placeholder="75"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-center"
                />
                <span className="text-[10px] text-slate-400">bpm</span>
              </div>

              {/* SpO2 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">SpO2 (Saturação)</label>
                <input
                  type="number"
                  value={vitalSigns.oxygenSaturation || ''}
                  onChange={e => setVitalSigns({ ...vitalSigns, oxygenSaturation: Number(e.target.value) })}
                  placeholder="98"
                  className={`w-full p-2 border rounded-lg text-sm font-bold text-center ${
                    vitalSigns.oxygenSaturation < 94 ? 'bg-red-50 text-red-700 border-red-300' : 'bg-slate-50 border-slate-300'
                  }`}
                />
                <span className="text-[10px] text-slate-400">% O2</span>
              </div>

              {/* Temperature */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Temperatura</label>
                <input
                  type="number"
                  step="0.1"
                  value={vitalSigns.temperature || ''}
                  onChange={e => setVitalSigns({ ...vitalSigns, temperature: Number(e.target.value) })}
                  placeholder="36.5"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-center"
                />
                <span className="text-[10px] text-slate-400">°C</span>
              </div>

              {/* Pain Scale Slider */}
              <div className="col-span-2 sm:col-span-1">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">Escala NVS de Dor:</label>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                    vitalSigns.painScale >= 7 ? 'bg-red-600 text-white' : vitalSigns.painScale >= 4 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-800'
                  }`}>
                    {vitalSigns.painScale} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={vitalSigns.painScale}
                  onChange={e => setVitalSigns({ ...vitalSigns, painScale: Number(e.target.value) })}
                  className="w-full accent-slate-900 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-0.5">
                  <span>Sem dor</span>
                  <span>Moderada</span>
                  <span>Intensa (10)</span>
                </div>
              </div>

              {/* Consciousness */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nível de Consciência</label>
                <select
                  value={vitalSigns.consciousnessLevel}
                  onChange={e => setVitalSigns({ ...vitalSigns, consciousnessLevel: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                >
                  <option value="alerta">Alerta (AVPU - A)</option>
                  <option value="verbal">Responde a Verbal (V)</option>
                  <option value="dor">Responde a Dor (P)</option>
                  <option value="inconsciente">Inconsciente (U)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Chief Complaint & Discriminators */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <HeartPulse className="w-4 h-4 text-purple-600" />
              <span>3. Queixa Principal & Discriminadores Manchester</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Queixa Principal do Paciente *</label>
              <input
                type="text"
                required
                value={questionnaire.chiefComplaint}
                onChange={e => setQuestionnaire({ ...questionnaire, chiefComplaint: e.target.value })}
                placeholder="Ex: Dor torácica opressiva irradiando para o braço esquerdo há 30 min..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Descrição Detalhada dos Sintomas</label>
              <textarea
                rows={2}
                value={questionnaire.symptomsDescription}
                onChange={e => setQuestionnaire({ ...questionnaire, symptomsDescription: e.target.value })}
                placeholder="Detalhes adicionais sobre surgimento, intensidade, sintomas associados..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Discriminators Picker */}
            <div className="space-y-2 pt-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-700">Selecione os Discriminadores Clínicos:</label>
                <input
                  type="text"
                  placeholder="Filtrar sintoma/discriminador..."
                  value={discSearch}
                  onChange={e => setDiscSearch(e.target.value)}
                  className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs w-full sm:w-48"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1 text-xs">
                {['todos', 'respiratorio', 'cardiovascular', 'neurologico', 'trauma', 'dor', 'infecao', 'outros'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setDiscCategory(cat)}
                    className={`px-2.5 py-1 rounded-md capitalize font-semibold transition-colors text-[11px] ${
                      discCategory === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* List of Discriminators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                {filteredDiscriminators.map(disc => {
                  const isChecked = questionnaire.discriminators.includes(disc.id);
                  return (
                    <div
                      key={disc.id}
                      onClick={() => toggleDiscriminator(disc.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                        isChecked
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-1 accent-white"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs">{disc.label}</span>
                          <ManchesterBadge color={disc.color} size="sm" showCategory={false} />
                        </div>
                        <p className={`text-[11px] mt-0.5 ${isChecked ? 'text-slate-300' : 'text-slate-500'}`}>
                          {disc.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Real-time Automated Priority Result & Gemini AI Assistant */}
        <div className="space-y-6">
          {/* Real-time Result Box */}
          <div className="bg-white p-5 rounded-2xl border-2 border-slate-900 shadow-lg space-y-4 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Classificação Automatizada Manchester
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            {/* Manchester Color Big Card */}
            <div className="text-center p-5 rounded-2xl text-white space-y-2 shadow-inner" style={{
              backgroundColor: liveEvaluation.color === 'red' ? '#ef4444' :
                               liveEvaluation.color === 'orange' ? '#f97316' :
                               liveEvaluation.color === 'yellow' ? '#eab308' :
                               liveEvaluation.color === 'green' ? '#22c55e' : '#3b82f6'
            }}>
              <ManchesterBadge color={liveEvaluation.color} size="lg" showWaitTime={true} />
              <p className="text-2xl font-black uppercase tracking-tight">
                Prioridade {liveEvaluation.priorityLevel}
              </p>
              <p className="text-xs font-medium opacity-90">
                Tempo Máximo para Atendimento: <strong className="underline">{liveEvaluation.maxWaitMinutes === 0 ? 'IMEDIATO' : `${liveEvaluation.maxWaitMinutes} minutos`}</strong>
              </p>
            </div>

            {/* Deterministic Justification */}
            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-900 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Critérios Determinantes Encontrados:</span>
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px]">
                {liveEvaluation.reasons.slice(0, 4).map((r, i) => (
                  <li key={i} className="font-medium text-slate-700">{r}</li>
                ))}
              </ul>
            </div>

            {/* Gemini AI Assistant Button & Panel */}
            <div className="border-t border-slate-200 pt-3 space-y-3">
              <button
                type="button"
                onClick={handleRunAIAnalysis}
                disabled={isAnalyzingAI}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 hover:from-purple-800 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                <span>{isAnalyzingAI ? 'Analisando Raciocínio Clínico...' : 'Analisar Raciocínio Médico com Gemini IA'}</span>
              </button>

              {aiError && (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  {aiError}
                </p>
              )}

              {aiAnalysis && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Parecer Clínico Gemini IA</span>
                    </span>
                    <span className="text-[10px] bg-purple-200 text-purple-800 px-1.5 py-0.2 rounded-sm font-mono font-bold">
                      {(aiAnalysis.confidenceScore * 100).toFixed(0)}% Confiança
                    </span>
                  </div>

                  <p className="text-[11px] text-purple-950 font-medium leading-relaxed">
                    {aiAnalysis.clinicalReasoning}
                  </p>

                  {aiAnalysis.riskFactors.length > 0 && (
                    <div className="pt-1">
                      <span className="font-bold text-purple-900 text-[10px] uppercase">Risco Identificado:</span>
                      <ul className="list-disc list-inside text-[11px] text-purple-900">
                        {aiAnalysis.riskFactors.map((rf, idx) => (
                          <li key={idx}>{rf}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-2">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-1/3 py-3 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl transition-colors"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl shadow-lg transition-transform hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                <span>Finalizar e Gravar Triagem</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

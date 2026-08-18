import React, { useState, useEffect } from 'react';
import { APIKey, WebhookConfig } from '../types';
import {
  Code2, Key, Globe, Send, Copy, Check, Terminal,
  Server, Sparkles, Database, ShieldCheck, Play
} from 'lucide-react';

export const ApiDocsView: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // API Tester state
  const [testPatientName, setTestPatientName] = useState('Juliana Paes');
  const [testChiefComplaint, setTestChiefComplaint] = useState('Dor no peito intensa com tontura e mal-estar');
  const [testSpO2, setTestSpO2] = useState(91);
  const [testSystolicBP, setTestSystolicBP] = useState(170);
  const [testHeartRate, setTestHeartRate] = useState(115);
  const [testPain, setTestPain] = useState(8);
  const [testLoading, setTestLoading] = useState(false);
  const [testResponse, setTestResponse] = useState<any>(null);

  const fetchKeysAndWebhooks = async () => {
    try {
      const keysRes = await fetch('/api/developer/api-keys');
      if (keysRes.ok) setApiKeys(await keysRes.json());

      const whRes = await fetch('/api/developer/webhooks');
      if (whRes.ok) setWebhooks(await whRes.json());
    } catch (e) {
      console.error('Error fetching API dev data:', e);
    }
  };

  useEffect(() => {
    fetchKeysAndWebhooks();
  }, []);

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) return;
    try {
      const res = await fetch('/api/developer/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName })
      });
      if (res.ok) {
        setNewKeyName('');
        fetchKeysAndWebhooks();
      }
    } catch (e) {
      console.error('Error creating API key:', e);
    }
  };

  const handleCreateWebhook = async () => {
    if (!newWebhookUrl.trim()) return;
    try {
      const res = await fetch('/api/developer/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newWebhookUrl, events: ['new_ticket', 'urgent_ticket'] })
      });
      if (res.ok) {
        setNewWebhookUrl('');
        fetchKeysAndWebhooks();
      }
    } catch (e) {
      console.error('Error creating webhook:', e);
    }
  };

  const handleCopyKey = (id: string, keyStr: string) => {
    navigator.clipboard.writeText(keyStr);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleRunApiTest = async () => {
    setTestLoading(true);
    setTestResponse(null);

    const payload = {
      patientName: testPatientName,
      cpf: '987.654.321-99',
      age: 42,
      chiefComplaint: testChiefComplaint,
      systolicBP: testSystolicBP,
      diastolicBP: 95,
      heartRate: testHeartRate,
      oxygenSaturation: testSpO2,
      temp: 37.8,
      pain: testPain
    };

    try {
      const start = Date.now();
      const res = await fetch('/api/webhook/triage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKeys[0]?.key || 'tr_live_demo_key'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      const elapsed = Date.now() - start;

      setTestResponse({
        status: res.status,
        statusText: res.statusText,
        elapsedMs: elapsed,
        data
      });
    } catch (err: any) {
      setTestResponse({
        error: err.message || 'Falha ao executar requisição'
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30">
            <Code2 className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Portal de Integração API REST & Webhooks</h2>
            <p className="text-xs text-slate-300">Integre o Sistema de Triagem Manchester com prontuários eletrônicos (PEP), totens e sistemas externos</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono">
          <Server className="w-4 h-4 text-emerald-400" />
          <span>Endpoint Base: /api</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Interactive API Tester */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 uppercase tracking-wider">
              <Play className="w-4 h-4 text-emerald-600" />
              <span>Testador de API REST em Tempo Real</span>
            </h3>
            <span className="text-[11px] bg-emerald-100 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded-md">
              POST /api/webhook/triage
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Envie dados de pacientes diretamente via requisição HTTP JSON e veja o chamado ser criado e classificado na fila ao vivo!
          </p>

          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nome do Paciente:</label>
              <input
                type="text"
                value={testPatientName}
                onChange={e => setTestPatientName(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Queixa Principal:</label>
              <input
                type="text"
                value={testChiefComplaint}
                onChange={e => setTestChiefComplaint(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-0.5">SpO2 (%):</label>
                <input
                  type="number"
                  value={testSpO2}
                  onChange={e => setTestSpO2(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-0.5">PA (Sistólica):</label>
                <input
                  type="number"
                  value={testSystolicBP}
                  onChange={e => setTestSystolicBP(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-0.5">FC (bpm):</label>
                <input
                  type="number"
                  value={testHeartRate}
                  onChange={e => setTestHeartRate(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-0.5">Dor (0-10):</label>
                <input
                  type="number"
                  value={testPain}
                  onChange={e => setTestPain(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                />
              </div>
            </div>

            <button
              onClick={handleRunApiTest}
              disabled={testLoading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span>{testLoading ? 'Disparando Requisição API...' : 'Disparar Requisição JSON de Teste'}</span>
            </button>
          </div>

          {/* Test Response Output */}
          {testResponse && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5 text-blue-600" />
                  <span>Resposta HTTP Recebida:</span>
                </span>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className={`px-2 py-0.5 rounded-sm font-bold ${testResponse.status === 201 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    HTTP {testResponse.status || 'ERR'}
                  </span>
                  <span className="text-slate-400">{testResponse.elapsedMs}ms</span>
                </div>
              </div>

              <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-48 border border-slate-800">
                {JSON.stringify(testResponse.data || testResponse.error, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Right: API Keys & Webhooks Management */}
        <div className="space-y-6">
          {/* API Keys */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 uppercase tracking-wider border-b border-slate-100 pb-2">
              <Key className="w-4 h-4 text-purple-600" />
              <span>Gerenciador de Chaves de API (API Keys)</span>
            </h3>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Nome da Aplicação / Sistema..."
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
              />
              <button
                onClick={handleCreateApiKey}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Gerar Chave
              </button>
            </div>

            <div className="space-y-2">
              {apiKeys.map(k => (
                <div key={k.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{k.name}</div>
                    <div className="font-mono text-slate-500 text-[11px] mt-0.5">{k.key}</div>
                  </div>
                  <button
                    onClick={() => handleCopyKey(k.id, k.key)}
                    className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors"
                    title="Copiar Chave"
                  >
                    {copiedKeyId === k.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Webhooks */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 uppercase tracking-wider border-b border-slate-100 pb-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>Configuração de Webhooks de Saída</span>
            </h3>

            <div className="flex items-center gap-2">
              <input
                type="url"
                placeholder="https://seu-sistema.com/webhook"
                value={newWebhookUrl}
                onChange={e => setNewWebhookUrl(e.target.value)}
                className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
              />
              <button
                onClick={handleCreateWebhook}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Cadastrar
              </button>
            </div>

            <div className="space-y-2">
              {webhooks.map(w => (
                <div key={w.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="font-bold text-slate-900 font-mono truncate">{w.url}</div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Ativo | Eventos: {w.events.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Endpoints Documentation List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          <span>Documentação Oficial da API REST</span>
        </h3>

        <div className="space-y-3 font-mono text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="bg-blue-600 text-white px-2 py-0.5 rounded-md text-[10px]">GET</span>
              <span>/api/tickets</span>
            </div>
            <p className="font-sans text-slate-600 text-xs">Lista os chamados da fila. Aceita filtros de query parameter: <code className="bg-slate-200 px-1">status</code>, <code className="bg-slate-200 px-1">color</code> e <code className="bg-slate-200 px-1">search</code>.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[10px]">POST</span>
              <span>/api/tickets</span>
            </div>
            <p className="font-sans text-slate-600 text-xs">Cadastra uma nova triagem completa. Calcula e grava a classificação Manchester no banco de dados automaticamente.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="bg-amber-600 text-white px-2 py-0.5 rounded-md text-[10px]">PATCH</span>
              <span>/api/tickets/:id/status</span>
            </div>
            <p className="font-sans text-slate-600 text-xs">Atualiza o status do chamado (<code className="bg-slate-200 px-1">aguardando</code>, <code className="bg-slate-200 px-1">em_atendimento</code>, <code className="bg-slate-200 px-1">concluido</code>) e registra log de auditoria.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="bg-purple-600 text-white px-2 py-0.5 rounded-md text-[10px]">POST</span>
              <span>/api/tickets/ai-assess</span>
            </div>
            <p className="font-sans text-slate-600 text-xs">Executa parecer técnico suplementar com IA Gemini sobre queixas em linguagem natural.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

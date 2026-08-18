import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/database';
import { evaluateManchesterPriority } from './src/lib/manchesterEngine';
import { analyzeTriageWithAI } from './server/geminiService';
import { TicketStatus, ManchesterColor } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS middleware for external API calls
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // ------------------------------------------------------------------------
  // API ROUTES
  // ------------------------------------------------------------------------

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Sistema de Triagem Manchester API', timestamp: new Date() });
  });

  // 1. Get Tickets
  app.get('/api/tickets', (req, res) => {
    const { status, color, search } = req.query;
    const tickets = db.getTickets({
      status: status as TicketStatus,
      color: color as ManchesterColor,
      search: search as string
    });
    res.json({ tickets, count: tickets.length });
  });

  // 2. Get Ticket by ID
  app.get('/api/tickets/:id', (req, res) => {
    const ticket = db.getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ficha de triagem não encontrada' });
    }
    res.json(ticket);
  });

  // 3. Create Ticket
  app.post('/api/tickets', async (req, res) => {
    try {
      const { patient, vitalSigns, questionnaire, triageNurse, aiAnalysis } = req.body;

      if (!patient || !vitalSigns || !questionnaire) {
        return res.status(400).json({ error: 'Dados incompletos para registro da triagem' });
      }

      // Automatically evaluate priority
      const evaluation = evaluateManchesterPriority(vitalSigns, questionnaire);

      const newTicket = db.createTicket({
        patient,
        vitalSigns,
        questionnaire,
        color: evaluation.color,
        priorityLevel: evaluation.priorityLevel,
        maxWaitMinutes: evaluation.maxWaitMinutes,
        status: 'aguardando',
        triageNurse: triageNurse || 'Enf. Responsável',
        justification: evaluation.justification,
        aiAnalysis
      });

      res.status(201).json(newTicket);
    } catch (err: any) {
      console.error('Error creating ticket:', err);
      res.status(500).json({ error: 'Falha ao processar triagem no servidor' });
    }
  });

  // 4. Update Ticket Status
  app.patch('/api/tickets/:id/status', (req, res) => {
    const { status, room, attendingDoctor, user, notes } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status é obrigatório' });
    }

    const updated = db.updateTicketStatus(
      req.params.id,
      status as TicketStatus,
      user || 'Usuário do Sistema',
      room,
      attendingDoctor,
      notes
    );

    if (!updated) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }

    res.json(updated);
  });

  // 5. Evaluate Manchester Rules (Preview without saving)
  app.post('/api/tickets/evaluate', (req, res) => {
    const { vitalSigns, questionnaire } = req.body;
    if (!vitalSigns || !questionnaire) {
      return res.status(400).json({ error: 'Sinais vitais e questionário são necessários' });
    }

    const evaluation = evaluateManchesterPriority(vitalSigns, questionnaire);
    res.json(evaluation);
  });

  // 6. AI Assessment (Gemini Integration)
  app.post('/api/tickets/ai-assess', async (req, res) => {
    try {
      const { age, vitalSigns, questionnaire } = req.body;
      if (!vitalSigns || !questionnaire) {
        return res.status(400).json({ error: 'Dados insuficientes para análise por IA' });
      }

      const result = await analyzeTriageWithAI(age || 30, vitalSigns, questionnaire);
      res.json(result);
    } catch (err: any) {
      console.error('AI Assessment Error:', err);
      res.status(500).json({ error: 'Erro ao processar análise inteligente' });
    }
  });

  // 7. Dashboard Stats Summary
  app.get('/api/stats/summary', (req, res) => {
    const stats = db.getDashboardStats();
    res.json(stats);
  });

  // 8. Notifications Routes
  app.get('/api/notifications', (req, res) => {
    res.json(db.getNotifications());
  });

  app.post('/api/notifications/read-all', (req, res) => {
    db.markAllNotificationsRead();
    res.json({ success: true });
  });

  app.patch('/api/notifications/:id/read', (req, res) => {
    db.markNotificationRead(req.params.id);
    res.json({ success: true });
  });

  // 9. API Keys & Webhooks Management
  app.get('/api/developer/api-keys', (req, res) => {
    res.json(db.getApiKeys());
  });

  app.post('/api/developer/api-keys', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome da chave é obrigatório' });
    const apiKey = db.createApiKey(name);
    res.json(apiKey);
  });

  app.get('/api/developer/webhooks', (req, res) => {
    res.json(db.getWebhooks());
  });

  app.post('/api/developer/webhooks', (req, res) => {
    const { url, events } = req.body;
    if (!url) return res.status(400).json({ error: 'URL do Webhook é obrigatória' });
    const wh = db.createWebhook(url, events || ['new_ticket']);
    res.json(wh);
  });

  // 10. External Webhook Input (API Integration Endpoint)
  app.post('/api/webhook/triage', async (req, res) => {
    try {
      const { patientName, cpf, age, chiefComplaint, systolicBP, diastolicBP, heartRate, oxygenSaturation, temp, pain } = req.body;

      if (!patientName || !chiefComplaint) {
        return res.status(400).json({
          error: 'Atributos obrigatórios ausentes: patientName e chiefComplaint'
        });
      }

      const patient = {
        fullName: patientName,
        cpf: cpf || '000.000.000-00',
        birthDate: '1990-01-01',
        age: Number(age) || 30,
        gender: 'outro' as const,
        phone: '(11) 90000-0000'
      };

      const vitalSigns = {
        systolicBP: Number(systolicBP) || 120,
        diastolicBP: Number(diastolicBP) || 80,
        heartRate: Number(heartRate) || 80,
        respiratoryRate: 18,
        oxygenSaturation: Number(oxygenSaturation) || 97,
        temperature: Number(temp) || 36.5,
        painScale: Number(pain) || 0,
        glasgowScale: 15,
        consciousnessLevel: 'alerta' as const
      };

      const questionnaire = {
        chiefComplaint,
        symptomsDescription: `Entrada via Webhook de Integração API Externa em ${new Date().toLocaleString()}`,
        onsetDuration: 'Informado via API',
        allergies: 'Não informado',
        preExistingConditions: [],
        discriminators: []
      };

      const evaluation = evaluateManchesterPriority(vitalSigns, questionnaire);

      const newTicket = db.createTicket({
        patient,
        vitalSigns,
        questionnaire,
        color: evaluation.color,
        priorityLevel: evaluation.priorityLevel,
        maxWaitMinutes: evaluation.maxWaitMinutes,
        status: 'aguardando',
        triageNurse: 'API Webhook Integration',
        justification: `[API Integration] ${evaluation.justification}`
      });

      res.status(201).json({
        message: 'Triagem recebida e processada via API com sucesso',
        ticketId: newTicket.id,
        manchesterColor: newTicket.color,
        maxWaitMinutes: newTicket.maxWaitMinutes,
        ticket: newTicket
      });
    } catch (err) {
      console.error('External API Webhook error:', err);
      res.status(500).json({ error: 'Erro no processamento da API externa' });
    }
  });

  // ------------------------------------------------------------------------
  // VITE DEVELOPMENT MIDDLEWARE OR PRODUCTION STATIC SERVING
  // ------------------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏥 Sistema de Triagem Manchester rodando em http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Erro ao iniciar o servidor:', err);
});

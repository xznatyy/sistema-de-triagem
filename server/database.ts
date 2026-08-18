import fs from 'fs';
import path from 'path';
import { TriageTicket, NotificationItem, APIKey, WebhookConfig, DashboardStats, ManchesterColor, TicketStatus } from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'triages.json');

interface DatabaseSchema {
  tickets: TriageTicket[];
  notifications: NotificationItem[];
  apiKeys: APIKey[];
  webhooks: WebhookConfig[];
  nextTicketNumber: number;
}

// Initial realistic seed data for immediate testing
const INITIAL_SEED: DatabaseSchema = {
  nextTicketNumber: 1008,
  apiKeys: [
    {
      id: 'key_prod_01',
      name: 'Integração Recepção / Totem',
      key: 'tr_live_89f02a3d7c92b41',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      lastUsedAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'key_app_mobile',
      name: 'App Triagem Móvel Enfermagem',
      key: 'tr_live_17e31b219a0094e',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      lastUsedAt: new Date(Date.now() - 900000).toISOString()
    }
  ],
  webhooks: [
    {
      id: 'wh_emergencia',
      url: 'https://api.hospital-central.gov.br/v1/alertas-emergencia',
      events: ['urgent_ticket', 'ticket_called'],
      active: true,
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
    }
  ],
  notifications: [
    {
      id: 'notif_1',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      ticketId: 'TR-1004',
      patientName: 'Carlos Eduardo Oliveira',
      color: 'red',
      type: 'emergencia_triada',
      message: 'PACIENTE CRÍTICO (VERMELHO): Dor torácica opressiva com sudorese. Atendimento Imediato!',
      read: false
    },
    {
      id: 'notif_2',
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      ticketId: 'TR-1003',
      patientName: 'Mariana Souza Santos',
      color: 'orange',
      type: 'emergencia_triada',
      message: 'Novo paciente Laranja triado: Dispneia moderada e SpO2 92%. Tempo limite: 10 min.',
      read: false
    },
    {
      id: 'notif_3',
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      ticketId: 'TR-1002',
      patientName: 'Roberto Alves Lima',
      color: 'yellow',
      type: 'sla_estourado',
      message: 'Aviso de SLA: Paciente atingiu 50% do tempo máximo de espera (Amarelo).',
      read: true
    }
  ],
  tickets: [
    {
      id: 'TR-1004',
      ticketNumber: 1004,
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      patient: {
        fullName: 'Carlos Eduardo Oliveira',
        cpf: '123.456.789-00',
        birthDate: '1968-04-12',
        age: 58,
        gender: 'masculino',
        phone: '(11) 98765-4321',
        susCard: '898 1234 5678 0001'
      },
      vitalSigns: {
        systolicBP: 175,
        diastolicBP: 105,
        heartRate: 118,
        respiratoryRate: 24,
        oxygenSaturation: 91,
        temperature: 36.8,
        painScale: 9,
        glasgowScale: 15,
        consciousnessLevel: 'alerta'
      },
      questionnaire: {
        chiefComplaint: 'Dor no peito irradiando para o braço esquerdo há 40 minutos',
        symptomsDescription: 'Sensação de aperto forte no tórax, náusea leve e sudorese fria. Iniciou em repouso.',
        onsetDuration: '40 minutos',
        allergies: 'Dipirona',
        preExistingConditions: ['Hipertensão', 'Diabetes Tipo 2'],
        discriminators: ['dor_toracica_intensa', 'dor_severa_isquemia']
      },
      color: 'red',
      priorityLevel: 1,
      maxWaitMinutes: 0,
      status: 'aguardando',
      triageNurse: 'Enf. Juliana Mendes (COREN 142.590)',
      justification: 'Classificação automatizada em VERMELHO (Emergência). Atendimento Imediato. Fatores: Suspeita de Síndrome Coronariana Aguda, SpO2 91%, Dor de intensidade 9/10.',
      auditLog: [
        {
          id: 'log_1',
          timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
          action: 'Triagem Realizada',
          user: 'Enf. Juliana Mendes',
          notes: 'Triagem de emergência concluída e paciente encaminhado à Sala Vermelha.'
        }
      ]
    },
    {
      id: 'TR-1003',
      ticketNumber: 1003,
      createdAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
      patient: {
        fullName: 'Mariana Souza Santos',
        cpf: '234.567.890-11',
        birthDate: '1992-09-25',
        age: 33,
        gender: 'feminino',
        phone: '(11) 97654-3210',
        susCard: '712 9876 5432 0002'
      },
      vitalSigns: {
        systolicBP: 135,
        diastolicBP: 88,
        heartRate: 112,
        respiratoryRate: 26,
        oxygenSaturation: 92,
        temperature: 38.4,
        painScale: 7,
        glasgowScale: 15,
        consciousnessLevel: 'alerta'
      },
      questionnaire: {
        chiefComplaint: 'Falta de ar progressiva e sibilância',
        symptomsDescription: 'Crise de asma que não respondeu ao uso de bombinha em casa. Dificuldade para completar frases.',
        onsetDuration: '2 horas',
        allergies: 'Aspirina, AINEs',
        preExistingConditions: ['Asma Brônquica'],
        discriminators: ['falta_de_ar_grave', 'dor_severa_isquemia']
      },
      color: 'orange',
      priorityLevel: 2,
      maxWaitMinutes: 10,
      status: 'aguardando',
      triageNurse: 'Enf. Juliana Mendes (COREN 142.590)',
      justification: 'Classificação automatizada em LARANJA (Muito Urgente). Tempo máximo: 10 min. Fatores: SpO2 92%, Taquipneia (26 ipm), Crise asmática grave.',
      auditLog: [
        {
          id: 'log_2',
          timestamp: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
          action: 'Triagem Realizada',
          user: 'Enf. Juliana Mendes',
          notes: 'Paciente colocada em inalação com O2 e aguardando médico.'
        }
      ]
    },
    {
      id: 'TR-1002',
      ticketNumber: 1002,
      createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      patient: {
        fullName: 'Roberto Alves Lima',
        cpf: '345.678.901-22',
        birthDate: '1981-11-03',
        age: 44,
        gender: 'masculino',
        phone: '(11) 96543-2109'
      },
      vitalSigns: {
        systolicBP: 148,
        diastolicBP: 92,
        heartRate: 88,
        respiratoryRate: 18,
        oxygenSaturation: 97,
        temperature: 38.9,
        painScale: 6,
        glasgowScale: 15,
        consciousnessLevel: 'alerta'
      },
      questionnaire: {
        chiefComplaint: 'Febre persistente de 38.9°C e dor abdominal contínua',
        symptomsDescription: 'Dor na fossa ilíaca direita há cerca de 12 horas, acompanhada de falta de apetite e náuseas.',
        onsetDuration: '12 horas',
        allergies: 'Nenhuma',
        preExistingConditions: [],
        discriminators: ['febre_alta_com_calafrios', 'dor_abdominal_moderada']
      },
      color: 'yellow',
      priorityLevel: 3,
      maxWaitMinutes: 60,
      status: 'aguardando',
      triageNurse: 'Enf. Lucas Costa (COREN 198.320)',
      justification: 'Classificação automatizada em AMARELO (Urgente). Tempo máximo: 60 min. Fatores: Febre 38.9°C e suspeita de apendicite aguda.',
      auditLog: [
        {
          id: 'log_3',
          timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
          action: 'Triagem Realizada',
          user: 'Enf. Lucas Costa'
        }
      ]
    },
    {
      id: 'TR-1001',
      ticketNumber: 1001,
      createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      patient: {
        fullName: 'Ana Beatriz Ferreira',
        cpf: '456.789.012-33',
        birthDate: '2001-02-18',
        age: 25,
        gender: 'feminino',
        phone: '(11) 95432-1098'
      },
      vitalSigns: {
        systolicBP: 120,
        diastolicBP: 80,
        heartRate: 76,
        respiratoryRate: 16,
        oxygenSaturation: 98,
        temperature: 36.6,
        painScale: 3,
        glasgowScale: 15,
        consciousnessLevel: 'alerta'
      },
      questionnaire: {
        chiefComplaint: 'Tosse seca e dor de garganta suave',
        symptomsDescription: 'Sintomas iniciaram há 2 dias. Sem febre ou falta de ar.',
        onsetDuration: '2 dias',
        allergies: 'Penicilina',
        preExistingConditions: [],
        discriminators: ['sintoma_respiratorio_leve', 'dor_leve_escala']
      },
      color: 'green',
      priorityLevel: 4,
      maxWaitMinutes: 120,
      status: 'em_atendimento',
      room: 'Consultório 03',
      attendingDoctor: 'Dr. Fernando Rocha (CRM 124.890)',
      calledAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      triageNurse: 'Enf. Lucas Costa (COREN 198.320)',
      justification: 'Classificação automatizada em VERDE (Pouco Urgente). Tempo máximo: 120 min. Sinais vitais normais e sintomas leves.',
      auditLog: [
        {
          id: 'log_4a',
          timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
          action: 'Triagem Realizada',
          user: 'Enf. Lucas Costa'
        },
        {
          id: 'log_4b',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          action: 'Chamado para Consultório 03',
          user: 'Dr. Fernando Rocha'
        }
      ]
    },
    {
      id: 'TR-1000',
      ticketNumber: 1000,
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      patient: {
        fullName: 'José Geraldo da Silva',
        cpf: '567.890.123-44',
        birthDate: '1955-07-30',
        age: 71,
        gender: 'masculino',
        phone: '(11) 94321-0987'
      },
      vitalSigns: {
        systolicBP: 130,
        diastolicBP: 82,
        heartRate: 70,
        respiratoryRate: 15,
        oxygenSaturation: 98,
        temperature: 36.4,
        painScale: 0,
        glasgowScale: 15,
        consciousnessLevel: 'alerta'
      },
      questionnaire: {
        chiefComplaint: 'Renovação de receita de remédio de uso contínuo (Pressão alta)',
        symptomsDescription: 'Paciente sem queixas agudas. Precisa apenas de nova receita de Losartana e Anlodipino.',
        onsetDuration: 'Contínuo',
        allergies: 'Nenhuma',
        preExistingConditions: ['Hipertensão Arterial Systemica'],
        discriminators: ['renovacao_receita']
      },
      color: 'blue',
      priorityLevel: 5,
      maxWaitMinutes: 240,
      status: 'concluido',
      room: 'Consultório 01',
      attendingDoctor: 'Dra. Camila Nogueira (CRM 156.432)',
      calledAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      completedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      triageNurse: 'Enf. Juliana Mendes (COREN 142.590)',
      justification: 'Classificação automatizada em AZUL (Não Urgente). Atendimento administrativo para renovação de prescrição.',
      auditLog: [
        {
          id: 'log_5a',
          timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
          action: 'Triagem Realizada',
          user: 'Enf. Juliana Mendes'
        },
        {
          id: 'log_5b',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          action: 'Chamado para Consultório 01',
          user: 'Dra. Camila Nogueira'
        },
        {
          id: 'log_5c',
          timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
          action: 'Atendimento Concluído',
          user: 'Dra. Camila Nogueira'
        }
      ]
    }
  ]
};

class DatabaseManager {
  private db: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.db = this.loadDatabase();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(fileContent);
      }
    } catch (error) {
      console.error('Error loading database file, re-initializing with seed:', error);
    }
    this.saveDatabase(INITIAL_SEED);
    return INITIAL_SEED;
  }

  private saveDatabase(data?: DatabaseSchema) {
    try {
      const toSave = data || this.db;
      fs.writeFileSync(DB_FILE, JSON.stringify(toSave, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error writing to database file:', error);
    }
  }

  // TICKETS CRUD
  public getTickets(filters?: {
    status?: TicketStatus;
    color?: ManchesterColor;
    search?: string;
  }): TriageTicket[] {
    let list = [...this.db.tickets];

    if (filters?.status) {
      list = list.filter(t => t.status === filters.status);
    }

    if (filters?.color) {
      list = list.filter(t => t.color === filters.color);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(t =>
        t.patient.fullName.toLowerCase().includes(q) ||
        t.patient.cpf.includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.questionnaire.chiefComplaint.toLowerCase().includes(q)
      );
    }

    // Sort by priority (1 is Red, 5 is Blue) then by creation time
    return list.sort((a, b) => {
      if (a.priorityLevel !== b.priorityLevel) {
        return a.priorityLevel - b.priorityLevel;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  public getTicketById(id: string): TriageTicket | undefined {
    return this.db.tickets.find(t => t.id === id || t.ticketNumber === Number(id));
  }

  public createTicket(ticketData: Omit<TriageTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'auditLog'>): TriageTicket {
    const num = this.db.nextTicketNumber++;
    const now = new Date().toISOString();
    const id = `TR-${num}`;

    const newTicket: TriageTicket = {
      ...ticketData,
      id,
      ticketNumber: num,
      createdAt: now,
      updatedAt: now,
      auditLog: [
        {
          id: `log_${Date.now()}`,
          timestamp: now,
          action: 'Triagem Criada e Classificada',
          user: ticketData.triageNurse || 'Sistema de Triagem',
          notes: `Classificado em ${ticketData.color.toUpperCase()}`
        }
      ]
    };

    this.db.tickets.unshift(newTicket);

    // Create Notification if Emergency or Very Urgent
    if (newTicket.color === 'red' || newTicket.color === 'orange') {
      const notifMessage = newTicket.color === 'red'
        ? `⚠️ EMERGÊNCIA (VERMELHO): Paciente ${newTicket.patient.fullName} triado com prioridade MÁXIMA!`
        : `⚡ MUITO URGENTE (LARANJA): Paciente ${newTicket.patient.fullName} na fila de espera (10 min limite).`;

      this.createNotification({
        ticketId: newTicket.id,
        patientName: newTicket.patient.fullName,
        color: newTicket.color,
        type: 'emergencia_triada',
        message: notifMessage
      });
    }

    this.saveDatabase();
    return newTicket;
  }

  public updateTicketStatus(
    id: string,
    status: TicketStatus,
    updatedBy: string,
    room?: string,
    doctor?: string,
    notes?: string
  ): TriageTicket | undefined {
    const ticket = this.getTicketById(id);
    if (!ticket) return undefined;

    const now = new Date().toISOString();
    ticket.status = status;
    ticket.updatedAt = now;

    if (room) ticket.room = room;
    if (doctor) ticket.attendingDoctor = doctor;

    let actionName = `Status alterado para ${status}`;
    if (status === 'em_atendimento') {
      ticket.calledAt = now;
      actionName = `Chamado para ${room || 'Consultório'}`;
      this.createNotification({
        ticketId: ticket.id,
        patientName: ticket.patient.fullName,
        color: ticket.color,
        type: 'paciente_chamado',
        message: `Paciente ${ticket.patient.fullName} chamado para o ${room || 'Consultório'}`
      });
    } else if (status === 'concluido') {
      ticket.completedAt = now;
      actionName = 'Atendimento Concluído';
    } else if (status === 'cancelado') {
      actionName = 'Chamado Cancelado';
    }

    ticket.auditLog.push({
      id: `log_${Date.now()}`,
      timestamp: now,
      action: actionName,
      user: updatedBy,
      notes
    });

    this.saveDatabase();
    return ticket;
  }

  // NOTIFICATIONS
  public getNotifications(): NotificationItem[] {
    return this.db.notifications;
  }

  public createNotification(data: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>): NotificationItem {
    const notif: NotificationItem = {
      ...data,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    this.db.notifications.unshift(notif);
    if (this.db.notifications.length > 50) {
      this.db.notifications.pop();
    }
    this.saveDatabase();
    return notif;
  }

  public markNotificationRead(id: string) {
    const notif = this.db.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveDatabase();
    }
  }

  public markAllNotificationsRead() {
    this.db.notifications.forEach(n => n.read = true);
    this.saveDatabase();
  }

  // API KEYS & WEBHOOKS
  public getApiKeys(): APIKey[] {
    return this.db.apiKeys;
  }

  public createApiKey(name: string): APIKey {
    const newKey: APIKey = {
      id: `key_${Date.now()}`,
      name,
      key: `tr_live_${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 8)}`,
      createdAt: new Date().toISOString()
    };
    this.db.apiKeys.push(newKey);
    this.saveDatabase();
    return newKey;
  }

  public getWebhooks(): WebhookConfig[] {
    return this.db.webhooks;
  }

  public createWebhook(url: string, events: WebhookConfig['events']): WebhookConfig {
    const wh: WebhookConfig = {
      id: `wh_${Date.now()}`,
      url,
      events,
      active: true,
      createdAt: new Date().toISOString()
    };
    this.db.webhooks.push(wh);
    this.saveDatabase();
    return wh;
  }

  // STATS
  public getDashboardStats(): DashboardStats {
    const now = new Date().getTime();
    const tickets = this.db.tickets;

    const waiting = tickets.filter(t => t.status === 'aguardando');
    const inProgress = tickets.filter(t => t.status === 'em_atendimento');
    const completed = tickets.filter(t => t.status === 'concluido');

    const colorBreakdown: Record<ManchesterColor, number> = {
      red: 0,
      orange: 0,
      yellow: 0,
      green: 0,
      blue: 0
    };

    let slaBreachCount = 0;

    tickets.forEach(t => {
      colorBreakdown[t.color] = (colorBreakdown[t.color] || 0) + 1;

      if (t.status === 'aguardando') {
        const createdMs = new Date(t.createdAt).getTime();
        const elapsedMins = (now - createdMs) / 60000;
        if (t.maxWaitMinutes > 0 && elapsedMins > t.maxWaitMinutes) {
          slaBreachCount++;
        }
      }
    });

    // Calculate avg wait time for completed or called tickets today
    const processedTickets = tickets.filter(t => t.calledAt || t.completedAt);
    let totalWaitMins = 0;
    processedTickets.forEach(t => {
      const created = new Date(t.createdAt).getTime();
      const called = new Date(t.calledAt || t.completedAt || t.updatedAt).getTime();
      totalWaitMins += Math.max(0, (called - created) / 60000);
    });

    const averageWaitMinutes = processedTickets.length > 0
      ? Math.round(totalWaitMins / processedTickets.length)
      : 12;

    return {
      totalToday: tickets.length,
      waitingCount: waiting.length,
      inProgressCount: inProgress.length,
      completedCount: completed.length,
      averageWaitMinutes,
      slaBreachCount,
      colorBreakdown
    };
  }
}

export const db = new DatabaseManager();

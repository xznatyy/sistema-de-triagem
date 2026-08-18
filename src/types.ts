export type ManchesterColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue';

export interface ManchesterConfig {
  color: ManchesterColor;
  label: string;
  category: string;
  maxWaitMinutes: number;
  hexColor: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  description: string;
}

export const MANCHESTER_RULES: Record<ManchesterColor, ManchesterConfig> = {
  red: {
    color: 'red',
    label: 'Vermelho',
    category: 'Emergência',
    maxWaitMinutes: 0,
    hexColor: '#ef4444',
    badgeBg: 'bg-red-600',
    badgeText: 'text-white',
    borderColor: 'border-red-500',
    description: 'Atendimento Imediato (0 minutos). Risco iminente de morte.'
  },
  orange: {
    color: 'orange',
    label: 'Laranja',
    category: 'Muito Urgente',
    maxWaitMinutes: 10,
    hexColor: '#f97316',
    badgeBg: 'bg-orange-500',
    badgeText: 'text-white',
    borderColor: 'border-orange-500',
    description: 'Atendimento em até 10 minutos. Condição potencialmente gravíssima.'
  },
  yellow: {
    color: 'yellow',
    label: 'Amarelo',
    category: 'Urgente',
    maxWaitMinutes: 60,
    hexColor: '#eab308',
    badgeBg: 'bg-amber-500',
    badgeText: 'text-white',
    borderColor: 'border-amber-500',
    description: 'Atendimento em até 60 minutos. Requer atenção médica rápida.'
  },
  green: {
    color: 'green',
    label: 'Verde',
    category: 'Pouco Urgente',
    maxWaitMinutes: 120,
    hexColor: '#22c55e',
    badgeBg: 'bg-emerald-600',
    badgeText: 'text-white',
    borderColor: 'border-emerald-500',
    description: 'Atendimento em até 120 minutos. Condição de baixa gravidade.'
  },
  blue: {
    color: 'blue',
    label: 'Azul',
    category: 'Não Urgente',
    maxWaitMinutes: 240,
    hexColor: '#3b82f6',
    badgeBg: 'bg-blue-600',
    badgeText: 'text-white',
    borderColor: 'border-blue-500',
    description: 'Atendimento em até 240 minutos. Casos crônicos ou administrativos.'
  }
};

export interface PatientInfo {
  fullName: string;
  cpf: string;
  birthDate: string;
  age: number;
  gender: 'masculino' | 'feminino' | 'outro';
  phone: string;
  susCard?: string;
  companionName?: string;
}

export interface VitalSigns {
  systolicBP: number; // mmHg
  diastolicBP: number; // mmHg
  heartRate: number; // bpm
  respiratoryRate: number; // ipm
  oxygenSaturation: number; // %
  temperature: number; // °C
  painScale: number; // 0-10
  bloodGlucose?: number; // mg/dL
  glasgowScale?: number; // 3-15
  consciousnessLevel: 'alerta' | 'verbal' | 'dor' | 'inconsciente';
}

export interface DiscriminatorOption {
  id: string;
  label: string;
  defaultColor: ManchesterColor;
  category: 'respiratorio' | 'cardiovascular' | 'neurologico' | 'trauma' | 'dor' | 'outros';
}

export interface TriageQuestionnaire {
  chiefComplaint: string;
  symptomsDescription: string;
  onsetDuration: string;
  allergies: string;
  preExistingConditions: string[];
  discriminators: string[];
}

export interface AIAnalysis {
  suggestedColor: ManchesterColor;
  clinicalReasoning: string;
  riskFactors: string[];
  recommendations: string[];
  confidenceScore: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  notes?: string;
}

export type TicketStatus = 'aguardando' | 'em_atendimento' | 'concluido' | 'cancelado';

export interface TriageTicket {
  id: string;
  ticketNumber: number;
  createdAt: string; // ISO String
  updatedAt: string;
  patient: PatientInfo;
  vitalSigns: VitalSigns;
  questionnaire: TriageQuestionnaire;
  color: ManchesterColor;
  priorityLevel: 1 | 2 | 3 | 4 | 5;
  maxWaitMinutes: number;
  status: TicketStatus;
  triageNurse: string;
  attendingDoctor?: string;
  room?: string;
  calledAt?: string;
  attendedAt?: string;
  completedAt?: string;
  justification: string;
  aiAnalysis?: AIAnalysis;
  auditLog: AuditLog[];
}

export interface NotificationItem {
  id: string;
  timestamp: string;
  ticketId: string;
  patientName: string;
  color: ManchesterColor;
  type: 'emergencia_triada' | 'sla_estourado' | 'paciente_chamado' | 'sistema';
  message: string;
  read: boolean;
}

export interface APIKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface WebhookConfig {
  id: string;
  url: string;
  events: ('new_ticket' | 'urgent_ticket' | 'ticket_called' | 'ticket_completed')[];
  active: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalToday: number;
  waitingCount: number;
  inProgressCount: number;
  completedCount: number;
  averageWaitMinutes: number;
  slaBreachCount: number;
  colorBreakdown: Record<ManchesterColor, number>;
}

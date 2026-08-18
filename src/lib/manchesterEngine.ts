import { ManchesterColor, VitalSigns, TriageQuestionnaire, MANCHESTER_RULES } from '../types';

export interface DiscriminatorDefinition {
  id: string;
  label: string;
  description: string;
  color: ManchesterColor;
  category: 'respiratorio' | 'cardiovascular' | 'neurologico' | 'trauma' | 'dor' | 'infecao' | 'outros';
}

export const DISCRIMINATOR_LIST: DiscriminatorDefinition[] = [
  // RED (Emergência - 0 min)
  {
    id: 'vias_aereas_obstruidas',
    label: 'Obstrução de Vias Aéreas / Engasgo',
    description: 'Incapacidade de respirar ou falar, cianose central.',
    color: 'red',
    category: 'respiratorio'
  },
  {
    id: 'parada_cardiorrespiratoria',
    label: 'Suspeita de PCR / Sem Pulso ou Apneia',
    description: 'Inconsciência com ausência de pulso e/ou respiração.',
    color: 'red',
    category: 'cardiovascular'
  },
  {
    id: 'choque_sinais_graves',
    label: 'Sinais de Choque Profundo',
    description: 'Pulsos finos/ausentes, pele fria e pegajosa, hipotensão grave.',
    color: 'red',
    category: 'cardiovascular'
  },
  {
    id: 'inconsciencia_total',
    label: 'Inconsciência / Glasgow ≤ 8',
    description: 'Nenhuma resposta a estímulos verbais ou dolorosos.',
    color: 'red',
    category: 'neurologico'
  },
  {
    id: 'convulsao_em_andamento',
    label: 'Crise Convulsiva Ativa / Reentrante',
    description: 'Paciente em crise convulsiva contínua no momento.',
    color: 'red',
    category: 'neurologico'
  },
  {
    id: 'hemorragia_exsangueante',
    label: 'Hemorragia Exsangueante Incontrolável',
    description: 'Sangramento arterial ou de grande vaso em volume massivo.',
    color: 'red',
    category: 'trauma'
  },

  // ORANGE (Muito Urgente - 10 min)
  {
    id: 'falta_de_ar_grave',
    label: 'Dispneia / Falta de Ar Severa',
    description: 'Uso de musculatura acessória, fala entrecortada, SpO2 < 94%.',
    color: 'orange',
    category: 'respiratorio'
  },
  {
    id: 'dor_toracica_intensa',
    label: 'Dor Torácica Opressiva / Suspeita de IAM',
    description: 'Dor em aperto no peito, irradiação para braço/mandíbula, sudorese.',
    color: 'orange',
    category: 'cardiovascular'
  },
  {
    id: 'deficit_neurologico_subito',
    label: 'Déficit Neurológico Súdito / Suspeita de AVC',
    description: 'Assimetria facial, perda de força unilateral, aphasia/dificuldade na fala.',
    color: 'orange',
    category: 'neurologico'
  },
  {
    id: 'cefaleia_explosiva_subita',
    label: 'Cefaleia de Início Súdito e Violento',
    description: 'Dor de cabeça súbita descrita como "a pior da vida".',
    color: 'orange',
    category: 'neurologico'
  },
  {
    id: 'hemorragia_moderada',
    label: 'Hemorragia Incontrolada Ativa',
    description: 'Sangramento expressivo que não cessa com compressão simples.',
    color: 'orange',
    category: 'trauma'
  },
  {
    id: 'queimadura_grave_face_vias',
    label: 'Queimadura Extensa ou Inalatória',
    description: 'Queimaduras em face, pescoço ou > 15% do corpo.',
    color: 'orange',
    category: 'trauma'
  },
  {
    id: 'dor_severa_isquemia',
    label: 'Dor Severa Inconsolável (Escala 8-10)',
    description: 'Dor aguda de intensidade extrema sem alívio.',
    color: 'orange',
    category: 'dor'
  },
  {
    id: 'hipoglicemia_sintomatica',
    label: 'Hipoglicemia com Sintomas Neurológicos',
    description: 'Glicemia capilar < 60 mg/dL com sudorese ou confusão.',
    color: 'orange',
    category: 'outros'
  },

  // YELLOW (Urgente - 60 min)
  {
    id: 'febre_alta_com_calafrios',
    label: 'Febre Alta (≥ 39.0°C) com Calafrios ou Prostração',
    description: 'Febre elevada persistente sem sinais de choque.',
    color: 'yellow',
    category: 'infecao'
  },
  {
    id: 'dor_abdominal_moderada',
    label: 'Dor Abdominal Moderada / Persistente',
    description: 'Desconforto abdominal contínuo com vômitos ou defesa.',
    color: 'yellow',
    category: 'dor'
  },
  {
    id: 'hipertensao_sintomatica',
    label: 'Crise Hipertensiva Sintomática (PAS ≥ 180)',
    description: 'Pressão alta acompanhada de tontura ou mal-estar leve.',
    color: 'yellow',
    category: 'cardiovascular'
  },
  {
    id: 'trauma_moderado_deformidade',
    label: 'Trauma de Extremidade com Suspeita de Fratura',
    description: 'Deformidade visível ou incapacidade funcional sem dor extrema.',
    color: 'yellow',
    category: 'trauma'
  },
  {
    id: 'vomito_persistente_desidratacao',
    label: 'Vômitos / Diarreia Persistentes',
    description: 'Incapacidade de reter líquidos, sinais de desidratação leve.',
    color: 'yellow',
    category: 'outros'
  },
  {
    id: 'dor_moderada_escala',
    label: 'Dor Moderada (Escala 4-7)',
    description: 'Dor tolerável que incomoda e limita atividades.',
    color: 'yellow',
    category: 'dor'
  },

  // GREEN (Pouco Urgente - 120 min)
  {
    id: 'sintoma_respiratorio_leve',
    label: 'Sintomas Gripais / Coriza / Tosse Leve',
    description: 'Tosse, dor de garganta, sem dispneia ou febre alta.',
    color: 'green',
    category: 'respiratorio'
  },
  {
    id: 'pequeno_ferimento_superficial',
    label: 'Pequenos Ferimentos / Escoriações',
    description: 'Cortes superficiais sem sangramento ativo importante.',
    color: 'green',
    category: 'trauma'
  },
  {
    id: 'dor_leve_escala',
    label: 'Dor Leve (Escala 1-3)',
    description: 'Desconforto leve e localizado.',
    color: 'green',
    category: 'dor'
  },
  {
    id: 'rash_cutaneo_sem_febre',
    label: 'Lesões de Pele / Rash Alérgico Leve',
    description: 'Coceira ou placas vermelhas sem comprometimento respiratório.',
    color: 'green',
    category: 'outros'
  },

  // BLUE (Não Urgente - 240 min)
  {
    id: 'renovacao_receita',
    label: 'Renovação de Receita / Atestado / Troca de Sonda',
    description: 'Procedimentos administrativos e prescrições de uso contínuo.',
    color: 'blue',
    category: 'outros'
  },
  {
    id: 'queixa_cronica_sem_alteracao',
    label: 'Dor ou Condição Crônica sem Mudança Recente',
    description: 'Sintomas presentes há semanas ou meses sem exacerbação aguda.',
    color: 'blue',
    category: 'dor'
  }
];

export interface EvaluationResult {
  color: ManchesterColor;
  priorityLevel: 1 | 2 | 3 | 4 | 5;
  maxWaitMinutes: number;
  reasons: string[];
  justification: string;
}

export function evaluateManchesterPriority(
  vitals: VitalSigns,
  questionnaire: TriageQuestionnaire
): EvaluationResult {
  const reasons: { color: ManchesterColor; priority: number; text: string }[] = [];

  // 1. EVALUATE CONSCIOUSNESS & GLASGOW
  if (vitals.consciousnessLevel === 'inconsciente' || (vitals.glasgowScale && vitals.glasgowScale <= 8)) {
    reasons.push({ color: 'red', priority: 1, text: 'Inconsciência ou Rebaixamento do Nível de Consciência (Glasgow ≤ 8)' });
  } else if (vitals.consciousnessLevel === 'dor' || vitals.consciousnessLevel === 'verbal' || (vitals.glasgowScale && vitals.glasgowScale <= 13)) {
    reasons.push({ color: 'orange', priority: 2, text: 'Alteração do Nível de Consciência (Responde apenas a dor/verbal ou Glasgow 9-13)' });
  }

  // 2. EVALUATE OXYGEN SATURATION (SpO2)
  if (vitals.oxygenSaturation > 0) {
    if (vitals.oxygenSaturation < 90) {
      reasons.push({ color: 'red', priority: 1, text: `Hipóxia Gravíssima (SpO2 ${vitals.oxygenSaturation}%)` });
    } else if (vitals.oxygenSaturation < 94) {
      reasons.push({ color: 'orange', priority: 2, text: `Saturação de Oxigênio Baixa (SpO2 ${vitals.oxygenSaturation}%)` });
    } else if (vitals.oxygenSaturation < 96) {
      reasons.push({ color: 'yellow', priority: 3, text: `Saturação Limítrofe (SpO2 ${vitals.oxygenSaturation}%)` });
    }
  }

  // 3. EVALUATE HEART RATE (FC)
  if (vitals.heartRate > 0) {
    if (vitals.heartRate > 140 || vitals.heartRate < 40) {
      reasons.push({ color: 'orange', priority: 2, text: `Frequência Cardíaca Crítica (FC ${vitals.heartRate} bpm)` });
    } else if (vitals.heartRate > 120 || vitals.heartRate < 50) {
      reasons.push({ color: 'yellow', priority: 3, text: `Taquicardia/Bradicardia Relevante (FC ${vitals.heartRate} bpm)` });
    }
  }

  // 4. EVALUATE BLOOD PRESSURE (PA)
  if (vitals.systolicBP > 0) {
    if (vitals.systolicBP < 80) {
      reasons.push({ color: 'orange', priority: 2, text: `Hipotensão Severa - Suspeita de Choque (PAS ${vitals.systolicBP} mmHg)` });
    } else if (vitals.systolicBP >= 200) {
      reasons.push({ color: 'orange', priority: 2, text: `Crise Hipertensiva Severa (PAS ${vitals.systolicBP} mmHg)` });
    } else if (vitals.systolicBP >= 180) {
      reasons.push({ color: 'yellow', priority: 3, text: `Hipertensão Significativa (PAS ${vitals.systolicBP} mmHg)` });
    }
  }

  // 5. EVALUATE TEMPERATURE
  if (vitals.temperature > 0) {
    if (vitals.temperature >= 39.5 || vitals.temperature < 35.0) {
      reasons.push({ color: 'orange', priority: 2, text: `Temperatura Crítica (${vitals.temperature}°C)` });
    } else if (vitals.temperature >= 38.5) {
      reasons.push({ color: 'yellow', priority: 3, text: `Febre Alta (${vitals.temperature}°C)` });
    } else if (vitals.temperature >= 37.8) {
      reasons.push({ color: 'green', priority: 4, text: `Estado Febril (${vitals.temperature}°C)` });
    }
  }

  // 6. EVALUATE PAIN SCALE (0-10)
  if (vitals.painScale >= 9) {
    reasons.push({ color: 'orange', priority: 2, text: `Dor Atroz / Insuportável (Escala ${vitals.painScale}/10)` });
  } else if (vitals.painScale >= 7) {
    reasons.push({ color: 'orange', priority: 2, text: `Dor Intensa (Escala ${vitals.painScale}/10)` });
  } else if (vitals.painScale >= 4) {
    reasons.push({ color: 'yellow', priority: 3, text: `Dor Moderada (Escala ${vitals.painScale}/10)` });
  } else if (vitals.painScale >= 1) {
    reasons.push({ color: 'green', priority: 4, text: `Dor Leve (Escala ${vitals.painScale}/10)` });
  }

  // 7. EVALUATE SELECTED DISCRIMINATORS
  for (const discId of questionnaire.discriminators) {
    const discDef = DISCRIMINATOR_LIST.find(d => d.id === discId);
    if (discDef) {
      const priorityMap: Record<ManchesterColor, number> = { red: 1, orange: 2, yellow: 3, green: 4, blue: 5 };
      reasons.push({
        color: discDef.color,
        priority: priorityMap[discDef.color],
        text: `Discriminador Clínico: ${discDef.label}`
      });
    }
  }

  // 8. DEFAULT FALLBACK
  if (reasons.length === 0) {
    reasons.push({
      color: 'blue',
      priority: 5,
      text: 'Sem discriminadores graves ou alterações significativas de sinais vitais identificadas.'
    });
  }

  // DETERMINE HIGHEST PRIORITY (lowest priority number 1..5)
  reasons.sort((a, b) => a.priority - b.priority);
  const highest = reasons[0];

  const color = highest.color;
  const config = MANCHESTER_RULES[color];
  const priorityLevel = highest.priority as 1 | 2 | 3 | 4 | 5;

  const topReasonsList = reasons
    .filter(r => r.color === color)
    .map(r => r.text);

  const justification = `Classificação automatizada em **${config.label.toUpperCase()} (${config.category})** - Prioridade ${priorityLevel}. ` +
    `Tempo máximo para atendimento: ${config.maxWaitMinutes} minutos. ` +
    `Fatores determinantes: ${topReasonsList.join('; ')}.`;

  return {
    color,
    priorityLevel,
    maxWaitMinutes: config.maxWaitMinutes,
    reasons: reasons.map(r => r.text),
    justification
  };
}

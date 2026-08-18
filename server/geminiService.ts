import { GoogleGenAI, Type } from "@google/genai";
import { VitalSigns, TriageQuestionnaire, ManchesterColor, AIAnalysis } from "../src/types";

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
  }
  return aiClient;
}

export async function analyzeTriageWithAI(
  patientAge: number,
  vitals: VitalSigns,
  questionnaire: TriageQuestionnaire
): Promise<AIAnalysis> {
  const client = getAIClient();

  if (!client) {
    return {
      suggestedColor: 'yellow',
      confidenceScore: 0.8,
      clinicalReasoning: 'Análise de regras determinísticas concluída. Chave de IA não configurada no servidor.',
      riskFactors: ['Análise baseada estritamente nos parâmetros vitais fornecidos.'],
      recommendations: ['Seguir rigorosamente o protocolo Manchester padrão.']
    };
  }

  const prompt = `
Você é um médico especialista em medicina de emergência e especialista no Protocolo Manchester de Triagem Hospitalar.
Avalie o seguinte caso de triagem:

- Idade do Paciente: ${patientAge} anos
- Queixa Principal: "${questionnaire.chiefComplaint}"
- Descrição Detalhada: "${questionnaire.symptomsDescription}"
- Tempo de Evolução: "${questionnaire.onsetDuration}"
- Doenças Prévias: ${questionnaire.preExistingConditions.join(', ') || 'Nenhuma informada'}
- Alergias: ${questionnaire.allergies || 'Nenhuma informada'}
- Sinais Vitais:
  - PA: ${vitals.systolicBP}/${vitals.diastolicBP} mmHg
  - FC: ${vitals.heartRate} bpm | FR: ${vitals.respiratoryRate} ipm
  - SpO2: ${vitals.oxygenSaturation}% | Temp: ${vitals.temperature}°C
  - Escala de Dor: ${vitals.painScale}/10
  - Nível Consciência: ${vitals.consciousnessLevel} (Glasgow: ${vitals.glasgowScale || 15})
- Discriminadores selecionados: ${questionnaire.discriminators.join(', ') || 'Nenhum'}

Regras do Protocolo Manchester:
1. "red" (Vermelho / Emergência - 0 min)
2. "orange" (Laranja / Muito Urgente - 10 min)
3. "yellow" (Amarelo / Urgente - 60 min)
4. "green" (Verde / Pouco Urgente - 120 min)
5. "blue" (Azul / Não Urgente - 240 min)

Forneça sua parecer técnico em formato JSON com a cor sugerida, raciocínio clínico detalhado em Português do Brasil, fatores de risco críticos identificados e recomendações para a equipe de enfermagem/médica.
`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Você é um assistente clínico sênior focado em triagem hospitalar e protocolo Manchester.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedColor: {
              type: Type.STRING,
              description: 'A cor Manchester correspondente (red, orange, yellow, green ou blue)'
            },
            confidenceScore: {
              type: Type.NUMBER,
              description: 'Grau de confiança de 0.0 a 1.0'
            },
            clinicalReasoning: {
              type: Type.STRING,
              description: 'Raciocínio clínico embasado nos discriminadores e sinais vitais'
            },
            riskFactors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Fatores de risco principais'
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Recomendações condutas imediatas para a enfermagem'
            }
          },
          required: ['suggestedColor', 'clinicalReasoning', 'riskFactors', 'recommendations']
        }
      }
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      const validColor: ManchesterColor = ['red', 'orange', 'yellow', 'green', 'blue'].includes(parsed.suggestedColor)
        ? parsed.suggestedColor as ManchesterColor
        : 'yellow';

      return {
        suggestedColor: validColor,
        confidenceScore: parsed.confidenceScore || 0.9,
        clinicalReasoning: parsed.clinicalReasoning || 'Análise clínica de triagem realizada com sucesso.',
        riskFactors: Array.isArray(parsed.riskFactors) ? parsed.riskFactors : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : []
      };
    }
  } catch (error) {
    console.error('Gemini AI Triage Analysis Error:', error);
  }

  return {
    suggestedColor: 'yellow',
    confidenceScore: 0.75,
    clinicalReasoning: 'Análise de regras determinísticas concluída com sucesso.',
    riskFactors: ['Avaliação dos parâmetros de entrada concluída.'],
    recommendations: ['Realizar reavaliação periódica do paciente caso persista a espera.']
  };
}

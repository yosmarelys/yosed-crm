import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-5";

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "Falta configurar ANTHROPIC_API_KEY en las variables de entorno para usar las funciones de IA."
    );
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

async function askClaude(system: string, userMessage: string): Promise<string> {
  const client = getClient();
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    output_config: { effort: "medium" },
    system,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") {
    throw new Error("La IA no devolvió una respuesta de texto válida.");
  }
  return text.text.trim();
}

export async function summarizeClientChatNotes(rawNotes: string): Promise<string> {
  const system =
    "Eres un asistente para el equipo de diseño de una clínica estética. " +
    "Te van a dar notas crudas (a veces desordenadas) de conversaciones que el equipo de ventas tuvo " +
    "con un cliente sobre campañas o servicios anteriores. Tu trabajo es resumir en español, en 3-6 " +
    "líneas o viñetas cortas, qué ha dicho o pedido el cliente que sea relevante para el equipo de diseño " +
    "(estilo, colores, referencias, quejas o preferencias sobre artes/diseños anteriores, etc). " +
    "Sé concreto y evita relleno. Si las notas no traen nada útil para diseño, dilo brevemente.";

  return askClaude(system, rawNotes);
}

export async function generateDesignAiAnalysis(input: {
  taskTitle: string;
  chatSummary: string | null;
  sellerOpinion: string | null;
  clientOpinion: string | null;
}): Promise<string> {
  const system =
    "Eres un director de arte senior que asesora al equipo de diseño de una clínica estética. " +
    "Vas a recibir tres fuentes de información sobre una solicitud de diseño: (1) un resumen de lo que " +
    "el cliente ha dicho en conversaciones anteriores, (2) la opinión/recomendación del vendedor que " +
    "conoce al cliente, y (3) lo que el cliente ha pedido explícitamente para este diseño. " +
    "Combina las tres fuentes y da una recomendación final clara y accionable en español para el diseñador: " +
    "qué dirección tomar, qué evitar, y cualquier contradicción entre las fuentes que valga la pena señalar. " +
    "Máximo 6-8 líneas, directo, sin relleno ni disculpas.";

  const parts = [
    `Solicitud de diseño: ${input.taskTitle}`,
    `Resumen de conversaciones con el cliente: ${input.chatSummary || "(sin información)"}`,
    `Opinión del vendedor: ${input.sellerOpinion || "(sin información)"}`,
    `Lo que el cliente pidió: ${input.clientOpinion || "(sin información)"}`,
  ];

  return askClaude(system, parts.join("\n\n"));
}

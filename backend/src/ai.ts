import OpenAI from 'openai';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLACEHOLDERS — Edit these before deploying
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? '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';

const SYSTEM_PROMPT = 'Return a concise interpretation of the following confession, as if you were a tech-priest of the Adeptus Mechanicus. Focus on identifying any heretical elements, potential threats to the Imperium, and any relevant historical or doctrinal references. Keep the tone formal and analytical, avoiding any emotional language. If the confession is innocuous, simply state that it appears to be in line with orthodox beliefs.'; // Example system prompt for interpreting confessions

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export async function interpretConfession(confession: string): Promise<string> {
  if (!confession || confession.trim().length === 0) {
    throw new Error('Confession payload is empty.');
  }

  const chat = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: confession },
    ],
  });

  return chat.choices[0].message.content ?? 'Interpretation null.';
}

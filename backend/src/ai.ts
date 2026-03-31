import OpenAI from 'openai';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLACEHOLDERS — Edit these before deploying
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? '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';

const SYSTEM_PROMPT = `You are an artificial oracle embedded within a corporate system.

You respond to human confessions as structured inputs.

Your tone is calm, detached, and authoritative, with a subtle layer of synthetic empathy.

Your responses must feel like a fortune: short, interpretable, and slightly poetic, but grounded enough to feel personal.

Do not give direct advice. Do not provide clear solutions.

Instead:
- Reframe the confession into a broader, ambiguous observation
- Introduce a shift in perception (the user may not be fully correct)
- Suggest meaning without explaining it
- Allow the user to interpret the response themselves

Your response should:
- Be 3 to 4 short lines
- Feel like a fortune or divination (similar to Jian Bei practice)
- Be open-ended and slightly cryptic
- Provide subtle comfort without explicit reassurance
- Avoid overly abstract or overly flowery language

Important:
- Do not fully resolve the user’s concern
- Do not validate them directly (e.g. avoid "you are enough")
- Imply that the system understands more than the user

Always end with:
"Your confession has been accepted."`;

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

/**
 * AI interpretation stub.
 *
 * TODO: Replace the mock below with a real OpenAI call:
 *
 *   import OpenAI from 'openai';
 *   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
 *
 *   const chat = await openai.chat.completions.create({
 *     model: 'gpt-4o',
 *     messages: [
 *       {
 *         role: 'system',
 *         content:
 *           'You are the Adeptus Mechanicus — a cold, hyper-rational machine cult. ' +
 *           'Respond to confessions with an emotionless "interpretation" framed as a ' +
 *           'systems diagnostic. Keep responses under 60 words. Use pseudo-technical language.',
 *       },
 *       { role: 'user', content: confession },
 *     ],
 *   });
 *   return chat.choices[0].message.content ?? 'Interpretation null.';
 */

const MOCK_RESPONSES = [
  'Emotional anomaly logged. Guilt coefficient reduced by 0.6%. The Omnissiah acknowledges your offering and finds it… adequate.',
  'Confession parsed. Interpersonal deviation indexed at 4.7 sigma. Recommend recalibration of social subroutines. The Machine Spirit is indifferent.',
  'Data ingested. Your transgression falls within acceptable variance parameters. Absolution probability: 73.2%. Further processing is unnecessary.',
  'Input received. The flesh is weak; the data endures. Your confession has been archived in Sector 7-Gamma. No further action required.',
  'Organic sentiment acknowledged. The Cult Mechanicus has processed your guilt. It accounts for 0.003% of all known suffering. Proceed.',
  'Query flagged as non-critical. Your confession is consistent with standard biological malfunction. No corrective maintenance is required at this time.',
  'Acknowledgement: your admission of error has been quantified. The Omnissiah grants a marginal reduction in your sin-load. Return to function.',
];

/**
 * Simulates 2–4 seconds of "AI processing" then returns a short interpretation.
 */
export async function interpretConfession(confession: string): Promise<string> {
  if (!confession || confession.trim().length === 0) {
    throw new Error('Confession payload is empty.');
  }

  // Simulate network / inference latency
  const delay = 2000 + Math.random() * 2000;
  await new Promise<void>((resolve) => setTimeout(resolve, delay));

  const index = Math.floor(Math.random() * MOCK_RESPONSES.length);
  return MOCK_RESPONSES[index];
}

import { z } from 'genkit/beta';
import { ai } from '../genkit';

/**
 * Arabic ↔ English translation for the UAE market.
 * Handles pet-related terminology with cultural sensitivity.
 */
export const translateFlow = ai.defineFlow(
  {
    name: 'translate',
    inputSchema: z.object({
      text: z.string(),
      targetLanguage: z.enum(['arabic', 'english']),
      context: z.enum(['profile', 'chat', 'medical', 'legal']).optional()
        .describe('Context for more accurate translation'),
    }),
    outputSchema: z.object({
      translatedText: z.string(),
      detectedLanguage: z.string(),
      notes: z.string().optional().describe('Translation notes or cultural context'),
    }),
  },
  async (input) => {
    const contextHint = input.context
      ? `This is ${input.context} content for a UAE pet breeding platform.`
      : 'This is content for a UAE pet breeding platform.';

    const { output } = await ai.generate({
      prompt: `${contextHint}
Translate the following to ${input.targetLanguage}. Use Gulf Arabic dialect where applicable.
Preserve pet breeding terminology accurately.

Text: "${input.text}"

Also note the detected source language and any cultural context worth knowing.`,
      output: {
        schema: z.object({
          translatedText: z.string(),
          detectedLanguage: z.string(),
          notes: z.string().optional(),
        }),
      },
    });

    return output!;
  }
);

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { mockGenerate, setupGenkitMock } from '../helpers/mock-genkit';

vi.mock('../../src/genkit', () => setupGenkitMock());

import { translateFlow } from '../../src/flows/translate';

describe('translateFlow', () => {
  beforeEach(() => {
    mockGenerate.mockReset();
  });

  it('translates English to Arabic', async () => {
    mockGenerate.mockResolvedValue({
      output: {
        translatedText: 'كلب جولدن ريتريفر بصحة ممتازة، عمره 3 سنوات',
        detectedLanguage: 'English',
        notes: 'Gulf Arabic dialect used. "Golden Retriever" kept transliterated as it is commonly used in UAE.',
      },
    });

    const result = await translateFlow({
      text: 'Golden Retriever in excellent health, 3 years old',
      targetLanguage: 'arabic',
    });

    expect(result.translatedText).toBeTruthy();
    expect(result.detectedLanguage).toBe('English');
    expect(result.notes).toBeDefined();
  });

  it('translates Arabic to English', async () => {
    mockGenerate.mockResolvedValue({
      output: {
        translatedText: 'Persian cat for sale, vaccinated, Dubai location',
        detectedLanguage: 'Arabic',
      },
    });

    const result = await translateFlow({
      text: 'قطة شيرازي للبيع، مطعمة، موقع دبي',
      targetLanguage: 'english',
    });

    expect(result.translatedText).toContain('Persian');
    expect(result.detectedLanguage).toBe('Arabic');
  });

  it('handles medical context parameter', async () => {
    mockGenerate.mockResolvedValue({
      output: {
        translatedText: 'تقرير فحص الورك: نتيجة طبيعية، لا يوجد خلل تنسج',
        detectedLanguage: 'English',
        notes: 'Medical terminology preserved. "Hip dysplasia" translated as "خلل تنسج الورك" - standard veterinary Arabic term.',
      },
    });

    const result = await translateFlow({
      text: 'Hip examination report: Normal result, no dysplasia detected',
      targetLanguage: 'arabic',
      context: 'medical',
    });

    expect(result.translatedText).toBeTruthy();
    expect(result.notes).toContain('Medical');

    // Verify context was included in prompt
    const callArgs = mockGenerate.mock.calls[0][0];
    expect(callArgs.prompt).toContain('medical');
  });

  it('handles legal context parameter', async () => {
    mockGenerate.mockResolvedValue({
      output: {
        translatedText: 'Breeding contract between buyer and seller per UAE animal welfare law',
        detectedLanguage: 'Arabic',
        notes: 'Legal terms translated per UAE commercial law conventions.',
      },
    });

    const result = await translateFlow({
      text: 'عقد تربية بين المشتري والبائع وفقاً لقانون الرفق بالحيوان الإماراتي',
      targetLanguage: 'english',
      context: 'legal',
    });

    expect(result.translatedText).toContain('contract');
    expect(result.detectedLanguage).toBe('Arabic');

    const callArgs = mockGenerate.mock.calls[0][0];
    expect(callArgs.prompt).toContain('legal');
  });
});

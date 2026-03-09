import { vi, describe, it, expect, beforeEach } from 'vitest';
import { mockGenerate, setupGenkitMock } from '../helpers/mock-genkit';

vi.mock('../../src/genkit', () => setupGenkitMock());

import { vetDocumentOCRFlow } from '../../src/flows/vet-document-ocr';

const mockLabReport = {
  documentType: 'lab_report' as const,
  clinicName: 'Modern Vet - Jumeirah',
  date: '2026-02-15',
  veterinarian: 'Dr. Sarah Ahmed',
  labResults: [
    { test: 'CBC', value: '12.5', unit: 'x10^9/L', referenceRange: '5.5-16.9', flag: 'normal' as const },
    { test: 'ALT', value: '85', unit: 'U/L', referenceRange: '10-125', flag: 'normal' as const },
  ],
  rawText: 'Modern Vet Jumeirah\nLab Report\nDate: 2026-02-15\n...',
};

const mockPrescription = {
  documentType: 'prescription' as const,
  clinicName: 'Dubai Vet Clinic',
  date: '2026-03-01',
  veterinarian: 'Dr. Khalid',
  medications: [
    { name: 'Amoxicillin', dosage: '250mg', frequency: 'Twice daily', duration: '7 days', instructions: 'Give with food' },
  ],
  rawText: 'Dubai Vet Clinic\nPrescription\nDate: 2026-03-01\n...',
};

const mockVaccination = {
  documentType: 'vaccination' as const,
  clinicName: 'Abu Dhabi Pet Hospital',
  date: '2026-01-10',
  veterinarian: 'Dr. Fatima',
  vaccinations: [
    { vaccine: 'Rabies', dateAdministered: '2026-01-10', nextDue: '2027-01-10', batchNumber: 'RAB-2026-001' },
    { vaccine: 'DHPP', dateAdministered: '2026-01-10', nextDue: '2027-01-10' },
  ],
  microchipNumber: '985121012345678',
  rawText: 'Abu Dhabi Pet Hospital\nVaccination Certificate\nDate: 2026-01-10\n...',
};

describe('vetDocumentOCRFlow', () => {
  beforeEach(() => {
    mockGenerate.mockReset();
  });

  it('returns valid lab report structure', async () => {
    mockGenerate.mockResolvedValue({ output: mockLabReport });

    const result = await vetDocumentOCRFlow({
      imageUrl: 'data:image/png;base64,lab123',
      documentType: 'lab_report',
    });

    expect(result).toBeDefined();
    expect(result.documentType).toBe('lab_report');
    expect(result.labResults).toBeInstanceOf(Array);
    expect(result.labResults!.length).toBeGreaterThan(0);
    for (const lr of result.labResults!) {
      expect(lr.test).toBeTruthy();
      expect(lr.value).toBeTruthy();
      expect(lr.unit).toBeTruthy();
      expect(['normal', 'high', 'low', 'critical']).toContain(lr.flag);
    }
  });

  it('returns valid prescription structure', async () => {
    mockGenerate.mockResolvedValue({ output: mockPrescription });

    const result = await vetDocumentOCRFlow({
      imageUrl: 'data:image/png;base64,rx123',
      documentType: 'prescription',
    });

    expect(result).toBeDefined();
    expect(result.documentType).toBe('prescription');
    expect(result.medications).toBeInstanceOf(Array);
    expect(result.medications!.length).toBeGreaterThan(0);
    for (const med of result.medications!) {
      expect(med.name).toBeTruthy();
      expect(med.dosage).toBeTruthy();
      expect(med.frequency).toBeTruthy();
      expect(med.duration).toBeTruthy();
    }
  });

  it('returns valid vaccination structure', async () => {
    mockGenerate.mockResolvedValue({ output: mockVaccination });

    const result = await vetDocumentOCRFlow({
      imageUrl: 'data:image/png;base64,vax123',
      documentType: 'vaccination',
    });

    expect(result).toBeDefined();
    expect(result.documentType).toBe('vaccination');
    expect(result.vaccinations).toBeInstanceOf(Array);
    expect(result.vaccinations!.length).toBeGreaterThan(0);
    for (const vax of result.vaccinations!) {
      expect(vax.vaccine).toBeTruthy();
      expect(vax.dateAdministered).toBeTruthy();
    }
    expect(result.microchipNumber).toBeTruthy();
  });

  it('always includes rawText', async () => {
    mockGenerate.mockResolvedValue({ output: mockLabReport });

    const result = await vetDocumentOCRFlow({
      imageUrl: 'data:image/png;base64,lab123',
      documentType: 'lab_report',
    });

    expect(result.rawText).toBeTruthy();
    expect(typeof result.rawText).toBe('string');
    expect(result.rawText.length).toBeGreaterThan(0);
  });

  it('document type in output matches input', async () => {
    mockGenerate.mockResolvedValue({ output: mockPrescription });

    const result = await vetDocumentOCRFlow({
      imageUrl: 'data:image/png;base64,rx123',
      documentType: 'prescription',
    });

    expect(result.documentType).toBe('prescription');
  });
});

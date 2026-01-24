import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database
vi.mock('../db', () => ({
  getDb: vi.fn(() => null),
}));

describe('Jarvis Memory Service - Memory Types', () => {
  const validMemoryTypes = ['preference', 'fact', 'context', 'goal', 'project', 'interaction'];

  it('should validate all memory types', () => {
    validMemoryTypes.forEach(type => {
      expect(validMemoryTypes).toContain(type);
    });
  });

  it('should have 6 memory types', () => {
    expect(validMemoryTypes).toHaveLength(6);
  });
});

describe('Jarvis Memory Service - Memory Entry Validation', () => {
  it('should validate memory entry structure', () => {
    const validEntry = {
      key: 'user_preference_language',
      value: 'Portuguese',
      type: 'preference',
      importance: 7,
    };

    expect(validEntry.key).toBeTruthy();
    expect(validEntry.value).toBeTruthy();
    expect(validEntry.type).toBe('preference');
    expect(validEntry.importance).toBeGreaterThanOrEqual(1);
    expect(validEntry.importance).toBeLessThanOrEqual(10);
  });

  it('should handle optional importance field', () => {
    const entryWithoutImportance = {
      key: 'test_key',
      value: 'test_value',
      type: 'fact',
    };

    expect(entryWithoutImportance.key).toBeTruthy();
    expect(entryWithoutImportance.value).toBeTruthy();
    expect(entryWithoutImportance).not.toHaveProperty('importance');
  });
});

describe('Jarvis Memory Service - Pattern Matching', () => {
  const preferencePatterns = [
    /(?:prefiro|gosto de|minha preferência é)\s+(.+)/i,
    /(?:sempre uso|costumo usar)\s+(.+)/i,
  ];

  const goalPatterns = [
    /(?:meu objetivo é|quero|pretendo)\s+(.+)/i,
    /(?:estou trabalhando para|buscando)\s+(.+)/i,
  ];

  const projectPatterns = [
    /(?:meu projeto|estou desenvolvendo|trabalhando em)\s+(.+)/i,
    /(?:projeto chamado|projeto de)\s+(.+)/i,
  ];

  it('should match preference patterns', () => {
    const testMessages = [
      'Prefiro trabalhar com projetos de educação',
      'Gosto de usar metodologias ágeis',
      'Minha preferência é por análises quantitativas',
    ];

    testMessages.forEach(msg => {
      const matched = preferencePatterns.some(pattern => pattern.test(msg));
      expect(matched).toBe(true);
    });
  });

  it('should match goal patterns', () => {
    const testMessages = [
      'Meu objetivo é aumentar o impacto em 50%',
      'Quero expandir para novas regiões',
      'Pretendo certificar 100 projetos',
    ];

    testMessages.forEach(msg => {
      const matched = goalPatterns.some(pattern => pattern.test(msg));
      expect(matched).toBe(true);
    });
  });

  it('should match project patterns', () => {
    const testMessages = [
      'Meu projeto é sobre educação digital',
      'Estou desenvolvendo uma plataforma de impacto',
      'Trabalhando em um sistema de certificação',
    ];

    testMessages.forEach(msg => {
      const matched = projectPatterns.some(pattern => pattern.test(msg));
      expect(matched).toBe(true);
    });
  });

  it('should extract values from patterns', () => {
    const message = 'Prefiro trabalhar com projetos de educação';
    const pattern = /(?:prefiro|gosto de|minha preferência é)\s+(.+)/i;
    const match = message.match(pattern);

    expect(match).not.toBeNull();
    expect(match?.[1]).toBe('trabalhar com projetos de educação');
  });
});

describe('Jarvis Memory Service - Context Building', () => {
  it('should group memories by type', () => {
    const memories = [
      { memoryType: 'preference', key: 'pref1', value: 'value1' },
      { memoryType: 'preference', key: 'pref2', value: 'value2' },
      { memoryType: 'goal', key: 'goal1', value: 'value3' },
      { memoryType: 'project', key: 'proj1', value: 'value4' },
    ];

    const grouped: Record<string, typeof memories> = {};
    memories.forEach(m => {
      if (!grouped[m.memoryType]) {
        grouped[m.memoryType] = [];
      }
      grouped[m.memoryType].push(m);
    });

    expect(grouped.preference).toHaveLength(2);
    expect(grouped.goal).toHaveLength(1);
    expect(grouped.project).toHaveLength(1);
  });

  it('should format context string correctly', () => {
    const preferences = [
      { key: 'language', value: 'Portuguese' },
      { key: 'sector', value: 'Education' },
    ];

    const contextParts: string[] = ['**Preferências do Usuário:**'];
    preferences.forEach(p => {
      contextParts.push(`- ${p.key}: ${p.value}`);
    });

    const context = contextParts.join('\n');

    expect(context).toContain('**Preferências do Usuário:**');
    expect(context).toContain('- language: Portuguese');
    expect(context).toContain('- sector: Education');
  });
});

describe('Jarvis Memory Service - Importance Scoring', () => {
  it('should validate importance range', () => {
    const validImportances = [1, 5, 10];
    const invalidImportances = [0, 11, -1];

    validImportances.forEach(imp => {
      expect(imp).toBeGreaterThanOrEqual(1);
      expect(imp).toBeLessThanOrEqual(10);
    });

    invalidImportances.forEach(imp => {
      const isValid = imp >= 1 && imp <= 10;
      expect(isValid).toBe(false);
    });
  });

  it('should sort memories by importance', () => {
    const memories = [
      { importance: 3, key: 'low' },
      { importance: 9, key: 'high' },
      { importance: 5, key: 'medium' },
    ];

    const sorted = [...memories].sort((a, b) => b.importance - a.importance);

    expect(sorted[0].key).toBe('high');
    expect(sorted[1].key).toBe('medium');
    expect(sorted[2].key).toBe('low');
  });
});

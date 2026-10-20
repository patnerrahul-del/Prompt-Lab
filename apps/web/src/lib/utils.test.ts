import { describe, it, expect } from 'vitest';
import { extractVariables, interpolatePrompt, formatINR } from './utils';

describe('Utility Functions', () => {
  it('formats currency in Indian Rupees (INR) correctly', () => {
    const formatted = formatINR(1499);
    expect(formatted).toContain('1,499');
    expect(formatted).toContain('₹');
  });

  it('extracts unique {{variable}} tokens from prompt strings', () => {
    const prompt = 'A cinematic {{lighting}} portrait of {{subject}}, ultra-detailed, {{lighting}} mood';
    const variables = extractVariables(prompt);
    expect(variables).toEqual(['lighting', 'subject']);
  });

  it('interpolates variables properly into prompt text', () => {
    const template = 'Photograph of a {{character}} in {{setting}} with {{camera}} lens';
    const values = {
      character: 'cyberpunk samurai',
      setting: 'Neo Tokyo rainfall',
      camera: '85mm f/1.2',
    };
    const result = interpolatePrompt(template, values);
    expect(result).toBe('Photograph of a cyberpunk samurai in Neo Tokyo rainfall with 85mm f/1.2 lens');
  });

  it('keeps placeholders intact if variables are missing', () => {
    const template = 'Portrait of {{name}}, {{style}}';
    const values = { name: 'Elizabeth' };
    const result = interpolatePrompt(template, values);
    expect(result).toBe('Portrait of Elizabeth, {{style}}');
  });
});

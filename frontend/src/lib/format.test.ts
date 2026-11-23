import { formatarData, formatarDataHora } from './format';

describe('format', () => {
  it('formata datas em pt-BR', () => {
    expect(formatarData('2026-11-23T10:00:00')).toBe('23/11/2026');
    expect(formatarDataHora('2026-11-23T10:05:00')).toMatch(/23\/11\/2026.*10:05/);
  });

  it('usa travessão para valores ausentes', () => {
    expect(formatarData(null)).toBe('—');
    expect(formatarDataHora(undefined)).toBe('—');
  });
});

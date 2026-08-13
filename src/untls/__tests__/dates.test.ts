import { describe, expect, it, vi } from 'vitest';
import { formattedDate } from '../dates';

describe('formattedDate', () => {
  const now = new Date('2026-08-11T10:00:00Z');

  it('Должен возвращать "Только что" для дат в течение последней минуты', () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const date = new Date(now.getTime() - 30000);
    expect(formattedDate(date)).toBe('Только что');

    const date2 = new Date(now.getTime() - 59000);
    expect(formattedDate(date2)).toBe('Только что');

    vi.useRealTimers();
  });

  it('Должен возвращать минуты для дат в течение последнего часа', () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const date = new Date(now.getTime() - 2 * 60000);
    expect(formattedDate(date)).toBe('2m');

    const date2 = new Date(now.getTime() - 30 * 60000);
    expect(formattedDate(date2)).toBe('30m');

    const date3 = new Date(now.getTime() - 59 * 60000);
    expect(formattedDate(date3)).toBe('59m');

    vi.useRealTimers();
  });

  it('Должен возвращать часы для дат в течение последнего дня', () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const date = new Date(now.getTime() - 2 * 3600000);
    expect(formattedDate(date)).toBe('2h');

    const date2 = new Date(now.getTime() - 12 * 3600000);
    expect(formattedDate(date2)).toBe('12h');

    const date3 = new Date(now.getTime() - 23 * 3600000);
    expect(formattedDate(date3)).toBe('23h');

    vi.useRealTimers();
  });

  it('Должен возвращать день недели для дат в течение последней недели', () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const fixedNow = new Date('2026-08-13T10:00:00Z');
    vi.setSystemTime(fixedNow);

    const date = new Date(fixedNow.getTime() - 2 * 86400000);
    expect(formattedDate(date)).toBe('вт');

    const date2 = new Date(fixedNow.getTime() - 4 * 86400000);
    expect(formattedDate(date2)).toBe('вс');

    const date3 = new Date(fixedNow.getTime() - 6 * 86400000);
    expect(formattedDate(date3)).toBe('пт');

    vi.useRealTimers();
  });

  it('Должен возвращать месяц и день для дат старше недели', () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const date = new Date(now.getTime() - 8 * 86400000);
    expect(formattedDate(date)).toBe('5 авг.');

    const date2 = new Date(now.getTime() - 30 * 86400000);
    expect(formattedDate(date2)).toBe('14 июл.');

    vi.useRealTimers();
  });

  it('должен обрабатывать строковые даты', () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const dateString = new Date(now.getTime() - 5 * 60000).toISOString();
    expect(formattedDate(dateString)).toBe('5m');

    vi.useRealTimers();
  });

  it('Должен обрабатывать граничные случаи', () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const date1 = new Date(now.getTime() - 60000);
    expect(formattedDate(date1)).toBe('1m');

    const date2 = new Date(now.getTime() - 3600000);
    expect(formattedDate(date2)).toBe('1h');

    const date3 = new Date(now.getTime() - 86400000);
    expect(formattedDate(date3)).toBe('ср');

    const date4 = new Date(now.getTime() - 604800000);
    expect(formattedDate(date4)).toBe('6 авг.');

    vi.useRealTimers();
  });

  it('Должен корректно обрабатывать невалидные даты', () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const invalidDate = 'invalid-date';
    expect(() => formattedDate(invalidDate)).not.toThrow();
    expect(formattedDate(invalidDate)).toBe('Invalid Date');

    vi.useRealTimers();
  });
});
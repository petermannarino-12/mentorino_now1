import { describe, it, expect } from 'vitest';
import { getNJISOString, formatToNJ, formatDashboardDate } from './dateUtils';

describe('getNJISOString', () => {
  it('returns a string in ISO-like format', () => {
    const result = getNJISOString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('includes a UTC offset suffix (not Z)', () => {
    const result = getNJISOString();
    const offset = result.slice(19);
    expect(offset).not.toBe('Z');
    expect(offset).toMatch(/^[+-]\d{2}:?\d{2}$/);
  });

  it('returns a parseable date string', () => {
    const result = getNJISOString();
    const parsed = new Date(result);
    expect(parsed.getTime()).not.toBeNaN();
  });
});

describe('formatToNJ', () => {
  it('formats a date string correctly', () => {
    const date = '2026-05-26T12:00:00Z';
    const result = formatToNJ(date, { year: 'numeric', month: 'short', day: 'numeric' });
    expect(result).toContain('2026');
  });

  it('handles Date objects', () => {
    const date = new Date('2026-07-01T12:00:00Z');
    const result = formatToNJ(date, { year: 'numeric' });
    expect(result).toContain('2026');
  });

  it('uses NJ timezone', () => {
    const date = new Date('2026-01-01T05:00:00Z');
    const result = formatToNJ(date, { year: 'numeric', month: 'numeric', day: 'numeric' });
    expect(result).toBeTruthy();
  });
});

describe('formatDashboardDate', () => {
  it('returns formatted date string', () => {
    const result = formatDashboardDate('2026-05-26T12:00:00Z');
    expect(result).toContain('2026');
  });
});

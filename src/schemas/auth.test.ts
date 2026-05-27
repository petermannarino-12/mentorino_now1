import { describe, it, expect } from 'vitest';
import { loginSchema, signUpSchema } from './auth';

describe('loginSchema', () => {
  it('accepts valid email and password', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: 'secret123' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret123' });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: '' });
    expect(result.success).toBe(false);
  });
});

describe('signUpSchema', () => {
  it('accepts valid signup data', () => {
    const result = signUpSchema.safeParse({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'securePass1',
      confirmPassword: 'securePass1',
    });
    expect(result.success).toBe(true);
  });

  it('rejects short name', () => {
    const result = signUpSchema.safeParse({
      fullName: 'J',
      email: 'john@example.com',
      password: 'securePass1',
      confirmPassword: 'securePass1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = signUpSchema.safeParse({
      fullName: 'John Doe',
      email: 'bad',
      password: 'securePass1',
      confirmPassword: 'securePass1',
    });
    expect(result.success).toBe(false);
  });
});

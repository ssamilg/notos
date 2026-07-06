import type { PostgrestError } from '@supabase/supabase-js';

export class SupabaseOperationError extends Error {
  readonly code: string | undefined;

  constructor(message: string, code: string | undefined) {
    super(message);
    this.name = 'SupabaseOperationError';
    this.code = code;
  }
}

export class DomainError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'DomainError';
    this.statusCode = statusCode;
  }
}

export function formatSupabaseError(error: PostgrestError, context: string): string {
  const parts = [context, error.message, error.code, error.details, error.hint].filter(Boolean);
  return parts.join(' | ');
}

export function isUniqueViolationCode(code: string | undefined): boolean {
  return code === '23505';
}

export function throwSupabaseError(error: PostgrestError, context: string): never {
  throw new SupabaseOperationError(formatSupabaseError(error, context), error.code);
}

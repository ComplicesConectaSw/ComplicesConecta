export type ErrorLike = { message?: string; stack?: string; name?: string };

export const isErrorLike = (x: unknown): x is ErrorLike => {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    (typeof o.message === 'string' || typeof o.message === 'undefined') &&
    (typeof o.stack === 'string' || typeof o.stack === 'undefined') &&
    (typeof o.name === 'string' || typeof o.name === 'undefined')
  );
};

export const isWalletError = (error: unknown, keywords: string[]): boolean => {
  if (!error) return false;
  if (!isErrorLike(error)) return false;
  const message = typeof error.message === 'string' ? error.message.toLowerCase() : '';
  const stack = typeof error.stack === 'string' ? error.stack.toLowerCase() : '';
  const name = typeof error.name === 'string' ? error.name.toLowerCase() : '';
  const combined = `${message} ${stack} ${name}`;
  return keywords.some(k => combined.includes(k));
};

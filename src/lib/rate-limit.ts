/**
 * Rate limiting em memória, por processo. Suficiente para uma única
 * instância (dev, e a maioria dos deploys iniciais). Em produção com
 * múltiplas instâncias/serverless concorrente, substitua por um armazenamento
 * compartilhado (ex.: Upstash Redis) — os buckets em memória não são
 * compartilhados entre instâncias/funções.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}

export function resetRateLimit(key: string): void {
  buckets.delete(key);
}

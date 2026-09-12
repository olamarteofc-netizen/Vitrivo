import { describe, it, expect, vi, afterEach } from "vitest";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("permite requisições dentro do limite", () => {
    const key = `test-${Math.random()}`;
    expect(checkRateLimit(key, 3, 1000).allowed).toBe(true);
    expect(checkRateLimit(key, 3, 1000).allowed).toBe(true);
    expect(checkRateLimit(key, 3, 1000).allowed).toBe(true);
  });

  it("bloqueia após exceder o limite", () => {
    const key = `test-${Math.random()}`;
    checkRateLimit(key, 2, 1000);
    checkRateLimit(key, 2, 1000);
    const third = checkRateLimit(key, 2, 1000);
    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("libera novamente após a janela expirar", () => {
    vi.useFakeTimers();
    const key = `test-${Math.random()}`;
    checkRateLimit(key, 1, 1000);
    expect(checkRateLimit(key, 1, 1000).allowed).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(checkRateLimit(key, 1, 1000).allowed).toBe(true);
  });

  it("resetRateLimit limpa o contador imediatamente", () => {
    const key = `test-${Math.random()}`;
    checkRateLimit(key, 1, 1000);
    expect(checkRateLimit(key, 1, 1000).allowed).toBe(false);
    resetRateLimit(key);
    expect(checkRateLimit(key, 1, 1000).allowed).toBe(true);
  });
});

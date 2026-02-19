/**
 * Server-side sliding-window rate limiter for Riot API.
 * Dev key limits: 20 requests/second, 100 requests/2 minutes.
 */

interface Window {
  maxRequests: number;
  intervalMs: number;
  timestamps: number[];
}

class RateLimiter {
  private shortWindow: Window;
  private longWindow: Window;
  private queue: Array<() => void> = [];
  private processing = false;

  constructor() {
    this.shortWindow = {
      maxRequests: 20,
      intervalMs: 1000,
      timestamps: [],
    };
    this.longWindow = {
      maxRequests: 100,
      intervalMs: 120_000,
      timestamps: [],
    };
  }

  private cleanup(window: Window): void {
    const cutoff = Date.now() - window.intervalMs;
    window.timestamps = window.timestamps.filter((t) => t > cutoff);
  }

  private canProceed(): boolean {
    this.cleanup(this.shortWindow);
    this.cleanup(this.longWindow);
    return (
      this.shortWindow.timestamps.length < this.shortWindow.maxRequests &&
      this.longWindow.timestamps.length < this.longWindow.maxRequests
    );
  }

  private getWaitTime(): number {
    this.cleanup(this.shortWindow);
    this.cleanup(this.longWindow);

    let wait = 0;

    if (this.shortWindow.timestamps.length >= this.shortWindow.maxRequests) {
      const oldest = this.shortWindow.timestamps[0];
      wait = Math.max(wait, oldest + this.shortWindow.intervalMs - Date.now());
    }

    if (this.longWindow.timestamps.length >= this.longWindow.maxRequests) {
      const oldest = this.longWindow.timestamps[0];
      wait = Math.max(wait, oldest + this.longWindow.intervalMs - Date.now());
    }

    return Math.max(wait, 0);
  }

  private record(): void {
    const now = Date.now();
    this.shortWindow.timestamps.push(now);
    this.longWindow.timestamps.push(now);
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      if (this.canProceed()) {
        this.record();
        const resolve = this.queue.shift()!;
        resolve();
      } else {
        const wait = this.getWaitTime();
        await new Promise((r) => setTimeout(r, wait + 10));
      }
    }

    this.processing = false;
  }

  /** Wait until a request slot is available. */
  async acquire(): Promise<void> {
    if (this.canProceed()) {
      this.record();
      return;
    }

    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
      this.processQueue();
    });
  }
}

/** Singleton rate limiter instance */
export const rateLimiter = new RateLimiter();

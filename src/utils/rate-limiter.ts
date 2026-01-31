export class RateLimiter {
  private queue: (() => Promise<any>)[] = [];
  private processing = false;
  private lastRequestTime = 0;
  private requestsPerSecond: number;

  constructor(requestsPerSecond: number = 5) {
    this.requestsPerSecond = requestsPerSecond;
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      const delay = Math.max(0, (1000 / this.requestsPerSecond) - timeSinceLastRequest);

      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const task = this.queue.shift();
      if (task) {
        this.lastRequestTime = Date.now();
        // Execute task but don't await the result here to allow parallelism if intended, 
        // essentially implementing a simple throttle. 
        // For strict sequential rate limiting (like one request after another), await here.
        // We will await to ensure strict adherence to rate limit timing.
        await task();
      }
    }

    this.processing = false;
  }
}

// Global instance for API calls
export const apiRateLimiter = new RateLimiter(8); // Conservative limit: 8 req/s to survive gameplay

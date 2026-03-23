const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000;

class RenderQueue {
  constructor({ concurrency = 1 } = {}) {
    this.concurrency = Math.max(1, concurrency);
    this.queue = [];
    this.running = 0;
  }

  enqueue(task, options = {}) {
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject, timeoutMs });
      this.#drain();
    });
  }

  #drain() {
    while (this.running < this.concurrency && this.queue.length > 0) {
      const next = this.queue.shift();
      this.running += 1;

      let timer = null;
      const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error('Render islemi zaman asimina ugradi.'));
        }, next.timeoutMs);
      });

      Promise.race([next.task(), timeoutPromise])
        .then((value) => next.resolve(value))
        .catch((error) => next.reject(error))
        .finally(() => {
          if (timer) {
            clearTimeout(timer);
          }
          this.running -= 1;
          this.#drain();
        });
    }
  }
}

export const renderQueue = new RenderQueue({
  concurrency: Number(process.env.RENDER_CONCURRENCY || 1),
});

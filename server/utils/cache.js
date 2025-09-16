import crypto from 'crypto';

class SimpleCache {
  constructor() {
    this.store = new Map(); // key -> { value, expiresAt, etag }
  }

  generateEtag(payload) {
    const json = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return 'W/"' + crypto.createHash('sha1').update(json).digest('hex') + '"';
  }

  set(key, value, ttlMs = 300000) { // default 5 min
    const now = Date.now();
    const etag = this.generateEtag(value);
    this.store.set(key, { value, expiresAt: now + ttlMs, etag });
    return etag;
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry;
  }

  getOrSet(key, producer, ttlMs = 300000) {
    const existing = this.get(key);
    if (existing) return Promise.resolve(existing);
    return Promise.resolve(producer()).then((value) => {
      const etag = this.set(key, value, ttlMs);
      return { value, etag, expiresAt: Date.now() + ttlMs };
    });
  }
}

export const cache = new SimpleCache();

export default cache;



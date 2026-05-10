import Redis from 'ioredis';
import pino from 'pino';

const logger = pino();

class RedisWrapper {
  private _client?: Redis;

  get client() {
    if (!this._client) {
      throw new Error('Redis client not initialized');
    }
    return this._client;
  }

  connect(url: string) {
    this._client = new Redis(url);

    this._client.on('connect', () => {
      logger.info('[Redis] Connected successfully to Redis Server');
    });

    this._client.on('error', (err) => {
      logger.error({ err }, '[Redis] Connection error');
    });
  }
}

export const redisWrapper = new RedisWrapper();

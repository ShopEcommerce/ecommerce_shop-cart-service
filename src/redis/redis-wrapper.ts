import Redis from 'ioredis';
import pino from 'pino';

const logger = pino();

class RedisWrapper {
  private _client?: Redis;
  private _isConnected = false;

  get client() {
    if (!this._client) {
      throw new Error('Redis client not initialized');
    }
    return this._client;
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  connect(url: string) {
    this._client = new Redis(url, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: false,
    });

    this._client.on('connect', () => {
      this._isConnected = true;
      logger.info('[Redis] Connected successfully to Redis Server');
    });

    this._client.on('error', (err) => {
      logger.error({ err }, '[Redis] Connection error');
    });

    this._client.on('close', () => {
      this._isConnected = false;
      logger.warn('[Redis] Connection closed');
    });

    this._client.on('ready', () => {
      logger.info('[Redis] Client ready for commands');
    });
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this._client) {
        return false;
      }
      const result = await this._client.ping();
      return result === 'PONG';
    } catch (err) {
      logger.error({ err }, '[Redis] Health check failed');
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this._client) {
      await this._client.quit();
      this._isConnected = false;
    }
  }
}

export const redisWrapper = new RedisWrapper();

process.env.JWT_SECRET = 'test-secret-key-for-jest';
process.env.DATABASE_URL = 'postgresql://dummy:dummy@localhost:5432/dummy';

jest.mock('@teleshop/common', () => {
  const originalModule = jest.requireActual('@teleshop/common');
  return {
    ...(originalModule as object),
    rabbitmqWrapper: {
      client: {},
      channel: {
        publish: jest.fn(),
        sendToQueue: jest.fn(),
      },
    },
  };
});

jest.mock('../redis/redis-wrapper', () => {
  return {
    redisWrapper: {
      client: {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        expire: jest.fn(),
        quit: jest.fn(),
      },
    },
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

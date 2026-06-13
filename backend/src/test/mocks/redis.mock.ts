import { mock } from 'node:test';

export function makeRedisClientMock() {
  return {
    get: mock.fn<(...args: any[]) => any>(async () => null),
    set: mock.fn<(...args: any[]) => any>(async () => 'OK'),
    setex: mock.fn<(...args: any[]) => any>(async () => 'OK'),
    del: mock.fn<(...args: any[]) => any>(async () => 1),
    expire: mock.fn<(...args: any[]) => any>(async () => 1),
    ttl: mock.fn<(...args: any[]) => any>(async () => -1),
    exists: mock.fn<(...args: any[]) => any>(async () => 0),
    keys: mock.fn<(...args: any[]) => any>(async () => []),
    mget: mock.fn<(...args: any[]) => any>(async () => []),
    ping: mock.fn<(...args: any[]) => any>(async () => 'PONG'),
    publish: mock.fn<(...args: any[]) => any>(async () => 1),
    subscribe: mock.fn<(...args: any[]) => any>(async () => {}),
    on: mock.fn<(...args: any[]) => any>(() => {}),
    off: mock.fn<(...args: any[]) => any>(() => {}),
    quit: mock.fn<(...args: any[]) => any>(async () => {}),
    connect: mock.fn<(...args: any[]) => any>(async () => {}),
    duplicate: mock.fn<(...args: any[]) => any>(() => {
      const client = makeRedisClientMock();
      return { ...client };
    }),
  };
}

export function makeRedisMock(client?: ReturnType<typeof makeRedisClientMock>) {
  return {
    getClient: mock.fn<(...args: any[]) => any>(() => client ?? makeRedisClientMock()),
    healthcheck: mock.fn<(...args: any[]) => any>(async () => ({ status: 'ok' as const })),
    get: mock.fn<(...args: any[]) => any>(async () => null),
    set: mock.fn<(...args: any[]) => any>(async () => 'OK'),
    del: mock.fn<(...args: any[]) => any>(async () => 1),
    keys: mock.fn<(...args: any[]) => any>(async () => []),
    mget: mock.fn<(...args: any[]) => any>(async () => []),
    ping: mock.fn<(...args: any[]) => any>(async () => 'PONG'),
    on: mock.fn<(...args: any[]) => any>(() => {}),
    quit: mock.fn<(...args: any[]) => any>(async () => {}),
  };
}

export type RedisMock = ReturnType<typeof makeRedisMock>;
export type RedisClientMock = ReturnType<typeof makeRedisClientMock>;

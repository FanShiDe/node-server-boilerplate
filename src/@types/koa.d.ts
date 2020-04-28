import { RedisExcute } from '@lib/redis/methods';

declare module 'koa' {
  interface Context {
    plugin: {
      redis: RedisExcute;
    };
    user: {
      uid: string;
      dvcid: string;
      token: string;
      uname: string;
    };
    remoteIP: string | undefined | null;
    params: { [key: string]: any };
  }
}

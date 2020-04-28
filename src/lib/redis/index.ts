import redis, { RedisClient, ClientOpts } from 'redis'
import Koa from 'koa'
import Config from 'config'

import log from '@lib/logger'

const logger = log('redis')
let retryTimes: number = 0

export interface RedisConConfig {
  host: string
  port: number
  db: string | number
  auth?: boolean
  password?: string
}

export const createRedisClient = (options?: ClientOpts): RedisClient => {
  const config: RedisConConfig = {
    host: process.env.REDIS_HOST || Config.get('db.redis.host'),
    port: Number(process.env.REDIS_PORT) || Config.get('db.redis.port'),
    db: process.env.REDIS_DB || Config.get('db.redis.db'),
  }
  if (Config.get('db.redis.auth')) {
    Object.assign(config, {
      password: process.env.REDIS_PASSWORD || Config.get('db.redis.password'),
    })
  }
  if (options) {
    Object.assign(config, options)
  }
  const client = redis.createClient(config)
  return client
}

const initRedis = (appInstance: Koa<Koa.DefaultState, Koa.DefaultContext>) => {
  logger.info(`retryTimes: ${retryTimes}`)
  if (retryTimes > 10) {
    appInstance.emit('error', new Error('retry times reached limit'))
  }
  const client = createRedisClient()
  const redisClient = new Proxy(client, {
    get: (target, key, receiver) => {
      if (!target) {
        logger.error(`call method: ${String(key)} of not exist redis`)
        retryTimes++
        initRedis(appInstance)
        return Promise.reject('redis disconnected')
      }
      return Reflect.get(target, key, receiver)
    },
  })
  redisClient.on('ready', () => {
    logger.info('redis connected')
    retryTimes = 0
  })
  redisClient.on('end', () => {
    logger.info('redis connection has closed')
  })
  redisClient.on('error', (err: Error) => {
    logger.error('redis connect error')
    logger.error(err)
    retryTimes++
    initRedis(appInstance)
  })
  return redisClient
}

const closeRedis = (redisClient: RedisClient) => {
  redisClient.end(true)
}

export default { initRedis, closeRedis }

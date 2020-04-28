import Config from 'config'
import Koa from 'koa'
import koaBody from 'koa-body'
import redisStore from 'koa-redis'
import koaSession from 'koa-session'

import crossDomain from '@middleware/cross_domain'
import remoteIP from '@middleware/remote_IP'

import { initMysql, closeMysql } from '@lib/mysql'
import redis from '@lib/redis'
import redisMethods from '@lib/redis/methods'

import routers from './router'

import log from '@lib/logger'

const logger = log('manifest')

export default (appInstance: Koa<Koa.DefaultState, Koa.DefaultContext>) => {
  const config = {
    host: process.env.REDIS_HOST || Config.get('db.redis.host'),
    port: Number(process.env.REDIS_PORT) || Config.get('db.redis.port'),
    db: process.env.REDIS_DB || Config.get('db.redis.db'),
  }
  if (Config.get('db.redis.auth')) {
    Object.assign(config, {
      password: process.env.REDIS_PASSWORD || Config.get('db.redis.password'),
    })
  }
  const sessionConfig = {
    key: Config.get('server.session.key') as string,
    maxAge: Config.get('server.session.maxAge') as number,
    store: redisStore(Object.assign({}, config)),
  }
  appInstance.proxy = true
  appInstance.keys = Config.get('server.keys') as string[]

  // init connection of mysql and redis
  const redisInstance = redis.initRedis(appInstance)
  initMysql()
  appInstance.context.plugin = {
    redis: redisMethods(redisInstance),
  }

  // middleware
  appInstance.use(koaBody())
  appInstance.use(koaSession(sessionConfig, appInstance))

  appInstance.use(crossDomain)
  appInstance.use(remoteIP)

  // router
  appInstance.use(routers.routes()).use(routers.allowedMethods())

  process.on('SIGINT', () => {
    logger.info('stopping server')
    logger.info('close redis connection')
    redis.closeRedis(redisInstance)
    logger.info('close mysql connection')
    closeMysql()

    process.exit()
  })
}

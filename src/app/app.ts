import Koa from 'koa'
import Config from 'config'

import rejectManifest from './manifest'
import log from '@lib/logger'

const logger = log('app')

const app = new Koa()
app.proxy = true
app.proxyIpHeader = 'X-Real-IP'

rejectManifest(app)

app.on('error', (err: Error) => {
  logger.error('server occur error')
  console.error(err)
  logger.error(err)
  process.exit(0)
})

const host = Config.get('server.host') as string
const port = (process.env.PORT || Config.get('server.port')) as number

app.listen(port, host, () => {
  logger.info(`server start success at: ${host}:${port}`)
})

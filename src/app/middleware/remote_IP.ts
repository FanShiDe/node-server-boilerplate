import { Context } from 'koa'

export default async (ctx: Context, next: () => Promise<any>) => {
  let ips: string[] = []
  if (ctx.req.headers['x-forwarded-for']) {
    ips = (ctx.req.headers['x-forwarded-for'] as string).split(/\s*,\s*/)
  } else if (ctx.req.headers['x-real-ip']) {
    ips = [].concat(ctx.req.headers['x-real-ip'] as never)
  }

  if (ips.length === 0) {
    ips = [].concat(ctx.request.headers['self-ip'])
  }

  ctx.remoteIP = ips[0] || ''
  await next()
}

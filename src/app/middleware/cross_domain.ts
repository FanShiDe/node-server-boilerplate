import { Context } from 'koa'

const whiteList = ['http://localhost:3000']

export default async (ctx: Context, next: () => Promise<any>) => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'staging' ||
    whiteList.includes(ctx.request.headers.origin)
  ) {
    ctx.set('Access-Control-Allow-Origin', ctx.request.headers.origin)
    // @ts-ignore
    ctx.set('Access-Control-Allow-Credentials', true)
    ctx.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Content-Length, Authorization, Accept, X-Requested-With'
    )
    ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
    if (ctx.method === 'OPTIONS') {
      ctx.response.status = 204
      ctx.body = ''
    } else {
      await next()
    }
    return
  }
  await next()
}

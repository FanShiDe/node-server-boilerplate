import { RedisClient } from 'redis'

export const prefix = 'koa:server:'

// tslint:disable-next-line: max-line-length
const flat = (arr: any[]): any[] =>
  arr.reduce(
    (acc: any[], curr: any) =>
      Array.isArray(curr) ? acc.concat(flat(curr)) : acc.concat(curr),
    []
  )

const ldel = (
  redisClient: RedisClient,
  key: string,
  delIndex: number,
  cb?: () => Promise<any>
) => {
  return new Promise((resolve, reject) => {
    if (delIndex > 1) {
      // @ts-ignore
      return redisClient.ltrim(key, delIndex, -1, (err: Error) => {
        if (err) {
          return reject(err)
        }
        if (cb) {
          return resolve(cb())
        }
        resolve()
      })
    } else if (delIndex === 1) {
      // @ts-ignore
      return redisClient.lpop(key, (err: Error, data: any) => {
        if (err) {
          return reject(err)
        }
        if (cb) {
          return resolve(cb())
        }
        resolve()
      })
    }
  })
}

export interface RedisExcute {
  exists: (keyOption: { prefix?: string; key: string }) => Promise<any>
  get: (keyOption: { prefix?: string; key: string }) => Promise<any>
  set: (
    keyOption: { prefix?: string; key: string },
    value: any,
    expiresIn?: number
  ) => Promise<any>
  del: (keyOption: { prefix?: string; key: string }) => Promise<any>
  llen: (keyOption: { prefix?: string; key: string }) => Promise<any>
  // tslint:disable-next-line: max-line-length
  lrange: (
    keyOption: { prefix?: string; key: string },
    offset: { start: number; end: number }
  ) => Promise<any>
  lpush: (
    keyOption: { prefix?: string; key: string },
    otherOption: { limit?: number },
    values: any[]
  ) => Promise<any>
  ldel: (
    keyOption: { prefix?: string; key: string },
    delNum: number,
    cb?: () => Promise<any>
  ) => Promise<any>
  lrem: (
    keyOption: { prefix?: string; key: string },
    delCount: number,
    delValue: any
  ) => Promise<any>
  hget: (
    keyOption: { prefix?: string; key: string },
    field: string
  ) => Promise<any>
  hmget: (
    keyOption: { prefix?: string; key: string },
    fields: string[]
  ) => Promise<any>
  hgetall: (keyOption: { prefix?: string; key: string }) => Promise<any>
  hset: (
    keyOption: { prefix?: string; key: string },
    field: string,
    value: any
  ) => Promise<any>
  hdel: (
    keyOption: { prefix?: string; key: string },
    field: string[]
  ) => Promise<any>
  hmset: (
    keyOption: { prefix?: string; key: string },
    value: { [key: string]: any }
  ) => Promise<any>
  zadd: (
    keyOption: { prefix?: string; key: string },
    score: number,
    value: any
  ) => Promise<any>
  zcard: (keyOption: { prefix?: string; key: string }) => Promise<any>
  zrem: (
    keyOption: { prefix?: string; key: string },
    members: any[]
  ) => Promise<any>
  // tslint:disable-next-line: max-line-length
  zrangeByScore: (
    keyOption: { prefix?: string; key: string },
    mix: string | number,
    max: string | number,
    withscore?: boolean
  ) => Promise<any>
  // tslint:disable-next-line: max-line-length
  zrevrangeByScore: (
    keyOption: { prefix?: string; key: string },
    max: string | number,
    min: string | number,
    withscore?: boolean
  ) => Promise<any>
  // tslint:disable-next-line: max-line-length
  zrange: (
    keyOption: { prefix?: string; key: string },
    start: number,
    stop: number,
    withscore?: boolean
  ) => Promise<any>
  // tslint:disable-next-line: max-line-length
  zremrangeByScore: (
    keyOption: { prefix?: string; key: string },
    mix: number,
    max: number
  ) => Promise<any>
  sadd: (
    keyOption: { prefix?: string; key: string },
    member: any
  ) => Promise<any>
  sismember: (
    keyOption: { prefix?: string; key: string },
    member: any
  ) => Promise<any>
  smembers: (keyOption: { prefix?: string; key: string }) => Promise<any>
  scard: (keyOption: { prefix?: string; key: string }) => Promise<any>
  srem: (
    keyOption: { prefix?: string; key: string },
    members: any[]
  ) => Promise<any>
}

export default (redisClient: RedisClient): RedisExcute => ({
  exists: (keyOption: { prefix?: string; key: string }) => {
    const queryKey = keyOption.prefix
      ? `${keyOption.prefix}:${keyOption.key}`
      : keyOption.key
    return new Promise((resolve, reject) => {
      // @ts-ignore
      redisClient.exists(`${prefix}${queryKey}`, (err: any, data: any) => {
        if (err) {
          return reject(err)
        }
        return resolve(data)
      })
    })
  },
  get: (keyOption: { prefix?: string; key: string }) => {
    const queryKey = keyOption.prefix
      ? `${keyOption.prefix}:${keyOption.key}`
      : keyOption.key
    return new Promise((resolve, reject) => {
      // @ts-ignore
      redisClient.get(`${prefix}${queryKey}`, (err: any, data: any) => {
        if (err) {
          return reject(err)
        }
        return resolve(data)
      })
    })
  },
  set: (
    keyOption: {
      prefix?: string;
      key: string;
    },
    value: any,
    expiresIn?: number
  ) => {
    const queryKey = keyOption.prefix
      ? `${keyOption.prefix}:${keyOption.key}`
      : keyOption.key
    return new Promise((resolve, reject) => {
      if (expiresIn) {
        redisClient.set(
          `${prefix}${queryKey}`,
          value,
          'EX',
          expiresIn,
          // @ts-ignore
          (err: Error, data: any) => {
            if (err) {
              return reject(err)
            }
            return resolve(data)
          }
        )
      } else {
        redisClient.set(
          `${prefix}${queryKey}`,
          value,
          // @ts-ignore
          (err: Error, data: any) => {
            if (err) {
              reject(err)
            } else {
              resolve(data)
            }
          }
        )
      }
    })
  },
  del: (keyOption: { prefix?: string; key: string }) => {
    const queryKey = keyOption.prefix
      ? `${keyOption.prefix}:${keyOption.key}`
      : keyOption.key
    return new Promise((resolve, reject) => {
      // @ts-ignore
      redisClient.del(`${prefix}${queryKey}`, (err: Error, data: any) => {
        if (err) {
          return reject(err)
        }
        return resolve(data)
      })
    })
  },
  lrange: (
    keyOption: {
      prefix?: string;
      key: string;
    },
    offset: {
      start: number;
      end: number;
    } = {
      start: 0,
      end: -1,
    }
  ) => {
    const queryKey = keyOption.prefix
      ? `${keyOption.prefix}:${keyOption.key}`
      : keyOption.key
    return new Promise((resolve, reject) => {
      redisClient.lrange(
        `${prefix}${queryKey}`,
        offset.start,
        offset.end,
        // @ts-ignore
        (err: Error, data: any) => {
          if (err) {
            return reject(err)
          }
          return resolve(data)
        }
      )
    })
  },
  ldel: (
    keyOption: {
      prefix?: string;
      key: string;
    },
    delIndex: number
  ) => {
    const queryKey = keyOption.prefix
      ? `${keyOption.prefix}:${keyOption.key}`
      : keyOption.key
    return Promise.resolve().then(() => ldel(redisClient, queryKey, delIndex))
  },
  llen: (keyOption: { prefix?: string; key: string }) => {
    const queryKey = keyOption.prefix
      ? `${keyOption.prefix}:${keyOption.key}`
      : keyOption.key
    return new Promise((resolve, reject) => {
      redisClient.llen(
        `${prefix}${queryKey}`,
        // @ts-ignore
        (error: Error, total: number) => {
          if (error) {
            return reject(error)
          }
          return resolve(total)
        }
      )
    })
  },
  lpush: (
    keyOption: {
      prefix?: string;
      key: string;
    },
    otherOption: {
      limit?: number;
    },
    ...value: any[]
  ) => {
    const queryKey = keyOption.prefix
      ? `${keyOption.prefix}:${keyOption.key}`
      : keyOption.key
    return new Promise((resolve, reject) => {
      redisClient.lrange(
        `${prefix}${queryKey}`,
        0,
        -1,
        // @ts-ignore
        (error: Error, data: string[]) => {
          if (error) {
            return reject(error)
          }
          if (otherOption.limit) {
            const overLimit = data.length - otherOption.limit

            if (overLimit >= 0) {
              return ldel(
                redisClient,
                `${prefix}${queryKey}`,
                overLimit + 1,
                () =>
                  redisClient.rpush(
                    `${prefix}${queryKey}`,
                    ...value,
                    // @ts-ignore
                    (e: Error, res: number) => {
                      if (e) {
                        return reject(e)
                      }
                      return resolve(res)
                    }
                  )
              )
            }
          }
          redisClient.rpush(
            `${prefix}${queryKey}`,
            ...value,
            // @ts-ignore
            (e: Error, res: number) => {
              if (e) {
                return reject(e)
              }
              return resolve(res)
            }
          )
        }
      )
    })
  },
  lrem: (
    keyOption: {
      prefix?: string;
      key: string;
    },
    delCount: number = 1,
    value: any
  ) => {
    const queryKey = keyOption.prefix
      ? `${keyOption.prefix}:${keyOption.key}`
      : keyOption.key
    return new Promise((resolve, reject) => {
      redisClient.lrem(
        `${prefix}${queryKey}`,
        delCount,
        value,
        // @ts-ignore
        (err: Error, data: any) => {
          if (err) {
            return reject(err)
          }
          return resolve(data)
        }
      )
    })
  },
  hget: (
    keyOption: {
      prefix?: string;
      key: string;
    },
    field: string
  ) => {
    const queryKey = keyOption.prefix
      ? `${keyOption.prefix}:${keyOption.key}`
      : keyOption.key
    return new Promise((resolve, reject) => {
      redisClient.hget(
        `${prefix}${queryKey}`,
        field,
        // @ts-ignore
        (err: Error, data: any) => {
          if (err) {
            return reject(err)
          }
          return resolve(data)
        }
      )
    })
  },
  hmget: (keyOption: { prefix?: string; key: string }, fields: string[]) => {
    const queryKey = keyOption.prefix
      ? `${keyOption.prefix}:${keyOption.key}`
      : keyOption.key
    return new Promise((resolve, reject) => {
      redisClient.hmget(
        `${prefix}${queryKey}`,
        ...fields,
        // @ts-ignore
        (err: Error, data: any) => {
          if (err) {
            return reject(err)
          }
          return resolve(data)
        }
      )
    })
  },
  hset: (
    keyOption: {
      prefix?: string;
      key: string;
    },
    field: string,
    value: any
  ) => {
    const queryKey = keyOption.prefix
      ? `${keyOption.prefix}:${keyOption.key}`
      : keyOption.key
    return new Promise((resolve, reject) => {
      redisClient.hset(
        `${prefix}${queryKey}`,
        field,
        value,
        // @ts-ignore
        (err: Error, data: any) => {
          if (err) {
            return reject(err)
          }
          return resolve(data)
        }
      )
    })
  },
  hdel: (
    keyOption: {
      prefix?: string;
      key: string;
    },
    field: string[]
  ) => {
    const queryKey = keyOption.prefix
      ? `${keyOption.prefix}:${keyOption.key}`
      : keyOption.key
    return new Promise((resolve, reject) => {
      redisClient.hdel(
        `${prefix}${queryKey}`,
        ...field,
        // @ts-ignore
        (err: Error, data: any) => {
          if (err) {
            return reject(err)
          }
          return resolve(data)
        }
      )
    })
  },
  hmset: (
    keyOption: {
      prefix?: string;
      key: string;
    },
    value: {
      [key: string]: any;
    }
  ) => {
    const queryKey = keyOption.prefix
      ? `${keyOption.prefix}:${keyOption.key}`
      : keyOption.key
    return new Promise((resolve, reject) => {
      // @ts-ignore
      redisClient.hmset(
        `${prefix}${queryKey}`,
        flat(Object.entries(value)),
        (err: Error, data: any) => {
          if (err) {
            return reject(err)
          }
          return resolve(data)
        }
      )
    })
  },
  hgetall: (keyOption: { prefix?: string; key: string }) => {
    const queryKey = keyOption.prefix
      ? `${keyOption.prefix}:${keyOption.key}`
      : keyOption.key
    return new Promise((resolve, reject) => {
      // @ts-ignore
      redisClient.hgetall(`${prefix}${queryKey}`, (err: Error, data: any) => {
        if (err) {
          return reject(err)
        }
        return resolve(data)
      })
    })
  },
  zadd: (
    keyOption: {
      prefix?: string;
      key: string;
    },
    score: number,
    value: any
  ) => {
    const queryKey = keyOption.prefix
      ? `${keyOption.prefix}:${keyOption.key}`
      : keyOption.key
    return new Promise((resolve, reject) => {
      redisClient.zadd(
        `${prefix}${queryKey}`,
        score,
        value,
        // @ts-ignore
        (err: Error, data: any) => {
          if (err) {
            return reject(err)
          }
          return resolve(data)
        }
      )
    })
  },
  zcard: (keyOption: { prefix?: string; key: string }) => {
    const queryKey = keyOption.prefix
      ? `${keyOption.prefix}:${keyOption.key}`
      : keyOption.key
    return new Promise((resolve, reject) => {
      // @ts-ignore
      redisClient.zcard(`${prefix}${queryKey}`, (err: Error, data: any) => {
        if (err) {
          return reject(err)
        }
        return resolve(data)
      })
    })
  },
  zrem: (
    keyOption: {
      prefix?: string;
      key: string;
    },
    ...member: any[]
  ) => {
    const queryKey = keyOption.prefix
      ? `${keyOption.prefix}:${keyOption.key}`
      : keyOption.key
    return new Promise((resolve, reject) => {
      redisClient.zrem(
        `${prefix}${queryKey}`,
        ...member,
        // @ts-ignore
        (err: Error, data: any) => {
          if (err) {
            return reject(err)
          }
          return resolve(data)
        }
      )
    })
  },
  zrangeByScore: (
    keyOption: {
      prefix?: string;
      key: string;
    },
    min: string | number,
    max: string | number,
    withscore?: boolean
  ) => {
    const queryKey = keyOption.prefix
      ? `${keyOption.prefix}:${keyOption.key}`
      : keyOption.key
    const params = [`${prefix}${queryKey}`, min, max]
    if (withscore) {
      params.push('WITHSCORES')
    }
    return new Promise((resolve, reject) => {
      // @ts-ignore
      redisClient.zrangebyscore(...params, (err: Error, data: any) => {
        if (err) {
          return reject(err)
        }
        return resolve(data)
      })
    })
  },
  zrevrangeByScore: (
    keyOption: {
      prefix?: string;
      key: string;
    },
    max: string | number,
    min: string | number,
    withscore?: boolean
  ) => {
    const queryKey = keyOption.prefix
      ? `${keyOption.prefix}:${keyOption.key}`
      : keyOption.key
    const params = [`${prefix}${queryKey}`, max, min]
    if (withscore) {
      params.push('WITHSCORES')
    }
    return new Promise((resolve, reject) => {
      // @ts-ignore
      redisClient.zrevrangebyscore(...params, (err: Error, data: any) => {
        if (err) {
          return reject(err)
        }
        return resolve(data)
      })
    })
  },
  zrange: (
    keyOption: {
      prefix?: string;
      key: string;
    },
    start: number,
    stop: number,
    withscore?: boolean
  ) => {
    const queryKey = keyOption.prefix
      ? `${keyOption.prefix}:${keyOption.key}`
      : keyOption.key
    const params = [`${prefix}${queryKey}`, start, stop]
    if (withscore) {
      params.push('WITHSCORES')
    }
    return new Promise((resolve, reject) => {
      // @ts-ignore
      redisClient.zrange(...params, (err: Error, data: any) => {
        if (err) {
          return reject(err)
        }
        return resolve(data)
      })
    })
  },
  zremrangeByScore: (
    keyOption: {
      prefix?: string;
      key: string;
    },
    min: number,
    max: number
  ) => {
    const queryKey = keyOption.prefix
      ? `${keyOption.prefix}:${keyOption.key}`
      : keyOption.key
    return new Promise((resolve, reject) => {
      redisClient.zremrangebyscore(
        `${prefix}${queryKey}`,
        min,
        max,
        // @ts-ignore
        (err: Error, data: any) => {
          if (err) {
            return reject(err)
          }
          return resolve(data)
        }
      )
    })
  },
  sadd: (
    keyOption: {
      prefix?: string;
      key: string;
    },
    member: any
  ) => {
    const queryKey = keyOption.prefix
      ? `${keyOption.prefix}:${keyOption.key}`
      : keyOption.key
    return new Promise((resolve, reject) => {
      redisClient.sadd(
        `${prefix}${queryKey}`,
        member,
        // @ts-ignore
        (err: Error, data: any) => {
          if (err) {
            return reject(err)
          }
          return resolve(data)
        }
      )
    })
  },
  sismember: (
    keyOption: {
      prefix?: string;
      key: string;
    },
    member: any
  ) => {
    const queryKey = keyOption.prefix
      ? `${keyOption.prefix}:${keyOption.key}`
      : keyOption.key
    return new Promise((resolve, reject) => {
      redisClient.sismember(
        `${prefix}${queryKey}`,
        member,
        // @ts-ignore
        (err: Error, data: any) => {
          if (err) {
            return reject(err)
          }
          return resolve(data)
        }
      )
    })
  },
  smembers: (keyOption: { prefix?: string; key: string }) => {
    const queryKey = keyOption.prefix
      ? `${keyOption.prefix}:${keyOption.key}`
      : keyOption.key
    return new Promise((resolve, reject) => {
      // @ts-ignore
      redisClient.smembers(`${prefix}${queryKey}`, (err: Error, data: any) => {
        if (err) {
          return reject(err)
        }
        return resolve(data)
      })
    })
  },
  scard: (keyOption: { prefix?: string; key: string }) => {
    const queryKey = keyOption.prefix
      ? `${keyOption.prefix}:${keyOption.key}`
      : keyOption.key
    return new Promise((resolve, reject) => {
      // @ts-ignore
      redisClient.scard(`${prefix}${queryKey}`, (err: Error, data: any) => {
        if (err) {
          return reject(err)
        }
        return resolve(data)
      })
    })
  },
  srem: (
    keyOption: {
      prefix?: string;
      key: string;
    },
    members: any[]
  ) => {
    const queryKey = keyOption.prefix
      ? `${keyOption.prefix}:${keyOption.key}`
      : keyOption.key
    return new Promise((resolve, reject) => {
      redisClient.srem(
        `${prefix}${queryKey}`,
        ...members,
        // @ts-ignore
        (err: Error, data: any) => {
          if (err) {
            return reject(err)
          }
          return resolve(data)
        }
      )
    })
  },
})

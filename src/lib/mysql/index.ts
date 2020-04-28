import mysql, { Pool, PoolConfig, PoolConnection, MysqlError } from 'mysql'
import Config from 'config'

let mysqlPool: Pool | null = null

export const initMysql = () => {
  const dbConfig: PoolConfig = {
    host: process.env.MYSQL_HOST || Config.get('db.mysql.host'),
    user: process.env.MYSQL_USER || Config.get('db.mysql.user'),
    password: process.env.MYSQL_PASSWORD || Config.get('db.mysql.password'),
    database: process.env.MYSQL_DB || Config.get('db.mysql.database'),
    port: Config.get('db.mysql.port'),
    multipleStatements: true,
  }

  mysqlPool = mysql.createPool(dbConfig)
  return mysqlPool
}

export const closeMysql = () => {
  if (mysqlPool) {
    mysqlPool.end()
  }
}

export default {
  ping: () => {
    return new Promise((resolve, reject) => {
      if (!mysqlPool) {
        return reject('mysql disconnected')
      }
      mysqlPool.getConnection((err: MysqlError, connection: PoolConnection) => {
        if (err) {
          reject(err)
        } else {
          connection.ping((e: Error) => {
            connection.release()
            if (e) {
              reject(e)
            } else {
              resolve()
            }
          })
        }
      })
    })
  },
  query: (
    sql: string,
    values: any[],
    options?: {
      connection?: PoolConnection;
      isAutoRelease?: boolean;
    }
  ) => {
    return new Promise((resolve, reject) => {
      if (!mysqlPool) {
        return reject('mysql disconnected')
      }
      if (options && options.connection) {
        options.connection.query(sql, values, (e, rows) => {
          if (options.isAutoRelease) {
            options.connection!.release()
          }
          if (e) {
            reject(e)
          } else {
            resolve(rows)
          }
        })
      } else {
        mysqlPool.getConnection((err: MysqlError, conn: PoolConnection) => {
          if (err) {
            reject(err)
          } else {
            conn.query(sql, values, (e, rows) => {
              conn.release()
              if (e) {
                reject(e)
              } else {
                resolve(rows)
              }
            })
          }
        })
      }
    })
  },
  transaction: (tasks: (connection: PoolConnection) => Promise<any>) => {
    return new Promise((resolve, reject) => {
      if (!mysqlPool) {
        return reject('mysql disconnected')
      }
      mysqlPool.getConnection((err: MysqlError, connection: PoolConnection) => {
        if (err) {
          connection.release()
          reject(err)
        } else {
          connection.beginTransaction((e: Error) => {
            if (e) {
              console.error(e)
              return connection.rollback(() => reject(e))
            }
            tasks(connection)
              .then(() => {
                connection.commit((error: Error) => {
                  if (error) {
                    console.error(error)
                    return connection.rollback(() => reject(error))
                  }
                  return resolve()
                })
              })
              .catch((error: Error) => {
                console.error(error)
                return connection.rollback(() => reject(error))
              })
              .finally(() => connection.release())
          })
        }
      })
    })
  },
}

import { createLogger, format, transports, Logger } from 'winston'
import dayjs from 'dayjs'
import path from 'path'

// @ts-ignore
const resolvePath = (filename: string, ...dir: string[]) =>
  path.join(__dirname, ...dir, filename)

const enumerateErrorFormat = format((info: any) => {
  if (info.message instanceof Error) {
    info.message = Object.assign(
      {
        message: info.message.message,
        stack: info.message.stack,
      },
      info.message
    )
  }

  if (info instanceof Error) {
    return Object.assign(
      {
        message: info.message,
        stack: info.stack,
      },
      info
    )
  }

  return info
})

const myFormat = (label?: string) =>
  format.printf(({ level, message, timestamps, data, stack }) => {
    let displayData = data ? `\r\n ${JSON.stringify(data, null, ' ')}` : ''
    const displayMessage = message
      ? `\r\n ${JSON.stringify(message, null, ' ')}`
      : ''
    if (level === 'error') {
      displayData = stack
    }
    return `[${timestamps}] [${level}] [${label}]: ${displayMessage} ${displayData}`
  })

const addTimestamps = format((info: any) =>
  Object.assign(info, { timestamps: dayjs().format('YYYY-MM-DD HH:mm:ss') })
)

const logger = (label?: string): Logger => {
  const transport = [
    new transports.File({
      filename: resolvePath(
        `${dayjs().format('YYYY-MM-DD')}.error.log`,
        '../../logs/'
      ),
      level: 'error',
      maxsize: 50 * 1024 * 1024,
    }),
    new transports.File({
      filename: resolvePath(
        `${dayjs().format('YYYY-MM-DD')}.info.log`,
        '../../logs/'
      ),
      maxsize: 50 * 1024 * 1024,
    }),
  ]
  if (process.env.NODE_ENV === 'development') {
    transport.push(
      // @ts-ignore
      new transports.Console({
        format: format.simple(),
      })
    )
  }

  return createLogger({
    level: 'info',
    format: format.combine(
      enumerateErrorFormat(),
      addTimestamps(),
      format.json(),
      myFormat(label)
    ),
    transports: transport,
  })
}

export default (label?: string): Logger => logger(label)

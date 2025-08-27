export const isDev = process.env.NODE_ENV !== "production"

export const log = (...args: any[]) => {
  if (isDev) console.log(...args)
}

export const warn = (...args: any[]) => {
  if (isDev) console.warn(...args)
}

export const error = (...args: any[]) => {
  console.error(...args)
}

const logger = { isDev, log, warn, error }

export default logger

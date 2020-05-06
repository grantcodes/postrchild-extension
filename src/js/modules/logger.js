const isDev = process.env.NODE_ENV === 'development'

const logger = {
  log: function () {
    if (isDev) {
      console.log('[PostrChild Log]', ...arguments)
    }
  },
  info: function () {
    if (isDev) {
      console.info('[PostrChild Info]', ...arguments)
    }
  },
  warn: function () {
    console.warn('[PostrChild Warning]', ...arguments)
  },
  error: function () {
    console.error('[PostrChild Error]', ...arguments)
  },
}

export default logger

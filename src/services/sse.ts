const MAX_RETRIES = 6
const BASE_DELAY_MS = 1000
const MAX_DELAY_MS = 30_000

class SSEClient {
  private es: EventSource | null = null
  private url: string
  private handlers: Record<string, (payload: any) => void> = {}
  private retryCount = 0
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private closed = false

  constructor(url: string) {
    this.url = url
  }

  connect(handlers: Record<string, (payload: any) => void>) {
    if (this.es) return
    this.handlers = handlers
    this.closed = false
    this._open()
  }

  private _open() {
    if (this.closed) return
    try {
      const token = localStorage.getItem("token")
      const urlWithToken = token
        ? `${this.url}${this.url.includes("?") ? "&" : "?"}api_token=${encodeURIComponent(token)}`
        : this.url

      this.es = new EventSource(urlWithToken, { withCredentials: false })

      this.es.onopen = () => {
        this.retryCount = 0
      }

      const safeOn = (event: string, cb: (payload: any) => void) => {
        this.es!.addEventListener(event, (evt: MessageEvent) => {
          try {
            cb(JSON.parse(evt.data))
          } catch {
            // ignore JSON parse errors
          }
        })
      }

      Object.entries(this.handlers).forEach(([event, cb]) => safeOn(event, cb))

      this.es.onerror = () => {
        this.es?.close()
        this.es = null
        this._scheduleReconnect()
      }
    } catch {
      this._scheduleReconnect()
    }
  }

  private _scheduleReconnect() {
    if (this.closed || this.retryCount >= MAX_RETRIES) return
    const delay = Math.min(BASE_DELAY_MS * 2 ** this.retryCount, MAX_DELAY_MS)
    this.retryCount++
    this.retryTimer = setTimeout(() => this._open(), delay)
  }

  close() {
    this.closed = true
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
      this.retryTimer = null
    }
    this.es?.close()
    this.es = null
  }
}

export default SSEClient

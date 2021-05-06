import { addListener, triggerEvent } from './Listener'

class Socket {
    constructor(listeners) {
        this.ws = null
        this.sync = {
            begin: null,
            end: null,
            rtt: null,
            ping: null,
            diff: null,
            offset: null
        }
        this.retries = 0

        this.latest = []

        this.addListener = addListener
        this.triggerEvent = triggerEvent

        this.addListener('onChatReceive', chunk => {
            this.latest.push(chunk)
            if (this.latest.length > 100) this.latest.unshift()
        })

        for (let name in listeners) this.addListener(name, listeners[name])

        this.open()
    }

    send(object) {
        if (this.ws.OPEN) return this.ws.send(JSON.stringify(object))
    }

    open() {
        // this.ws = new WebSocket(`wss://${window.location.host}/ws/`)
        this.ws = new WebSocket(`wss://iledopapiezowej.pl/ws/`)

        this.ws.onopen = () => {
            console.info(`Socket connected`)

            if (this.retries > 0) {
                this.retries = 0
                this.triggerEvent('onChatReceive', {
                    nick: 'local',
                    role: 'root',
                    content: "Połączono"
                })
            }

            this.visibility(window.document.visibilityState === 'visible')

            // re-set nick
            if (localStorage['nick']) {
                if (localStorage['nick'] !== 'undefined')
                    this.triggerEvent('onChatSend', `/nick ${localStorage['nick']}`)
            }

            // re-login
            if (localStorage['login']) {
                if (localStorage['login'] !== 'undefined undefined')
                    this.triggerEvent('onChatSend', `/login ${localStorage['login']}`)
            }
        }

        this.ws.onclose = () => {
            console.info(`Socket disconnected`)

            this.triggerEvent('onChatReceive', {
                nick: 'local',
                role: 'root',
                content: "Rozłączono"
            })

            this.triggerEvent('onSocketDisconnect', this.ws.readyState)

            this.reopen()
        }

        this.ws.onmessage = (e) => {
            let data = JSON.parse(e.data)

            // wrap in an array anyways
            if (!Array.isArray(data)) data = [data]

            for (let chunk of data) {
                if (chunk.type === 'count') {
                    this.triggerEvent('onCount', {
                        count: chunk.count,
                        invisible: chunk.invisible
                    })

                } else if (chunk.type === 'chat') {
                    this.triggerEvent('onChatReceive', chunk)

                } else if (chunk.type === 'sync.begin') {
                    this.sync.begin = performance.now()
                    this.send({
                        type: "sync.received"
                    })

                } else if (chunk.type === 'sync.end') {
                    this.sync.end = performance.now()
                    this.sync.rtt = this.sync.end - this.sync.begin
                    this.sync.ping = this.sync.rtt / 2
                    this.sync.diff = (Date.now() - chunk.time)
                    this.sync.offset = this.sync.diff - this.sync.ping

                    this.triggerEvent('onSync', this.sync)

                    console.info(`Time synced, offset: ${this.sync.offset.toFixed(3)}ms with ping: ${this.sync.ping.toFixed(3)}`)

                } else if (chunk.type === 'version') {
                    this.version = chunk.version
                    this.triggerEvent('onVersion', chunk.version)
                    console.log('Server version: ', chunk.version)
                } else if (chunk.type === 'id') {
                    this.id = chunk.id
                }
            }

        }

    }

    visibility(visible) {
        this.send({
            type: 'visibility',
            visible: visible
        })
    }

    reopen() {
        if (this.retries > 5) {
            console.log(`Socket stopped, too many reconnect attempts`)
        } else setTimeout(() => {
            console.info(`Socket attempting reconnect`)
            this.retries++
            this.open()
        }, 4e3)
    }
}

export default Socket
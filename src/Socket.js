import { addListener, triggerEvent } from './Listener'

import pkg from '../package.json'

import Captcha from './auth/Captcha'

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

    getCaptcha(action) {
        console.info('Requesting captcha token')
        return window.grecaptcha.execute(Captcha.key, { action })
            .then(token => {
                console.info('Received captcha')
                this.captcha = token
                return token
            })
    }

    send(object) {
        if (this.ws.readyState !== WebSocket.OPEN) return

        this.ws.send(JSON.stringify(object))
        console.debug(`Sending`, object)
    }

    open() {
        this.ws = new WebSocket(`wss://${window.location.host}/ws/`)
        // this.ws = new WebSocket(`wss://iledopapiezowej.pl/ws/`)
        // this.ws = new WebSocket(`wss://beta.iledopapiezowej.pl/ws/`)
        // this.ws = new WebSocket(`ws://localhost:5502`)

        this.ws.onopen = () => {
            console.info(`Socket connected`)

            if (this.retries > 0) {
                this.retries = 0
                this.triggerEvent('onChatReceive', {
                    nick: 'local',
                    role: 'root',
                    content: "Połączono ✔️"
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

        this.ws.onclose = e => {
            console.info(`Socket disconnected`, e.code, e.reason)

            this.triggerEvent('onChatReceive', {
                nick: 'local',
                role: 'root',
                content: "Rozłączono ❌"
            })

            this.triggerEvent('onSocketDisconnect', this.ws.readyState)

            this.captcha = null
            this.sync.ping = -1

            this.reopen()
        }

        this.ws.onmessage = (e) => {
            let data = JSON.parse(e.data)

            // wrap in an array anyways
            if (!Array.isArray(data)) data = [data]

            console.debug(`Receiving`, `[${data.map(o => o.type).join()}]`, data)

            for (let chunk of data) {
                // view count update
                if (chunk.type === 'count') {
                    this.triggerEvent('onCount', {
                        count: chunk.count,
                        invisible: chunk.invisible
                    })

                }

                // received chat message
                if (chunk.type === 'chat') {
                    this.triggerEvent('onChatReceive', chunk)

                }

                // received older messages
                if (chunk.type === 'cachedMessages') {
                    if (chunk.messages.length > 1)
                        chunk.messages[chunk.messages.length - 1].last = true
                    for (let message of chunk.messages) {
                        this.triggerEvent('onChatReceive', message)
                    }
                }

                // server requested captcha
                if (chunk.type === 'captcha') {
                    this.getCaptcha(chunk.action ?? 'general')
                        .then(token => {
                            this.send({
                                type: 'captcha',
                                token
                            })
                        })
                }

                // initiate time synchronisation
                if (chunk.type === 'sync.begin') {
                    this.sync.begin = performance.now()
                    this.send({
                        type: "sync.received",
                        heartbeat: chunk.heartbeat ?? false
                    })

                }

                // calculate synchronised time offset
                if (chunk.type === 'sync.end') {
                    this.sync.end = performance.now()
                    this.sync.rtt = this.sync.end - this.sync.begin
                    this.sync.ping = this.sync.rtt / 2
                    this.sync.diff = (Date.now() - chunk.time)
                    this.sync.offset = this.sync.diff - this.sync.ping

                    this.triggerEvent('onSync', this.sync)

                    console.info(`Time synced${chunk.heartbeat ? ' ❤️' : ''}, offset: ${this.sync.offset.toFixed(3)}ms with ping: ${this.sync.ping.toFixed(3)}`)

                }

                // receive server version
                if (chunk.type === 'version') {
                    this.version = chunk.version

                    let supported = chunk.supports.split('.').join('') - pkg.version.split('.').join('')

                    console.info(`Server version: ${chunk.version}. Supports: ${chunk.supports} (${supported > 0 ? 'Outdated' : 'Latest'
                        })`)
                }

                // receive current connection id
                if (chunk.type === 'id') {
                    this.id = chunk.id
                    console.info(`Received connection info`, chunk)
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
        if (this.ws.readyState === WebSocket.OPEN) return

        if (this.retries > 5) {
            console.info(`Socket stopped, too many reconnect attempts`)
        } else setTimeout(() => {
            console.info(`Socket attempting reconnect, #${this.retries + 1}`)
            this.retries++
            this.open()
        }, 4e3)
    }
}

export default Socket
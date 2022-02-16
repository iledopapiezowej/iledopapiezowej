import pkg from '../package.json'

const { REACT_APP_CAPTCHA_KEY, REACT_APP_WS_SERVER } = process.env

export type listener = (chunk: any) => void

export type listeners = {
	[key: string]: listener[]
}

export type sync = {
	begin: number
	end: number
	rtt: number
	ping: number
	diff: number // time difference
	offset: number // corrected time difference
}

export type messageChunk = {
	nick: string
	role: string
	uid?: string
	content: string
	time: string
	type: string
	mid: string
}

export interface outgoingPayload {
	type: string
	flag?: string
	[key: string]: any
}

export interface incomingPayload {
	type: string
	flag?: string
	[key: string]: any
}

class Socket {
	ws: WebSocket
	pending: outgoingPayload[]
	subscribed: { [keys: string]: number }
	sync: sync
	retries: number // reconnect attempts
	events: listeners

	latest: messageChunk[] // older chat messages
	captcha: string | null // captcha token
	version: string | null // server version
	id: string | null // connection id

	constructor(listeners?: listeners) {
		this.pending = []

		this.subscribed = {
			chat: 0,
		}

		this.sync = {
			begin: 0,
			end: 0,
			rtt: 0,
			ping: 0,
			diff: 0,
			offset: 0,
		}
		this.retries = 0

		this.captcha = null
		this.version = null
		this.id = null

		this.events = {}

		for (let name in listeners)
			for (let listener of listeners[name]) this.addListener(name, listener)

		this.latest = []
		this.addListener('onChatReceive', (chunk: messageChunk) => {
			// skip messages already cached
			// TODO: move to receive-latest-on-connect event
			if (this.latest.find((e) => e.mid === chunk.mid)) return

			// ensure meta properties exist
			chunk.mid || (chunk.mid = Math.random().toString(36).slice(2, 9))
			chunk.time || (chunk.time = new Date().toISOString())

			this.latest.push(chunk)
			if (this.latest.length > 100) this.latest.unshift()
		})

		this.ws = new WebSocket(REACT_APP_WS_SERVER)
		this.open()
	}

	addListener(name: string, callback: listener): number {
		if (!Array.isArray(this.events[name])) this.events[name] = []

		this.events[name].push(callback)

		return this.events[name].length - 1
	}

	removeListener(name: string, i: number) {
		this.events[name].splice(i, 1)
	}

	private triggerEvent(name: string, payload: any) {
		if (typeof this.events[name] !== 'undefined')
			for (let callback of this.events[name]) {
				callback(payload, this)
			}
	}

	private _connect() {
		this.ws = new WebSocket(REACT_APP_WS_SERVER)
	}

	open() {
		if (this.ws) {
			if (this.ws.readyState !== WebSocket.OPEN) this._connect()
		} else this._connect()

		this.ws.onopen = () => {
			console.info(`Socket connected`)

			for (let payload of this.pending) {
				this.send(payload)
			}

			if (this.retries > 0) {
				this.retries = 0
				this.triggerEvent('onChatReceive', {
					nick: 'local',
					role: 'root',
					content: 'Połączono ✔️',
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

		this.ws.onclose = (e) => {
			console.info(`Socket disconnected`, e.code, e.reason)

			this.triggerEvent('onSocketDisconnect', this.ws.readyState)
			this.triggerEvent('onChatReceive', {
				nick: 'local',
				role: 'root',
				content: 'Rozłączono ❌',
			})

			this.captcha = null
			this.sync.ping = -1

			this.reopen()
		}

		this.ws.onmessage = (e) => {
			let data: incomingPayload[] = JSON.parse(e.data)

			// wrap in an array anyways
			if (!Array.isArray(data)) data = [data]

			console.debug(
				`Receiving`,
				`[${data.map(({ type }) => type).join(' ')}]`,
				data
			)

			for (let chunk of data) {
				let { type, flag } = chunk

				// receive server version
				if (type === 'info') {
					this.version = chunk.version
					this.id = chunk.id

					// TODO: make sense of this

					let isSupported = true

					// supports = chunk.supports.split('.'),
					// version = pkg.version.split('.'),

					// for (let i in supports) {
					// 	if (supports[i] > version[i]) {
					// 		isSupported = false
					// 		break
					// 	}
					// 	if (supports[i] < version[i]) {
					// 		isSupported = true
					// 		break
					// 	}
					// }

					console.info(
						`id: ${chunk.id}, Client: ${pkg.version}, Server: ${chunk.version}, Supports: ${chunk.supports} (${isSupported})`
					)
				}

				// viewcount update
				if (type === 'count') {
					this.triggerEvent('onCount', {
						count: chunk.count,
						invisible: chunk.invisible,
					})
				}

				// chat message
				if (type === 'chat') {
					if (flag === 'messages')
						// older messages
						for (let message of chunk.messages) {
							this.triggerEvent('onChatReceive', message)
						}
					else this.triggerEvent('onChatReceive', chunk) // regular message
				}

				// server requested captcha
				if (type === 'captcha') {
					this.getCaptcha(chunk.action ?? 'general').then((token) => {
						this.send({
							type: 'captcha',
							token,
						})
					})
				}

				// time synchronisation
				if (type === 'sync') {
					// init
					if (flag === 'begin') {
						this.sync.begin = performance.now()
						this.send({
							type: 'sync',
							flag: 'received',
							heartbeat: chunk.heartbeat ?? false,
						})
					}

					// calculate
					if (flag === 'end') {
						this.sync.end = performance.now()
						this.sync.rtt = this.sync.end - this.sync.begin
						this.sync.ping = this.sync.rtt / 2
						this.sync.diff = Date.now() - chunk.time
						this.sync.offset = this.sync.diff - this.sync.ping

						this.triggerEvent('onSync', this.sync)

						console.info(
							`Time synced${
								chunk.heartbeat ? ' ❤️' : ''
							}, offset: ${this.sync.offset.toFixed(
								1
							)}ms, ping: ${this.sync.ping.toFixed(1)}`
						)
					}
				}

				if (type === 'clicker') {
					this.triggerEvent('onClickerReceive', chunk)
				}
			}
		}
	}

	reopen() {
		if (this.ws.readyState === WebSocket.OPEN) return

		if (this.retries > 5) {
			console.info(`Socket stopped, too many reconnect attempts`)
		} else
			setTimeout(() => {
				console.info(`Socket attempting reconnect, #${this.retries + 1}`)
				this.retries++
				this.open()
			}, 4e3)
	}

	send(object: outgoingPayload) {
		if (this.ws.readyState !== WebSocket.OPEN) {
			console.debug('Pending', object)
			return this.pending.push(object)
		}

		this.ws.send(JSON.stringify(object))
		console.debug(`Sending`, object)
	}

	getCaptcha(action: string): PromiseLike<string> {
		console.info('Requesting captcha token')
		return window.grecaptcha
			.execute(REACT_APP_CAPTCHA_KEY, { action })
			.then((token: string) => {
				console.info('Received captcha')
				this.captcha = token
				return token
			})
	}

	visibility(visible: boolean) {
		this.send({
			type: 'count',
			visible: visible,
		})
	}

	subscribe(type: string) {
		if (this.subscribed[type] < 1) {
			this.send({
				type,
				subscribe: true,
			})
		}
		this.subscribed[type]
			? this.subscribed[type]++
			: (this.subscribed[type] = 1)
	}

	unsubscribe(type: string) {
		if (this.subscribed[type] === 1) {
			this.send({
				type,
				unsubscribe: true,
			})
		}
		this.subscribed[type]
			? this.subscribed[type]--
			: (this.subscribed[type] = 0)
	}
}

export default Socket

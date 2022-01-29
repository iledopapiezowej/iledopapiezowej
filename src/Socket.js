import { addListener, removeListener, triggerEvent } from './Listener'

import pkg from '../package.json'

const { REACT_APP_CAPTCHA_KEY } = process.env

class Socket {
	constructor(listeners) {
		this.ws = null

		this.pending = []

		this.subscribed = {
			chat: 0,
		}

		this.sync = {
			begin: null,
			end: null,
			rtt: null,
			ping: null,
			diff: null, // time difference
			offset: null, // corrected time difference
		}
		this.retries = 0 // reconnect attempts

		this.addListener = addListener
		this.removeListener = removeListener
		this.triggerEvent = triggerEvent

		for (let name in listeners) this.addListener(name, listeners[name])

		this.latest = [] // older chat messages
		this.addListener('onChatReceive', (chunk) => {
			// skip messages already cached
			if (this.latest.find((e) => e.mid === chunk.mid)) return

			// ensure meta property exist
			chunk.mid || (chunk.mid = Math.random().toString(36).slice(2, 9))
			chunk.time || (chunk.time = new Date().toISOString())

			this.latest.push(chunk)
			if (this.latest.length > 100) this.latest.unshift()
		})

		this.open()
	}

	open() {
		this.ws = new WebSocket(process.env.REACT_APP_WS_SERVER)
		// this.ws = new WebSocket(`wss://iledopapiezowej.pl/ws/`)
		// this.ws = new WebSocket(`wss://beta.iledopapiezowej.pl/ws/`)
		// this.ws = new WebSocket(`ws://localhost:5502`)

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
			let data = JSON.parse(e.data)

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

					let supports = chunk.supports.split('.'),
						version = pkg.version.split('.'),
						isSupported = true

					for (let i in supports) {
						if (supports[i] > version[i]) {
							isSupported = false
							break
						}
						if (supports[i] < version[i]) {
							isSupported = true
							break
						}
					}

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

	send(object) {
		if (this.ws.readyState !== WebSocket.OPEN) {
			console.debug('Pending', object)
			return this.pending.push(object)
		}

		this.ws.send(JSON.stringify(object))
		console.debug(`Sending`, object)
	}

	getCaptcha(action) {
		console.info('Requesting captcha token')
		return window.grecaptcha
			.execute(REACT_APP_CAPTCHA_KEY, { action })
			.then((token) => {
				console.info('Received captcha')
				this.captcha = token
				return token
			})
	}

	visibility(visible) {
		this.send({
			type: 'count',
			visible: visible,
		})
	}

	subscribe(type) {
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

	unsubscribe(type) {
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

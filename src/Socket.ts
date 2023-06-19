import captcha from './modules/captcha'
import chat from './modules/chat'
import sync from './modules/sync'

const { REACT_APP_WS_SERVER } = process.env

type listener = (chunk: any) => void

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

export type module = {
	label: string
	connect?: (socket: Socket) => any
	leave?: (socket: Socket) => any
	send?: (socket: Socket, payload: any) => any
	receive: (socket: Socket, payload: incomingPayload) => any

	[name: string]: any
}

type modules = { [label: string]: module }

export enum EVENT {
	WS,
	RECEIVE,
	MODULE,
}

const socketModules = [captcha, chat, sync]

class Socket {
	ws!: WebSocket

	lastClose!: CloseEvent
	retries: number // reconnect attempts
	pending: outgoingPayload[]

	subscribed: { [module: string]: number }
	events: { [event: string]: listener[] }

	modules: modules

	constructor() {
		this.retries = 0
		this.pending = []

		this.subscribed = {
			chat: 0,
		}
		this.events = {}

		this.modules = socketModules.reduce((mods: modules, mod: module) => {
			mods[mod.label] = mod
			return mods
		}, {})

		this.open()
	}

	addListener(type: EVENT, name: string, callback: listener): number {
		const id = type + name

		if (!Array.isArray(this.events[id])) this.events[id] = []

		this.events[id].push(callback)

		return this.events[id].length - 1
	}

	removeListener(type: EVENT, name: string, i: number) {
		this.events[type + name].splice(i, 1)
	}

	triggerEvent(type: EVENT, name: string, payload: any) {
		const id = type + name

		if (typeof this.events[id] !== 'undefined')
			for (let callback of this.events[id]) {
				callback(payload)
			}
	}

	open() {
		this.ws = new WebSocket(REACT_APP_WS_SERVER)

		this.ws.onopen = () => {
			console.info(`Socket connected`)

			for (let m in this.modules) {
				this.modules[m].connect?.(this)
			}

			for (let payload of this.pending) {
				this.send(payload)
			}
		}

		this.ws.onclose = (e) => {
			console.info(`Socket disconnected`, e.code, e.reason)
			this.lastClose = e

			this.triggerEvent(EVENT.WS, 'disconnect', this.ws.readyState)

			for (let m in this.modules) {
				this.modules[m].leave?.(this)
			}

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
				this.triggerEvent(EVENT.RECEIVE, chunk.type, chunk)

				this.modules[chunk.type]?.receive(this, chunk)
			}
		}
	}

	reopen() {
		if (this.ws.readyState === WebSocket.OPEN) return

		if (this.lastClose.code === 4003) return console.info(`Banned from server`)

		if (this.retries > 5) return console.info(`Too many reconnect attempts`)

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
		console.debug(`Sending [${object.type}]`, object)
	}

	subscribe(type: string) {
		if (this.subscribed[type] < 1) this.send({ type, subscribe: true })

		this.subscribed[type]
			? this.subscribed[type]++
			: (this.subscribed[type] = 1)
	}

	unsubscribe(type: string) {
		if (this.subscribed[type] === 1) this.send({ type, unsubscribe: true })

		this.subscribed[type]
			? this.subscribed[type]--
			: (this.subscribed[type] = 0)
	}
}

export default Socket

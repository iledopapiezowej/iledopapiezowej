import { EVENT, incomingPayload, module } from '../Socket'

export type messageChunk = {
	nick: string
	role: string
	uid?: string
	content: string
	time: string
	type: string
	mid: string
}

const chat: module = {
	label: 'chat',

	messages: [] as messageChunk[],
	id: '',

	connect(socket) {
		if (socket.retries > 0) {
			socket.retries = 0
			socket.triggerEvent(EVENT.MODULE, 'chat-message', {
				nick: 'local',
				role: 'root',
				content: 'Połączono ✔️',
			})
		}
		// // re-set nick
		// if (localStorage['nick']) {
		// 	if (localStorage['nick'] !== 'undefined')
		// 		this.triggerEvent('onChatSend', `/nick ${localStorage['nick']}`)
		// }
	},

	leave(socket) {
		socket.triggerEvent(EVENT.MODULE, 'chat-message', {
			nick: 'local',
			role: 'root',
			content: 'Rozłączono ❌',
		})
	},

	send() {},
	receive(socket, chunk) {
		const parse = (chunk: incomingPayload) => {
			// skip messages already cached
			if (this.messages.find((e: messageChunk) => e.mid === chunk.mid)) return

			// ensure meta properties exist
			chunk.mid || (chunk.mid = Math.random().toString(36).slice(2, 9))
			chunk.time || (chunk.time = new Date().toISOString())

			this.messages.push(chunk as messageChunk)
			if (this.messages.length > 100) this.messages.unshift()
		}

		if (chunk.flag === 'messages')
			// older messages
			for (let message of chunk.messages) parse(message)
		else parse(chunk)

		socket.triggerEvent(EVENT.MODULE, 'chat-message', chunk) // regular message
	},
}

export default chat

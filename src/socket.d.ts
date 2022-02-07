type listenerPayload = { [keys: string]: any }

type listener = (listenerPayload, socket: Socket) => void

type listeners = {
	[key: string]: listener[]
}

type onChatReceive = (messageChunk, socket: Socket) => void

type sync = {
	begin: number
	end: number
	rtt: number
	ping: number
	diff: number // time difference
	offset: number // corrected time difference
}

type messageChunk = {
	nick: string
	role: string
	uid?: string
	content: string
	time: string
	type: string
	mid: string
}

interface outgoingPayload {
	type: string
	flag?: string
	[key: string]: any
}

interface incomingPayload {
	type: string
	flag?: string
	[key: string]: any
}

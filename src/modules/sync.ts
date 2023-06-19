import { EVENT, module } from '../Socket'

export type syncData = {
	begin: number
	end: number
	rtt: number
	ping: number
	diff: number // time difference
	offset: number // corrected time difference
}

const sync: module = {
	label: 'sync',

	timings: {
		offset: 0,
	} as syncData,

	connect() {},

	leave() {
		this.timings.ping = -1
	},

	send() {},
	receive(socket, { flag, heartbeat, time: remoteTime }) {
		// init
		if (flag === 'begin') {
			this.timings.begin = performance.now()

			socket.send({
				type: 'sync',
				flag: 'received',
				heartbeat: heartbeat ?? false,
			})
		}

		// calculate
		if (flag === 'end') {
			this.timings.end = performance.now()
			this.timings.diff = Date.now() - new Date(remoteTime).getTime()
			this.timings.rtt = this.timings.end - this.timings.begin
			this.timings.ping = this.timings.rtt / 2
			this.timings.offset = this.timings.diff - this.timings.ping

			socket.triggerEvent(EVENT.MODULE, 'synced', this.timings)

			console.info(
				`Time synced${
					heartbeat ? ' ❤️' : ''
				}, offset: ${this.timings.offset.toFixed(
					1
				)}ms, ping: ${this.timings.ping.toFixed(1)}`
			)
		}
	},
}

export default sync

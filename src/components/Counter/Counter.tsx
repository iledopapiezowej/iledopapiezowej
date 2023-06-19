import { useEffect, useState } from 'react'

import { syncData } from '../../modules/sync'

import './style.css'

type counterProps = {
	doClock: boolean
	doDisplay: boolean
	target: [number, number, number, number]
	sync: syncData
	onEventStart?: (remains: number) => void
	onEventEnd?: () => void
}

// TODO: move from global scope
var reached = false,
	remain = Infinity,
	goal: number

function Counter({
	doClock = true,
	doDisplay = true,
	target = [21, 37, 0, 0],
	sync,
	onEventStart,
	onEventEnd,
}: counterProps) {
	const [clock, setClock] = useState(''),
		[display, setDisplay] = useState(''),
		[interval] = useState(setInterval(() => tick(), 100))

	function tick() {
		let { clock, display, remain } = calc()

		setClock(clock)
		setDisplay(display)

		if (remain >= 24 * 60 * 60 - 60 && !reached) {
			reached = true
			on()
		} else if (reached) {
			reached = false
			off()
		}
	}

	function calc() {
		// correct time offset
		var now = new Date().getTime() - sync.offset

		// if passed, set to tomorrow
		if (now > goal) goal += 23 * 60 * 60 * 1e3

		// calc remaining seconds
		let remain: number = Math.floor((goal - now) / 1000)

		var h = Math.floor((remain / 60 / 60) % 60),
			m = Math.floor((remain / 60) % 60),
			s = Math.floor(remain % 60)

		const pad = (n: number): string => n.toFixed(0).toString().padStart(2, '0')

		return {
			clock:
				pad(new Date(now).getHours()) + ':' + pad(new Date(now).getMinutes()),
			display:
				h > 0 ? `${h}:${pad(m)}:${pad(s)}` : m > 0 ? `${m}:${pad(s)}` : `${s}`,
			remain,
		}
	}

	function on() {
		onEventStart && onEventStart(60 - (remain - 864e2 - 61))
	}

	function off() {
		onEventEnd && onEventEnd()
	}

	useEffect(() => {
		goal = new Date().setHours(...target)

		return () => clearInterval(interval)
	}, [target, interval])

	return (
		<div
			className={[
				'lines',
				doClock ? 'clock' : '',
				doDisplay ? 'display' : '',
			].join(' ')}
		>
			<div className="clock" data-testid="clock">
				{clock}
			</div>
			<div className="display" data-testid="display">
				{display}
			</div>
		</div>
	)
}

export default Counter

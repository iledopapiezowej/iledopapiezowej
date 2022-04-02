import { useEffect, useState } from 'react'

import { sync } from '../../Socket'

import './style.css'

type counterProps = {
	doClock: boolean
	doDisplay: boolean
	target: [number, number, number, number]
	sync: sync
	onEventStart?: (remains: number) => void
	onEventEnd?: () => void
}

const fullday = 24 * 60 * 60

// TODO: move from global scope
var reached = false,
	// remain = 30,
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
		[display, setDisplay] = useState('')

	function tick() {
		let { clock, display, remain } = calc()

		if (remain >= fullday - 60) {
			if (!reached) {
				reached = true
				onEventStart && onEventStart(fullday - remain - 1)
			}
		} else if (reached) {
			reached = false
			onEventEnd && onEventEnd()
		}

		setClock(clock)
		setDisplay(!reached ? display : 60 - (fullday - remain) + '')
	}

	function calc() {
		// correct time offset
		var now = new Date().getTime() - sync.offset

		// if passed, set to tomorrow
		if (now > goal) goal += fullday * 1e3

		// calc remaining seconds
		let remain = Math.floor((goal - now) / 1000)

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

	useEffect(() => {
		goal = new Date().setHours(...target)
		// goal = new Date(Date.now() + 3e3).getTime()

		let interval = setInterval(() => tick(), 100)

		return () => clearInterval(interval)
	}, [])

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

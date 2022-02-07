import { useContext, useState } from 'react'

import Counter from '../Counter/Counter'
import Eyes from '../Eyes/Eyes'
import Player from '../Player/Player'
import Chat from '../Chat/Chat'
import Promo from '../Promo/Promo'

import pkg from '../../../package.json'

import GaContext from '../../contexts/Ga.ctx'
import SettingsContext from '../../contexts/Settings.ctx'

import './style.css'

// fetch and update promo properties

var promo: {
	id: number
	hidden: boolean
	thumb: string
	link: string
	header: string
	content: string
}

fetch('/promo.json')
	.then((data) => data.json())
	.catch((err) => {
		return { hidden: true }
	})
	.then((json) => {
		promo = json
	})

type HomeProps = {
	sync: sync
	count: number
	invisible: number
}

function Home({ sync, count, invisible }: HomeProps) {
	let ga = useContext(GaContext),
		{ settings } = useContext(SettingsContext)

	const [event, setEvent] = useState(false),
		[elapsed, setElapsed] = useState(0)

	function eventStart(late: number) {
		setEvent(true)
		setElapsed(late)

		ga.event({
			category: '2137',
			action: 'Event Start',
			label: `${late}s late`,
			value: late,
			nonInteraction: true,
		})
	}

	function eventEnd() {
		setEvent(false)
		ga.event({
			category: '2137',
			action: 'Event End',
			nonInteraction: true,
		})
	}

	console.log(settings['promo-' + 3])

	return (
		<div
			className={[event ? 'event' : '', settings.rainbow ? 'rainbow' : ''].join(
				' '
			)}
		>
			<Counter
				doClock={settings.clock}
				doDisplay={settings.display}
				target={[20, 30, 0, 0]}
				onEventStart={(elapsed: number) => {
					eventStart(elapsed)
				}}
				onEventEnd={() => {
					eventEnd()
				}}
				sync={sync}
			/>

			<Player
				elapsed={elapsed}
				event={event}
				doMusic={settings.music}
				url="/media/barka.ogg"
			/>

			<Eyes count={count} invisible={invisible} show={settings.eyes} />

			{settings.chat && <Chat show={settings.chat} />}

			{promo && (
				<Promo {...promo} closedDefault={settings['promo-' + promo.id]} />
			)}

			<div className="clear"></div>

			<span className="copyright">iledopapiezowej © 2020 v{pkg.version}</span>
		</div>
	)
}

export default Home

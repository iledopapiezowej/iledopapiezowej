import { useContext, useState } from 'react'

import { syncData } from '../../modules/sync'

import GaContext from '../../contexts/Ga.ctx'
import SettingsContext from '../../contexts/Settings.ctx'

import Counter from '../Counter/Counter'
import Eyes from '../Eyes/Eyes'
import Player from '../Player/Player'
import Chat from '../Chat/Chat'
import Promo from '../Promo/Promo'

import './style.css'

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
	.catch(() => {
		return { hidden: true }
	})
	.then((json) => {
		promo = json
	})

type HomeProps = {
	sync: syncData
	count: number
}

function Home({ sync, count }: HomeProps) {
	let ga = useContext(GaContext),
		{ settings } = useContext(SettingsContext)

	const [event, setEvent] = useState(false),
		[elapsed, setElapsed] = useState(0)

	const tagname =
		process.env.REACT_APP_GITHUB_SHA?.slice(0, 7) ??
		(process.env.NODE_ENV === 'production' ? 'release' : 'dev')

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

	return (
		<div
			className={[event ? 'event' : '', settings.rainbow ? 'rainbow' : ''].join(
				' '
			)}
		>
			<Counter
				doClock={settings.clock}
				doDisplay={settings.display}
				target={[21, 37, 0, 0]}
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

			<Eyes count={count} show={settings.eyes} />

			{settings.chat && <Chat show={settings.chat} />}

			{promo && (
				<Promo {...promo} closedDefault={settings['promo-' + promo.id]} />
			)}

			<div className="clear"></div>

			<span className="copyright">iledopapiezowej © 2020 #{tagname}</span>
		</div>
	)
}

export default Home

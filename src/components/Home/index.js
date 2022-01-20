import React, { useContext, useState } from 'react'

import Counter from '../Counter'
import Eyes from '../Eyes'
import Player from '../Player'
import Chat from '../Chat'
import Promo from '../Promo'

import pkg from '../../../package.json'

import GaContext from '../../contexts/Ga'
import SettingsContext from '../../contexts/Settings'

import './style.css'

// fetch and update promo properties

var promo = { hidden: true }

fetch('/promo.json')
	.then((data) => {
		return data.json()
	})
	.then((json) => {
		promo = {
			hidden: false,
			...promo,
			...json,
		}
	})

function Home(props) {
	let ga = useContext(GaContext),
		settings = useContext(SettingsContext)

	const [event, setEvent] = useState(false),
		[elapsed, setElapsed] = useState(0)

	function eventStart(elapsed) {
		setEvent(true)
		setElapsed(elapsed)
		ga.event({
			category: '2137',
			action: 'Event Start',
			label: `${elapsed}s late`,
			value: elapsed,
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
			className={[
				event ? 'event' : '',
				settings.values.rainbow ? 'rainbow' : '',
			].join(' ')}
		>
			<Counter
				doClock={settings.values.clock}
				doDisplay={settings.values.display}
				onEventStart={(elapsed) => {
					eventStart(elapsed)
				}}
				onEventEnd={() => {
					eventEnd()
				}}
				sync={props.sync}
			/>

			<Player elapsed={elapsed} event={event} doMusic={settings.values.music} />

			<Eyes
				count={props.count}
				invisible={props.invisible}
				show={settings.values.eyes}
			/>

			{settings.values.chat && (
				<Chat socket={props.socket} show={settings.values.chat} />
			)}

			<Promo {...promo} closedDefault={settings.values['promo-' + promo.id]} />

			<div className="clear"></div>

			<span className="copyright">iledopapiezowej © 2020 v{pkg.version}</span>
		</div>
	)
}

export default Home

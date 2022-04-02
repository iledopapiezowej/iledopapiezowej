import { useEffect, useState } from 'react'

import { ReactComponent as Play } from './play.svg'
import { ReactComponent as Pause } from './pause.svg'
import { ReactComponent as VolumeFull } from './volume-full.svg'
import { ReactComponent as VolumeMiddle } from './volume-middle.svg'
import { ReactComponent as VolumeMute } from './volume-mute.svg'
import { ReactComponent as Sine } from './sine.svg'

import './style.css'

const maxVolume = 8

type playerProps = {
	event: boolean
	elapsed: number
	doMusic: boolean
	url: string
}

function Player({
	event = false,
	elapsed = 0,
	doMusic = false,
	url,
}: playerProps) {
	const [playing, setPlaying] = useState(false),
		[volume, setVolume] = useState(4),
		[audio] = useState(new Audio(url))

	// audio.onpause = () => setPlaying(false)

	function toggle() {
		playing ? setPlaying(false) : setPlaying(true)
	}

	function bumpVolume() {
		let nvolume = volume - 1
		if (nvolume < 0) nvolume = maxVolume
		setVolume(nvolume)
		audio.volume = nvolume / maxVolume
	}

	useEffect(() => {
		console.log(doMusic, event)
		if (doMusic)
			if (event) {
				audio.currentTime = elapsed
				if (elapsed == 0) return setPlaying(true)
			}

		return setPlaying(false)
	}, [event, doMusic, elapsed]) // eslint-disable-line

	useEffect(() => {
		playing ? audio.play() : audio.pause()
	}, [playing])

	let V
	if (volume >= maxVolume) V = <VolumeFull />
	if (volume < maxVolume) V = <VolumeMiddle />
	if (volume <= 0) V = <VolumeMute />

	return (
		<div className="audio" data-playing={playing}>
			<div
				className="button playpause"
				onClick={() => toggle()}
				data-tooltip={playing ? 'Pause' : 'Play'}
			>
				{playing ? <Pause /> : <Play />}
			</div>
			<div className="button sine">
				<Sine />
			</div>
			<div
				className="button volume"
				onClick={() => {
					bumpVolume()
				}}
				data-tooltip={`Volume: ${volume}/${maxVolume}`}
			>
				{V}
			</div>
		</div>
	)
}

export default Player

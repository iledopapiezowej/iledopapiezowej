import { useContext, useEffect, useState } from 'react'

import GaContext from '../../contexts/Ga.ctx'
import SettingsContext from '../../contexts/Settings.ctx'

import './style.css'
import { ReactComponent as CaretUp } from './caret-up.svg'
import { ReactComponent as Close } from './close.svg'

type promoProps = {
	hidden: boolean
	closedDefault: boolean
	header: string
	link: string
	thumb: string
	content: string
	id: number
}

function Promo({
	hidden = true,
	closedDefault = false,
	header,
	link,
	thumb,
	content,
	id,
}: promoProps) {
	const { updateSettings } = useContext(SettingsContext),
		ga = useContext(GaContext)

	const [open, setOpen] = useState(false),
		[closed, setClosed] = useState(false)

	useEffect(() => {
		if (closed) {
			updateSettings('promo-' + id, closed)
		}
	}, [closed]) // eslint-disable-line

	return (
		<div
			className={[
				'promo',
				hidden ? 'hidden' : '',
				open ? 'open' : '',
				closed || closedDefault ? 'closed' : '',
			].join(' ')}
			onClick={() => {
				if (!open) {
					setOpen(true)
					ga.event({
						category: 'Promo',
						action: 'Opened Modal',
						label: header,
					})
				}
			}}
		>
			<img className="thumb" src={thumb} alt="nagłówek promocji" />

			<span className="header">
				{header}

				{open ? (
					<Close
						onClick={() => {
							setOpen(false)
							setClosed(true)
						}}
					/>
				) : (
					<CaretUp />
				)}
			</span>

			<span className="more">Czytaj więcej...</span>

			<span className="sub">
				<a
					target="_blank"
					rel="noreferrer"
					href={link}
					onClick={() => {
						ga.event({
							category: 'Promo',
							action: 'Clicked Link',
							label: link,
						})
					}}
				>
					{link}
				</a>
			</span>

			<div className="clear"></div>

			<div className="content">{content}</div>
		</div>
	)
}

export default Promo

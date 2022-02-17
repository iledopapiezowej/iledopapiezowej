import { useState } from 'react'

import Checkbox from '../Checkbox/Checkbox'

import { labelType } from './Settings'

function Label({ caption, desc }: labelType) {
	return (
		<label className="label text">
			<span className="caption">{caption}</span>
			<span className="desc">{desc}</span>
		</label>
	)
}

function LabelLink({ caption, external, desc, href = '#' }: labelType) {
	return (
		<label className="label text link">
			<span className="caption">{caption}</span>
			<a href={href} target={external ? '_blank' : '_self'} rel="noreferrer">
				<span className="desc">{desc ?? href}</span>
			</a>
		</label>
	)
}

function Field({ caption, content }: { caption: string; content?: string }) {
	return (
		<label className="label text field">
			<span className="header">{caption}</span>
			<div className="content">{content ?? ''}</div>
		</label>
	)
}

function Toggle({
	id = '',
	desc = '',
	caption = '',
	def = true,
	onClick = function (id: string, checked: boolean) {},
}: {
	id: string
	desc: string
	caption: string
	def: boolean
	onClick: (id: string, checked: boolean) => void
}) {
	const [checked, setChecked] = useState(def)

	function click() {
		setChecked((checked) => !checked)
		onClick(id, !checked)
	}

	return (
		<label
			className={['label', 'toggle', checked ? 'checked' : ''].join(' ')}
			onClick={click}
		>
			<Checkbox checked={checked} />
			<span className="caption">{caption}</span>
			<span className="desc">{desc}</span>
		</label>
	)
}

export { Label, LabelLink, Field, Toggle }

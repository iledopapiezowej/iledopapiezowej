import { useState } from 'react'

import { ReactComponent as Box } from './checkbox.svg'

import './style.css'

type checkboxProps = {
	checked: boolean
	onClick?: (checked: boolean) => void
}

function Checkbox({ checked = false, onClick }: checkboxProps) {
	const [status, setStatus] = useState(checked)

	return (
		<Box
			className={checked ? 'checked' : ''}
			onClick={() => {
				setStatus(!status)
				onClick && onClick(!status)
			}}
			data-testid="checkbox"
		/>
	)
}

export default Checkbox

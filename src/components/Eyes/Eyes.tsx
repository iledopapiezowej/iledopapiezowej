import './style.css'

type eyesProps = {
	count: number
	show: boolean
}

function Eyes({ count = 0, show = false }: eyesProps) {
	return (
		<div
			className={['eyes', show || count < 1 ? '' : 'low'].join(' ')}
			data-count={count}
			data-testid="eyes"
			title={`${count} osób`}
		></div>
	)
}

export default Eyes

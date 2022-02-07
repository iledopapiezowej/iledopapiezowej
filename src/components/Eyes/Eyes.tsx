import './style.css'

type eyesProps = {
	count: number
	invisible: number
	show: boolean
}

function Eyes({ count = 0, invisible = 0, show = false }: eyesProps) {
	return (
		<div
			className={['eyes', show || count < 1 ? '' : 'low'].join(' ')}
			data-count={count}
			data-testid="eyes"
			title={`${count} osób, ${(
				100 -
				(invisible / count) * 100
			).toFixed()}% aktywne`}
		></div>
	)
}

export default Eyes

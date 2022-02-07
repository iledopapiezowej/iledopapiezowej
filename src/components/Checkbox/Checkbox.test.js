import { fireEvent, render } from '@testing-library/react'

import Checkbox from './Checkbox'

test('renders and returns correctly', async () => {
	let result,
		def = false

	const { container } = render(
		<Checkbox checked={def} onClick={(checked) => (result = checked)} />
	)

	expect(result).toBe(undefined)

	fireEvent.click(container.firstChild)

	expect(result).toBe(!def)

	fireEvent.click(container.firstChild)

	expect(result).toBe(def)
})

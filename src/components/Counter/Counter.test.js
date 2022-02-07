import { render, waitFor } from '@testing-library/react'

import Counter from './Counter'

const sync = {
	offset: 1e3,
}

function offset(n = 0) {
	const now = new Date(Date.now() - n * 1e3)

	return [now.getHours(), now.getMinutes(), now.getSeconds()]
}

test('renders clock and different countdown formats', async () => {
	const { getByTestId, rerender } = render(
		<Counter
			doClock={true}
			doDisplay={true}
			target={offset(3600)}
			sync={sync}
		/>
	)

	await waitFor(() =>
		expect(getByTestId('clock').innerHTML).toMatch(/^\d{2}:\d{2}$/)
	)

	expect(getByTestId('display').innerHTML).toMatch(/^\d{2}:\d{2}:\d{2}$/)

	rerender(
		<Counter
			doClock={true}
			doDisplay={true}
			target={offset(-50 * 60)}
			sync={sync}
		/>
	)

	await waitFor(() =>
		expect(getByTestId('display').innerHTML).toMatch(/^\d{2}:\d{2}$/)
	)

	rerender(
		<Counter doClock={true} doDisplay={true} target={offset(-50)} sync={sync} />
	)

	await waitFor(() =>
		expect(getByTestId('display').innerHTML).toMatch(/^\d{2}$/)
	)
})

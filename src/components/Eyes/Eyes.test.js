import { render } from '@testing-library/react'

import Eyes from './Eyes'

test('render viewers count', () => {
	const { container } = render(<Eyes />)

	expect(container.firstChild.classList.contains('eyes')).toBe(true)

	expect(
		parseInt(container.firstChild.getAttribute('data-count'))
	).toBeGreaterThanOrEqual(0)
})

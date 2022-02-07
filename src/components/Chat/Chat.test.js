import { fireEvent, render } from '@testing-library/react'
import socketContext from '../../contexts/Socket.ctx'
import Socket from '../../Socket'

import Chat from './Chat'

const results = {}

const socket = {
	latest: [
		{
			nick: 'nick',
			role: 'role',
			uid: 'myID',
			content: 'content',
			time: new Date().toISOString(),
			type: 'chat',
			mid: 'mid1',
		},
		{
			nick: 'nick',
			role: 'role',
			uid: 'notmyID',
			content: 'content',
			time: new Date().toISOString(),
			type: 'chat',
			mid: 'mid2',
		},
	],
	send: (payload) => (results.send = payload),
	addListener: (name, callback) => (results.addListener = { name, callback }),
	removeListener: (name, callback) =>
		(results.removeListener = { name, callback }),
	subscribe: (name) => (results.subscribe = name),
	unsubscribe: (name) => (results.unsubscribe = name),
	id: 'myID',
}

window.HTMLElement.prototype.scrollIntoView = jest.fn()

const { getByTestId, getByRole, unmount } = render(
	<socketContext.Provider value={socket}>
		<Chat />
	</socketContext.Provider>
)

test('renders and send a message correctly', () => {
	// subscribes to module
	expect(results.subscribe).toBe('chat')
	expect(results.unsubscribe).toBe(undefined)

	// renders self message correctly
	const myMessage = getByTestId('messages').firstChild

	expect(myMessage.getAttribute('data-self')).toBe('true') // is self

	expect(myMessage.childNodes[0].textContent).toBe('nick') // correct nick
	expect(myMessage.childNodes[0].classList).toContain('role') // correct role
	expect(myMessage.childNodes[0].getAttribute('data-id')).toBe('mid1') // correct ID

	expect(myMessage.childNodes[1].textContent).toBe('content') // correct content

	expect(myMessage.childNodes[2].textContent).toMatch(/^\d{2}:\d{2}:\d{2}$/) // correct timestamp format

	// renders external message correctly
	const notMyMessage = getByTestId('messages').children[1]

	expect(notMyMessage.childNodes[0].getAttribute('data-id')).toBe('mid2')
	expect(notMyMessage.getAttribute('data-self')).toBe('false')

	// sends a message
	const input = getByRole('textbox'),
		send = getByRole('button')

	expect(results.send).toBe(undefined)

	fireEvent.change(input, { target: { value: 'message content' } })

	fireEvent.click(send)

	expect(results.send).toStrictEqual({
		type: 'chat',
		content: 'message content',
	})
})

test('unmounts and unsubscribes', () => {
	unmount()

	expect(results.unsubscribe).toBe('chat')

	expect(results.removeListener.name).toStrictEqual(results.addListener.name)
	expect(results.removeListener.callback).toStrictEqual(results.addListener)
})

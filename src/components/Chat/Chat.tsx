import { useContext, useEffect, useRef, useState } from 'react'

import { EVENT } from '../../Socket'
import { messageChunk } from '../../modules/chat'

import SocketContext from '../../contexts/Socket.ctx'

import { ReactComponent as Send } from './send.svg'
import { ReactComponent as Down } from './down.svg'
import './index.css'
import './roles.css'

type messageProps = messageChunk & { self: boolean }

type chatProps = {
	show?: boolean
	messageLimit?: number
}

function Message({
	mid,
	time: timestamp,
	nick = 'local',
	role = '',
	self = false,
	content = '',
}: messageProps) {
	const time = new Date(timestamp)

	return (
		<div className="message" data-self={self}>
			<span className={['nick', role].join(' ')} data-id={mid}>
				{nick}
			</span>

			<span className="content">{content}</span>
			<span className="time" title={time.toString()}>
				{time.getHours().toString().padStart(2, '0') +
					':' +
					time.getMinutes().toString().padStart(2, '0') +
					':' +
					time.getSeconds().toString().padStart(2, '0')}
			</span>
		</div>
	)
}

var newMessage = false,
	scrollBefore = 0

function Chat({ show = true, messageLimit = 300 }: chatProps) {
	const socket = useContext(SocketContext)

	const [messages, setMessages] = useState(socket.modules.chat.messages),
		[autoscroll, setAutoscroll] = useState(true)

	const list = useRef<HTMLDivElement>(null),
		last = useRef<HTMLDivElement>(null),
		input = useRef<HTMLInputElement>(null)

	function scroll(force: boolean = false) {
		if (autoscroll || force)
			if (list.current)
				if (list.current.lastChild)
					last.current?.scrollIntoView({
						// behavior: 'smooth',
						block: 'end',
						inline: 'nearest',
					})
	}

	function send() {
		let content = (input && input.current && input.current.value) ?? ''

		if (content.length < 1) return

		socket.send({
			type: 'chat',
			content,
		})

		input && input.current && (input.current.value = '')
		scroll(true)
	}

	useEffect(() => {
		let listener = socket.addListener(EVENT.MODULE, 'chat-message', () => {
			setMessages(socket.modules.chat.messages.slice(-messageLimit))

			newMessage = true
			scroll()
		})

		socket.subscribe('chat')

		return () => {
			socket.unsubscribe('chat')
			socket.removeListener(EVENT.MODULE, 'chat-message', listener)
		}
	}, []) // eslint-disable-line

	return (
		<div className={['chat', show ? '' : 'hidden'].join(' ')}>
			<div
				className="messages"
				ref={list}
				data-testid="messages"
				onScroll={(e) => {
					const target = e.target as HTMLDivElement

					// only on user scroll
					if (!newMessage) {
						// user scrolls up
						if (target.scrollTop < scrollBefore) {
							setAutoscroll(false)
						}

						// user scrolls to bottom
						if (
							target.scrollTop ===
							target.scrollHeight - target.offsetHeight
						) {
							setAutoscroll(true)
						}
					}

					newMessage = false
					scrollBefore = target.scrollTop
				}}
			>
				{messages.map((message: messageChunk) => (
					<Message
						key={message.mid}
						self={message.uid === socket.modules.chat.id}
						{...message}
					/>
				))}
				<div ref={last} className="last"></div>
			</div>

			<Down
				className="scrolllock"
				data-enabled={!autoscroll}
				onClick={() => {
					setAutoscroll(true)
					scroll(true)
				}}
			/>

			<div className="input">
				<input
					type="text"
					ref={input}
					maxLength={120}
					autoComplete="off"
					placeholder="czat"
					onKeyDown={(e) => {
						if (!e.shiftKey) if (e.key === 'Enter') send()
					}}
				/>

				<button
					className="send"
					onClick={() => {
						send()
					}}
				>
					<Send />
				</button>
			</div>
		</div>
	)
}

export default Chat

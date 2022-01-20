import React, { useContext, useEffect, useRef, useState } from 'react'

import { ReactComponent as Send } from './send.svg'
import { ReactComponent as Down } from './down.svg'

import './index.css'
import './roles.css'
import Socket from '../../contexts/Socket.js'

function Message({
	id = null,
	time = '',
	nick = 'local',
	role = '',
	self = false,
	content = '',
}) {
	time = new Date(time)
	return (
		<div className="message" data-self={self}>
			<span className={['nick', role].join(' ')} data-id={id}>
				{nick}
			</span>

			<span className="content">{content}</span>
			<span className="time" title={time.toString()}>
				{time.toISOString().slice(11, -5)}
			</span>
		</div>
	)
}

var newMessage = false,
	scrollBefore = null

function Chat({ show = true, messageLimit = 300 }) {
	const socket = useContext(Socket)

	const [messages, setMessages] = useState(socket.latest),
		[autoscroll, setAutoscroll] = useState(true)

	const list = useRef(null),
		last = useRef(null),
		input = useRef(null)

	function scroll() {
		if (autoscroll)
			if (list.current) {
				if (list.current.lastChild)
					last.current.scrollIntoView({
						// behavior: 'smooth',
						block: 'end',
						inline: 'nearest',
					})
			}
	}

	function command(args) {
		if (args[0] === 'nick') {
			console.log(args[1])
			return true
		}

		return true
	}

	function send() {
		let content = input.current.value

		if (content.length < 1) return

		if (content.startsWith('/')) {
			if (!command(content.slice(1).split(' '))) return
		}

		socket.send({
			type: 'chat',
			content: content,
		})

		input.current.value = ''
	}

	useEffect(() => {
		let e = socket.addListener('onChatReceive', () => {
			setMessages(socket.latest.slice(-messageLimit))

			newMessage = true
			scroll()
		})

		socket.subscribe('chat')

		return () => {
			socket.unsubscribe('chat')
			socket.removeListener('onChatReceive', e)
		}
	}, []) // eslint-disable-line

	return (
		<div className={['chat', show ? '' : 'hidden'].join(' ')}>
			<div
				className="messages"
				ref={list}
				onScroll={(e) => {
					// only on user scroll
					if (!newMessage) {
						// user scrolls up
						if (e.target.scrollTop < scrollBefore) {
							setAutoscroll(false)
						}

						// user scrolls to bottom
						if (
							e.target.scrollTop ===
							e.target.scrollHeight - e.target.offsetHeight
						) {
							setAutoscroll(true)
						}
					}

					newMessage = false
					scrollBefore = e.target.scrollTop
				}}
			>
				{messages.map((message) => (
					<Message
						key={message.mid}
						self={message.uid === socket.id}
						{...message}
					/>
				))}
				<div ref={last} className="last"></div>
			</div>

			<Down
				className="scrolllock"
				data-enabled={autoscroll}
				onClick={() => {
					scroll()
					setAutoscroll(true)
				}}
			/>

			<div className="input">
				<input
					type="text"
					ref={input}
					maxLength="120"
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

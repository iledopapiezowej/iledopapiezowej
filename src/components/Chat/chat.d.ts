type messageProps = messageChunk & { self: boolean }

type chatProps = {
	show?: boolean
	messageLimit?: number
}

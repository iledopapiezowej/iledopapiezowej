import { module } from '../Socket'

const { REACT_APP_CAPTCHA_KEY } = process.env

var tokens: { [action: string]: string } = {}

function getCaptcha(action: string): PromiseLike<string> {
	console.info('Requesting captcha token')
	return window.grecaptcha
		.execute(REACT_APP_CAPTCHA_KEY, { action })
		.then((token: string) => {
			console.info('Received captcha')
			tokens[action] = token
			return token
		})
}

const captcha: module = {
	label: 'captcha',

	connect() {},

	leave() {
		tokens = {}
	},

	send() {},
	receive(socket, chunk) {
		getCaptcha(chunk.action ?? 'general').then((token) => {
			socket.send({
				type: 'captcha',
				token,
			})
		})
	},
}

export default captcha

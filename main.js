const VERSION = 'v1.17.1'

var Elements = {
	display: undefined,
	clock: undefined,
	audio: undefined,
	ver: undefined,
	chat: undefined
},
	Papiezowa = {
		reached: false,
		goal: new Date,
		remain: -1,
		_onEvents: [],
		_offEvents: [],
		_on() {
			for (let e of this._onEvents) {
				e()
			}
		},
		_off() {
			for (let e of this._offEvents) {
				e()
			}
		},
		tick() {
			var now = new Date
			pad = x => ("0" + parseInt(x)).substr(-2)

			if (new Date > Papiezowa.goal) Papiezowa.goal.setDate(Papiezowa.goal.getDate() + 1)

			this.remain = ((this.goal - now + Socket.sync.offset) / 1000)

			var h = parseInt((this.remain / 60 / 60) % 60),
				m = parseInt((this.remain / 60) % 60),
				s = parseInt(this.remain % 60)

			if (h > 0) m = pad(m)
			if ((h > 0) || (m > 0)) s = pad(s)

			Elements.clock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`
			Elements.display.textContent = this.reached ? `${s}` : `${h > 0 ? `${h}:${m}:${s}` : m > 0 ? `${m}:${s}` : s}`

			if (this.remain > 86340) {	// is goal 
				if (!this.reached) {	// is reached already?
					this.reached = true
					this._on()
				}
			} else if (this.reached) {
				this.reached = false
				this._off()
			}
			setTimeout(() => {
				this.tick()
			}, 10)	// tick interval
		},
		addOn(e) {
			this._onEvents.push(e)
		},
		addOff(e) {
			this._offEvents.push(e)
		}
	},
	Settings = {
		_values: {
			dark: false,
			music: true,
			rainbow: true,
			clock: true,
			display: true,
			eyes: true,
			chat: true
		},
		get(id) {
			return this._values[id]
		},
		set(id, value) {
			this._values[id] = value
			this._set(id, value)
			this.trigger(id)
		},
		_get(id) {
			return JSON.parse(localStorage[`settings-${id}`] || null)
		},
		_set(id, value) {
			localStorage[`settings-${id}`] = JSON.stringify(value)
		},
		refresh() {
			for (let id in this._values) {
				let value = this._get(id)	// get value from localStorage
				if (value !== null) this._values[id] = value	// save if exists
				else this._set(id, this._values[id])	// set default value to localStorage

				document.querySelector(`.toggle[data-for="${id}"]>input`).checked = this._values[id]	// update the checkbox
				this.trigger(id)
			}
		},
		trigger(id, value) {
			if (typeof value == 'undefined') value = this._values[id]
			switch (id) {
				case 'dark':
					if (value) document.querySelector('body').classList.add('dark')
					else document.querySelector('body').classList.remove('dark')
					break;
				case 'clock':
					if (value) document.querySelector('#lines').classList.add('clock')
					else document.querySelector('#lines').classList.remove('clock')
					break;
				case 'display':
					if (value) document.querySelector('#lines').classList.add('display')
					else document.querySelector('#lines').classList.remove('display')
					break;
				case 'eyes':
					if (!value) document.querySelector('#eyes').classList.add('hidden')
					else document.querySelector('#eyes').classList.remove('hidden')
					break;
				case 'rainbow':
					if (value) document.querySelector('body').classList.add('rainbow')
					else document.querySelector('body').classList.remove('rainbow')
					break;
				case 'chat':
					if(!value) document.querySelector('#chat').classList.add('hidden')
					else document.querySelector('#chat').classList.remove('hidden')
			}
		}
	},
	Socket = {
		ws: null,
		sync: {
			begin: null,
			end: null,
			rtt: null,
			ping: null,
			diff: null,
			offset: null
		},
		retries: 0,
		send(object) {
			if(this.ws.OPEN) return this.ws.send(JSON.stringify(object))
		},
		open() {
			this.ws = new WebSocket(`wss://${location.host}/ws/`)

			this.ws.onopen = () => {
				console.info(`Socket connected`)
				if(this.retries > 0) Chat.receive({
					nick: 'local',
					role: 'root',
					content: "Połączono"
				})
				Socket.visibility(window.document.visibilityState === 'visible')

				// re-set nick if saved
				if(localStorage['nick']){
					if(localStorage['nick'] != 'undefined')
					Chat.send(`/nick ${localStorage['nick']}`)
				}

				// re-set nick if saved
				if(localStorage['login']){
					if(localStorage['login'] != 'undefined undefined')
					Chat.send(`/login ${localStorage['login']}`)
				}
			}

			this.ws.onclose = () => {
				console.info(`Socket disconnected`)
				Chat.receive({
					nick: 'local',
					role: 'root',
					content: "Rozłączono"
				})
				Elements.eyes.classList.add('low')
				this.reopen()
			}

			this.ws.onmessage = (e) => {
				let data = JSON.parse(e.data)

				if (data.type == 'count') {
					Elements.eyes.setAttribute('data-count', data.count)
					Elements.eyes.setAttribute('title', `${data.count} osób, ${100-(data.invisible/data.count*100).toFixed()}% aktywne`)
					if (data.count < 0) Elements.eyes.classList.add('low')
					else Elements.eyes.classList.remove('low')

				} else if (data.type == 'chat') {
					Chat.receive(data)
				} else if (data.type == 'sync.begin') {
					this.sync.begin = performance.now()
					this.send({
						type: "sync.received"
					})

				} else if (data.type == 'sync.end') {
					this.sync.end = performance.now()
					this.sync.rtt = this.sync.end - this.sync.begin
					this.sync.ping = this.sync.rtt / 2
					this.sync.diff = (Date.now() - data.time)
					this.sync.offset = this.sync.diff - this.sync.ping

					console.info(`Time synced, offset: ${this.sync.offset.toFixed(3)}ms with ping: ${this.sync.ping.toFixed(3)}`)
					for (let i in this.sync) {
						webLog(i, ':\t', this.sync[i].toFixed(3))
					}

				} else if (data.type == 'version') {
					webLog('Server version: ', data.version)
				} else if (data.type == 'id') {
					this.id = data.id
					webLog('Connection ID: ', data.id)
				}

			}

		},
		visibility(visible){
			this.send({
				type: 'visibility',
				visible: visible
			})
		},
		reopen() {
			if(this.retries > 5) {
				console.log(`Socket stopped, too many reconnect attempts`)
			} else setTimeout(() => {
				console.info(`Socket attempting reconnect`)
				this.retries++
				this.open()
			}, 4e3)
		}
	},
	Chat = {
		limit: 500,
		scrollBack: 350,
		special: {
			papor: '<img src="/media/icon_48.png">'
		},
		receive(data){
			Elements.chat.append(this._el(data))
			if(((Elements.chat.scrollHeight - Elements.chat.clientHeight) - Elements.chat.scrollTop) < this.scrollBack)
			Elements.chat.scrollTop = Elements.chat.scrollHeight
			if(Elements.chat.childElementCount > this.limit){
				Elements.chat.firstElementChild.remove()
			}
		},
		send(override){
			var content = override ? override : Elements.message.value
			if(content.length<1) return
			Elements.message.value = ''

			if(content.startsWith('/')){
				let arg = content.slice(1).split(' ')
				switch(arg[0]){
					case 'nick':
						localStorage['nick'] = arg[1]
						break;
					case 'login':
						localStorage['login'] = `${arg[1]} ${arg[2]}`
						break;
					case 'autoban':
						document.querySelector('#messages').onclick = function(e){
							if(e.target.classList.contains('nick'))
							Chat.send('/ban ' + e.target.getAttribute('title'))
						}
						return
						break;
				}
			}

			Socket.send({
				type: 'chat',
				content: content
			})

		},
		_el(data){
			let message = document.createElement('div'),
				nick = document.createElement('span'),
				content = document.createElement('span'),
				time = document.createElement('span')

			let now = data.time ? new Date(data.time) : new Date(),
			h = now.getHours(),
			m = now.getMinutes(),
			s = now.getSeconds()

			message.classList.add('message')
			nick.classList.add('nick')
			nick.classList.add(data.role)
			nick.setAttribute('title', data.id)
			content.classList.add('content')
			time.classList.add('time')
			time.setAttribute('title', now)

			if(data.id === Socket.id) message.classList.add('self')
			nick.append(data.nick)

			// for(let special in this.special){
			// 	data.innerHTML = data.content.replace(`:${special}:`, this.special[special])
			// }
			if(data.role =='owner' && data.content.startsWith('\\')){
				content.innerHTML = data.content
			} else content.textContent = data.content

			time.append(`${h<10 ? '0' : ''}${h}:${m<10 ? '0' : ''}${m}:${s<10 ? '0' : ''}${s}`)

			message.append(nick, content, time)

			return message
		}
	}

function webLog(...data) {
	console.log(...data)
	document.querySelector('#logs').append(...data, '\n')
}

window.onload = function () {

	window.document.addEventListener("visibilitychange", function(e) {
		Socket.visibility(window.document.visibilityState === 'visible')
	});

	Elements = {
		display: document.querySelector('#display'),
		clock: document.querySelector('#clock'),
		audio: document.querySelector('#audio'),
		ver: document.querySelector('#ver'),
		eyes: document.querySelector('#eyes'),
		server_info: document.querySelector('#server_info'),
		chat: document.querySelector('#messages'),
		message: document.querySelector('#message')
	}

	// default goal time
	Papiezowa.goal.setHours(21, 37, 0)

	// default events
	Papiezowa.addOn(function () {
		if (Settings.get('music')) Elements.audio.play()
		document.body.classList.add("event")
		Elements.audio.classList.add('event')
	})

	Papiezowa.addOff(function () {
		document.body.classList.remove("event")
		if (Elements.audio.paused) Elements.audio.classList.remove('event')
	})

	// audio player settings
	Elements.audio.volume = 0.75

	Elements.audio.onpause = function () {
		if (!Papiezowa.reached) Elements.audio.classList.remove('event')
	}

	// fix time if joined in the middle
	Papiezowa.addOn(function () {
		let offset = (60 - (parseInt(Papiezowa.remain) - 86340))
		Elements.audio.currentTime = offset < 2 ? 0 : offset
	})

	// settings
	Settings.refresh()

	// socket
	Socket.open()

	document.querySelector('#settings').onclick = function (e) {
		if (e.target.getAttribute('type') == 'checkbox') {
			Settings.set(e.target.parentElement.getAttribute('data-for'), e.target.checked)
		}
	}

	document.querySelector('#message').onkeypress = e => {
		if(!e.shiftKey) if(e.key == 'Enter'){
			Chat.send()
		}
	}
	document.querySelector('#send').onclick = e => {Chat.send()}

	// add 'dev' marker
	if (VERSION.endsWith('dev')) ver.classList.add('dev')
	else Elements.ver.classList.add('stable')
	Elements.ver.textContent = VERSION

	// clock tick, goal detection
	Papiezowa.tick()
}
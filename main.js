const VERSION = 'v1.16.1dev'

var Elements = {
	display: undefined,
	clock: undefined,
	audio: undefined,
	ver: undefined
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

			this.remain = ((this.goal - now) / 1000)

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
			eyes: true
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
					if (!value) document.querySelector('#clock').classList.add('hidden')
					else document.querySelector('#clock').classList.remove('hidden')
					break;
				case 'display':
					if (!value) document.querySelector('#display').classList.add('hidden')
					else document.querySelector('#display').classList.remove('hidden')
					break;
				case 'eyes':
					if (!value) document.querySelector('#eyes').classList.add('hidden')
					else document.querySelector('#eyes').classList.remove('hidden')
					break;
				case 'rainbow':
					if (value) document.querySelector('body').classList.add('allowRainbow')
					else document.querySelector('body').classList.remove('allowRainbow')
					break;
			}
		}
	},
	Socket = {
		ws: null,
		open(){
			this.ws = new WebSocket(`wss://${location.host}/ws/`)

			this.ws.onopen = () => {
				this.ws.send(new Date().getSeconds())
			}

			this.ws.onmessage = (e) => {
				Elements.eyes.setAttribute('data-count', e.data)
				if(e.data < 0) Elements.eyes.classList.add('low')
				else Elements.eyes.classList.remove('low')
			}

		}
	}

window.onload = function () {

	Elements = {
		display: document.querySelector('#display'),
		clock: document.querySelector('#clock'),
		audio: document.querySelector('#audio'),
		ver: document.querySelector('#ver'),
		eyes: document.querySelector('#eyes'),
	}

	// default goal time
	Papiezowa.goal.setHours(21, 1, 20)

	// default events
	Papiezowa.addOn(function () {
		if(Settings.get('music')) Elements.audio.play()
		document.body.classList.add("event")
		Elements.audio.classList.add('event')
	})

	Papiezowa.addOff(function () {
		document.body.classList.remove("event")
		if(Elements.audio.paused) Elements.audio.classList.remove('event')
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

	// add 'dev' marker
	if (VERSION.endsWith('dev')) ver.classList.add('dev')
	else Elements.ver.classList.add('stable')
	Elements.ver.textContent = VERSION

	// clock tick, goal detection
	Papiezowa.tick()
}
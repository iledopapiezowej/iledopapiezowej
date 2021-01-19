const VERSION = 'v1.15.5dev'

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
			}, 10)
		},
		addOn(e) {
			this._onEvents.push(e)
		},
		addOff(e) {
			this._offEvents.push(e)
		}
	}

window.onload = function () {



	Elements = {
		display: document.querySelector('#display'),
		clock: document.querySelector('#clock'),
		audio: document.querySelector('#audio'),
		ver: document.querySelector('#ver')
	}

	// default goal time
	Papiezowa.goal.setHours(21, 37, 0)

	// default events
	Papiezowa.addOn(function () {
		Elements.audio.play()
		document.body.classList.add("event")
		Elements.audio.classList.add('event')
	})

	Papiezowa.addOff(function () {
		document.body.classList.remove("event")
	})

	// audio player settings
	Elements.audio.volume = 0.75

	Elements.audio.onpause = function () {
		if (!Papiezowa.reached) Elements.audio.classList.remove('event')
	}

	// fix time if joined in the middle
	Papiezowa.addOn(function () {
		Elements.audio.currentTime = (60 -(parseInt(Papiezowa.remain) - 86340))
	})

	// add 'dev' marker
	if (VERSION.endsWith('dev')) ver.classList.add('dev')
	else Elements.ver.classList.add('stable')
	Elements.ver.textContent = VERSION

	// clock tick, goal detection
	Papiezowa.tick()
}